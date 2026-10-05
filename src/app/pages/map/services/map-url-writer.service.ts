import { computed, effect, inject, Injector, Service, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { DemoModeService } from '@features/demo/services/demo-mode.service';
import { StationDetailsStore } from '@features/details/store/station-details.store';
import { FavoritesStore } from '@features/favorites/store/favorites.store';
import { EMPTY_STATION_FILTERS } from '@features/filters/constants/empty-station-filters.const';
import { FiltersStore } from '@features/filters/store/filters.store';
import { AddressSearchStore } from '@features/search/store/address-search.store';
import { MapUrlState } from '@pages/map/models/ui/map-url-state.ui';
import { ParsedMapUrlState } from '@pages/map/models/ui/parsed-map-url-state.ui';
import { MapQueryParamsService } from '@pages/map/services/map-query-params.service';

@Service({ autoProvided: false })
export class MapUrlWriterService {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly queryParams = inject(MapQueryParamsService);
  private readonly detailsStore = inject(StationDetailsStore);
  private readonly filtersStore = inject(FiltersStore);
  private readonly favoritesStore = inject(FavoritesStore);
  private readonly searchStore = inject(AddressSearchStore);
  private readonly demoMode = inject(DemoModeService);

  readonly state = computed<MapUrlState>(() => {
    const favorites = this.favoritesStore.shown();
    return {
      stationId: this.detailsStore.selectedStationId(),
      query: this.searchStore.query().trim() || undefined,
      filters: this.filtersStore.filters(),
      favorites: favorites.stations.length > 0 ? favorites : undefined,
    };
  });

  private shownState: MapUrlState | undefined;
  private shownUrl = '';
  // Saved filters stay out of the URL until the user acts; favorites only appear when a heart is clicked.
  private filtersInUrl = false;
  private favoritesInUrl = false;

  start(): void {
    this.shownState = this.state();
    effect(
      () => {
        const state = this.state();
        untracked(() => this.writeChange(state));
      },
      { injector: this.injector },
    );
  }

  urlApplied({ filters }: ParsedMapUrlState): void {
    this.shownUrl = this.router.url;
    this.filtersInUrl = filters !== undefined;
  }

  linkFavoritesApplied({ favorites }: ParsedMapUrlState): void {
    this.favoritesInUrl = favorites !== undefined;
  }

  replaceUrl(): void {
    this.updateUrl(this.state(), true);
  }

  private writeChange(state: MapUrlState): void {
    const addsHistoryEntry = this.addsHistoryEntry(state);
    if (addsHistoryEntry || this.shownState?.filters !== state.filters) {
      this.filtersInUrl = true;
    }
    if (this.shownState?.favorites !== state.favorites) {
      this.favoritesInUrl = true;
    }
    this.updateUrl(state, !addsHistoryEntry);
  }

  // Back steps only for the station; the rest changes on every click.
  private addsHistoryEntry({ stationId }: MapUrlState): boolean {
    return this.shownState === undefined || this.shownState.stationId !== stationId;
  }

  private updateUrl(state: MapUrlState, replaceUrl: boolean): void {
    const urlState: MapUrlState = {
      ...state,
      filters: this.filtersInUrl ? state.filters : EMPTY_STATION_FILTERS,
      favorites: this.favoritesInUrl ? state.favorites : undefined,
    };
    const tree = this.router.createUrlTree([], {
      queryParams: { ...this.queryParams.serialize(urlState), ...this.demoMode.queryParams },
    });
    const url = this.router.serializeUrl(tree);
    this.shownState = state;
    if (url !== this.shownUrl) {
      this.shownUrl = url;
      void this.router.navigateByUrl(tree, { replaceUrl });
    }
  }
}
