import { effect, inject, Injector, Service, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { StationsStore } from '@core/store/stations.store';
import { StationDetailsStore } from '@features/details/store/station-details.store';
import { FavoritesStore } from '@features/favorites/store/favorites.store';
import { FiltersStore } from '@features/filters/store/filters.store';
import { AddressSearchStore } from '@features/search/store/address-search.store';
import { ParsedMapUrlState } from '@pages/map/models/ui/parsed-map-url-state.ui';
import { MapQueryParamsService } from '@pages/map/services/map-query-params.service';
import { MapUrlWriterService } from '@pages/map/services/map-url-writer.service';
import { MapPageStore } from '@pages/map/store/map-page.store';

@Service({ autoProvided: false })
export class MapUrlReaderService {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly queryParams = inject(MapQueryParamsService);
  private readonly writer = inject(MapUrlWriterService);
  private readonly stationsStore = inject(StationsStore);
  private readonly detailsStore = inject(StationDetailsStore);
  private readonly filtersStore = inject(FiltersStore);
  private readonly favoritesStore = inject(FavoritesStore);
  private readonly searchStore = inject(AddressSearchStore);
  private readonly mapPageStore = inject(MapPageStore);

  private readonly urlStationId = signal<number | undefined>(undefined);

  applyInitialUrl(): void {
    this.applyLinkFavorites(this.applyUrl());
  }

  start(): void {
    this.applyUrlOnBackForward();
    this.focusUrlStationWhenLoaded();
  }

  private applyUrl(): ParsedMapUrlState {
    const url = this.queryParams.parse(this.router.routerState.snapshot.root.queryParamMap);
    this.writer.urlApplied(url);
    if (url.filters) {
      this.filtersStore.showFilters(url.filters);
    }
    this.showSearch(url.query);
    this.showView(url);
    return url;
  }

  // Favorites are saved data: only a link opened in a new tab shows other ones; Back never undoes a heart.
  private applyLinkFavorites(url: ParsedMapUrlState): void {
    this.writer.linkFavoritesApplied(url);
    if (url.favorites && !this.favoritesStore.matchesSaved(url.favorites)) {
      this.favoritesStore.showShared(url.favorites);
    }
  }

  private applyUrlOnBackForward(): void {
    effect(
      () => {
        if (this.router.lastSuccessfulNavigation()?.trigger === 'popstate') {
          untracked(() => {
            this.applyUrl();
            this.writer.replaceUrl();
          });
        }
      },
      { injector: this.injector },
    );
  }

  private focusUrlStationWhenLoaded(): void {
    effect(
      () => {
        const stationId = this.urlStationId();
        if (
          stationId !== undefined &&
          this.stationsStore.status() === 'resolved' &&
          !this.searchStore.isLoading()
        ) {
          untracked(() => this.focusUrlStation(stationId));
        }
      },
      { injector: this.injector },
    );
  }

  private showSearch(query: string | undefined): void {
    if (query === this.writer.state().query) {
      return;
    }
    if (query === undefined) {
      this.searchStore.clear();
    } else {
      this.searchStore.searchAndSelectFirst(query);
    }
  }

  private showView({ stationId }: ParsedMapUrlState): void {
    if (stationId === undefined) {
      this.detailsStore.clearSelection();
      this.searchStore.closePanel();
    } else if (stationId !== this.detailsStore.selectedStationId()) {
      this.detailsStore.selectStation(stationId);
      this.searchStore.closePanel();
      this.mapPageStore.closePane();
      this.urlStationId.set(stationId);
    }
  }

  private focusUrlStation(stationId: number): void {
    this.urlStationId.set(undefined);
    if (this.detailsStore.selectedStationId() !== stationId) {
      return;
    }
    const station = this.stationsStore.findStation(stationId);
    if (station) {
      this.mapPageStore.focusOn(station);
      return;
    }
    this.detailsStore.clearSelection();
    this.writer.replaceUrl();
  }
}
