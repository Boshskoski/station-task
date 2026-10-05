import { Component, computed, inject } from '@angular/core';
import { IonContent, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { funnel, heart } from 'ionicons/icons';
import { Station } from '@core/models/ui/station/station.ui';
import { StationsStore } from '@core/store/stations.store';
import { StationDetailsDesktop } from '@features/details/components/layouts/station-details-desktop/station-details-desktop';
import { StationDetailsMobile } from '@features/details/components/layouts/station-details-mobile/station-details-mobile';
import { FavoriteChargePoint } from '@features/details/models/ui/favorite-charge-point.ui';
import { StationDetailsView } from '@features/details/models/ui/station-details-view.ui';
import { StationDetailsLayoutService } from '@features/details/services/station-details-layout.service';
import { StationDetailsStore } from '@features/details/store/station-details.store';
import { FavoritesDesktop } from '@features/favorites/components/layouts/favorites-desktop/favorites-desktop';
import { FavoritesMobile } from '@features/favorites/components/layouts/favorites-mobile/favorites-mobile';
import { FAVORITES_TRIGGER_ID } from '@features/favorites/constants/favorites-trigger-id.const';
import { FavoritesStore } from '@features/favorites/store/favorites.store';
import { FiltersDesktop } from '@features/filters/components/layouts/filters-desktop/filters-desktop';
import { FiltersMobile } from '@features/filters/components/layouts/filters-mobile/filters-mobile';
import { FILTERS_TRIGGER_ID } from '@features/filters/constants/filters-trigger-id.const';
import { StationFilterService } from '@features/filters/services/station-filter.service';
import { FiltersStore } from '@features/filters/store/filters.store';
import { LocateButton } from '@features/location/components/locate-button/locate-button';
import { LocationErrorToast } from '@features/location/components/location-error-toast/location-error-toast';
import { UserLocationStore } from '@features/location/store/user-location.store';
import { StationMap } from '@features/map/components/station-map/station-map';
import { AddressSearchResults } from '@features/search/components/address-search-results/address-search-results';
import { AddressSearch } from '@features/search/components/address-search/address-search';
import { AddressSearchStore } from '@features/search/store/address-search.store';
import { MapStatus } from '@pages/map/components/map-status/map-status';
import { MapUrlReaderService } from '@pages/map/services/map-url-reader.service';
import { MapUrlSyncService } from '@pages/map/services/map-url-sync.service';
import { MapUrlWriterService } from '@pages/map/services/map-url-writer.service';
import { MapPageStore } from '@pages/map/store/map-page.store';
import { MapPane } from '@pages/map/types/map-pane.type';
import { PageHeader } from '@shared/components/page-header/page-header';
import { ToolbarPanelButton } from '@shared/components/toolbar-panel-button/toolbar-panel-button';
import { ViewportService } from '@shared/services/viewport.service';

@Component({
  selector: 'app-map-page',
  imports: [
    IonToolbar,
    IonContent,
    PageHeader,
    MapStatus,
    StationMap,
    StationDetailsMobile,
    StationDetailsDesktop,
    FiltersDesktop,
    FiltersMobile,
    FavoritesDesktop,
    FavoritesMobile,
    AddressSearch,
    AddressSearchResults,
    LocateButton,
    LocationErrorToast,
    ToolbarPanelButton,
  ],
  templateUrl: './map.page.html',
  styleUrl: './map.page.scss',
  providers: [MapUrlSyncService, MapUrlReaderService, MapUrlWriterService],
})
export class MapPage {
  protected readonly stationsStore = inject(StationsStore);
  protected readonly filtersStore = inject(FiltersStore);
  protected readonly favoritesStore = inject(FavoritesStore);
  protected readonly detailsStore = inject(StationDetailsStore);
  protected readonly searchStore = inject(AddressSearchStore);
  protected readonly locationStore = inject(UserLocationStore);
  protected readonly mapPageStore = inject(MapPageStore);
  protected readonly detailsLayout = inject(StationDetailsLayoutService);
  protected readonly viewport = inject(ViewportService);
  protected readonly filtersTriggerId = FILTERS_TRIGGER_ID;
  protected readonly favoritesTriggerId = FAVORITES_TRIGGER_ID;

  private readonly stationFilter = inject(StationFilterService);

  // The same stations in the same order keep the previous array, so the map is not updated.
  protected readonly filteredStations = computed<readonly Station[]>(
    () =>
      this.stationFilter.filterStations(this.stationsStore.stations(), this.filtersStore.filters()),
    { equal: (previous, next) => this.stationFilter.isSameResult(previous, next) },
  );
  protected readonly detailsView = computed<StationDetailsView | undefined>(() => {
    const presented = this.detailsStore.presented();
    const station = this.stationsStore.findStation(presented?.stationId);
    return (
      presented && station && { station, details: presented.details, status: presented.status }
    );
  });

  constructor() {
    addIcons({ funnel, heart });
    inject(MapUrlSyncService).init();
  }

  protected togglePane(pane: MapPane): void {
    if (this.mapPageStore.isPaneOpen(pane)) {
      this.mapPageStore.closePane();
      return;
    }
    this.detailsStore.clearSelection();
    this.searchStore.closePanel();
    this.mapPageStore.openPane(pane);
  }

  protected selectStation(chargingStationId: number): void {
    this.detailsStore.selectStation(chargingStationId);
    this.closePanels();
  }

  protected showStation(station: Station): void {
    this.selectStation(station.chargingStationId);
    this.mapPageStore.focusOn(station);
  }

  protected toggleChargePointFavorite({ chargingStationId, chargePointId, name }: FavoriteChargePoint): void {
    this.favoritesStore.toggleConnector(chargingStationId, { id: chargePointId, name });
  }

  protected closePanels(): void {
    this.mapPageStore.closePane();
    this.searchStore.closePanel();
  }
}
