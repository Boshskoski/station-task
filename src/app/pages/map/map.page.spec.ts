import { CUSTOM_ELEMENTS_SCHEMA, ResourceStatus, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonContent, IonToolbar, provideIonicAngular } from '@ionic/angular';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { StationsStore } from '@core/store/stations.store';
import { stationDto } from '@core/testing/station.fixtures';
import { StationDetailsState } from '@features/details/models/ui/station-details-state.ui';
import { StationDetailsLayoutService } from '@features/details/services/station-details-layout.service';
import { StationDetailsStore } from '@features/details/store/station-details.store';
import { FavoritesStore } from '@features/favorites/store/favorites.store';
import { EMPTY_STATION_FILTERS } from '@features/filters/constants/empty-station-filters.const';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { StationFilters } from '@features/filters/models/ui/station-filters.ui';
import { FiltersStore } from '@features/filters/store/filters.store';
import { UserPosition } from '@features/location/models/ui/user-position.ui';
import { UserLocationStore } from '@features/location/store/user-location.store';
import { userPosition } from '@features/location/testing/location.fixtures';
import { GeocodedPlace } from '@features/search/models/ui/geocoded-place.ui';
import { AddressSearchStore } from '@features/search/store/address-search.store';
import { geocodedPlace } from '@features/search/testing/search.fixtures';
import { MapUrlSyncService } from '@pages/map/services/map-url-sync.service';
import { PageHeader } from '@shared/components/page-header/page-header';
import { ViewportService } from '@shared/services/viewport.service';
import { MapPage } from './map.page';

describe('MapPage', () => {
  const stationsStatus = signal<ResourceStatus>('loading');
  const stations = signal<readonly Station[]>([]);
  const filters = signal<StationFilters>(EMPTY_STATION_FILTERS);
  const detailsStatus = signal<ResourceStatus>('idle');
  const selectedStationId = signal<number | undefined>(undefined);
  const presented = signal<StationDetailsState | undefined>(undefined);
  const reload = jasmine.createSpy('reload');
  const selectStation = jasmine.createSpy('selectStation');
  const clearFilters = jasmine.createSpy('clearFilters');
  const clearSelection = jasmine.createSpy('clearSelection');
  const closePanel = jasmine.createSpy('closePanel');
  const init = jasmine.createSpy('init');
  const selectedPlace = signal<GeocodedPlace | undefined>(undefined);
  const position = signal<UserPosition | undefined>(undefined);
  const locationError = signal(undefined);
  const isDesktop = signal(true);
  let fixture: ComponentFixture<MapPage>;

  beforeEach(async () => {
    isDesktop.set(true);
    stationsStatus.set('loading');
    stations.set([]);
    filters.set(EMPTY_STATION_FILTERS);
    detailsStatus.set('idle');
    selectedStationId.set(undefined);
    presented.set(undefined);
    reload.calls.reset();
    selectStation.calls.reset();
    clearFilters.calls.reset();
    clearSelection.calls.reset();
    closePanel.calls.reset();
    init.calls.reset();
    selectedPlace.set(undefined);
    position.set(undefined);
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({}),
        {
          provide: ViewportService,
          useValue: { isDesktop, isWide: signal(true), height: signal(800) },
        },
        {
          provide: StationDetailsStore,
          useValue: {
            status: detailsStatus,
            selectedStationId,
            presented,
            selectStation,
            clearSelection,
          },
        },
        { provide: UserLocationStore, useValue: { position, error: locationError } },
        {
          provide: AddressSearchStore,
          useValue: { selectedPlace, panelOpen: signal(false), closePanel },
        },
        {
          provide: StationsStore,
          useValue: {
            status: stationsStatus,
            stations,
            reload,
            findStation: (id: number | undefined) =>
              stations().find((station) => station.chargingStationId === id),
          },
        },
        {
          provide: FiltersStore,
          useValue: { filters, activeFilterCount: signal(0), clearFilters },
        },
      ],
    });
    TestBed.overrideComponent(MapPage, {
      set: {
        imports: [PageHeader, IonToolbar, IonContent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [{ provide: MapUrlSyncService, useValue: { init } }],
      },
    });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(MapPage);
    await fixture.whenStable();
  });

  afterEach(() => localStorage.removeItem('stations.favorites.v2'));

  function toolbarButton(label: 'Filters' | 'Favorites') {
    return fixture.debugElement.query(By.css(`app-toolbar-panel-button[label="${label}"]`));
  }

  function expanded(label: 'Filters' | 'Favorites'): boolean {
    return (toolbarButton(label).nativeElement as { expanded: boolean }).expanded;
  }

  async function press(label: 'Filters' | 'Favorites'): Promise<void> {
    toolbarButton(label).triggerEventHandler('pressed');
    await fixture.whenStable();
  }

  async function renderDeferred(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  }

  function mapInput<T>(name: string): T {
    return (fixture.nativeElement.querySelector('app-station-map') as Record<string, T>)[name];
  }

  function loadStations(...dtos: Parameters<typeof stationDto>[0][]): readonly Station[] {
    const loaded = TestBed.inject(StationMapper).stationsDtoToUi(
      dtos.map((dto) => stationDto(dto)),
    );
    stations.set(loaded);
    stationsStatus.set('resolved');
    return loaded;
  }

  it('starts syncing its state with the URL', () => {
    expect(init).toHaveBeenCalledTimes(1);
  });

  describe('stations on the map', () => {
    it('passes the stations that match the filters to the map', async () => {
      const all = loadStations(
        { PK_ChargingStationID: 1, availableBoxes: 4 },
        { PK_ChargingStationID: 2, availableBoxes: 0 },
      );
      await fixture.whenStable();
      expect(mapInput<readonly Station[]>('stations')).toBe(all);

      filters.set({ ...EMPTY_STATION_FILTERS, availability: [AvailabilityFilter.Unavailable] });
      await fixture.whenStable();

      expect(mapInput<readonly Station[]>('stations')).toEqual([all[1]]);
    });

    it('keeps the same list for the map when a filter change matches the same stations', async () => {
      loadStations({ PK_ChargingStationID: 1, availableBoxes: 4 });
      filters.set({ ...EMPTY_STATION_FILTERS, availability: [AvailabilityFilter.Available] });
      await fixture.whenStable();
      const before = mapInput<readonly Station[]>('stations');

      filters.set({
        ...EMPTY_STATION_FILTERS,
        availability: [AvailabilityFilter.Available, AvailabilityFilter.Unavailable],
      });
      await fixture.whenStable();

      expect(mapInput<readonly Station[]>('stations')).toBe(before);
    });

    it('passes the selected address to the map', async () => {
      const place = geocodedPlace();
      selectedPlace.set(place);
      await fixture.whenStable();

      expect(mapInput<GeocodedPlace>('searchPlace')).toBe(place);
    });

    it('passes the user position to the map', async () => {
      const current = userPosition();
      position.set(current);
      await fixture.whenStable();

      expect(mapInput<UserPosition>('userPosition')).toBe(current);
    });

    it('tells the map how much of it the details overlay covers', async () => {
      expect(mapInput<unknown>('overlayInsets')).toEqual({ left: 432, bottom: 0 });

      isDesktop.set(false);
      await fixture.whenStable();

      expect(mapInput<unknown>('overlayInsets')).toEqual({ left: 0, bottom: 320 });
      expect(mapInput<unknown>('overlayInsets')).toBe(
        TestBed.inject(StationDetailsLayoutService).insets(),
      );
    });

    it('shows the locate button over the map', () => {
      expect(fixture.nativeElement.querySelector('app-locate-button')).not.toBeNull();
    });
  });

  describe('station details', () => {
    it('selects the station clicked on the map and closes the address results', () => {
      fixture.debugElement
        .query(By.css('app-station-map'))
        .triggerEventHandler('stationSelected', 34684);

      expect(selectStation).toHaveBeenCalledOnceWith(34684);
      expect(closePanel).toHaveBeenCalled();
    });

    it('shows the presented station from the list with its details state', async () => {
      const [first] = loadStations({ PK_ChargingStationID: 1 });
      selectedStationId.set(1);
      presented.set({ stationId: 1, details: undefined, status: 'error' });
      await renderDeferred();

      const panel: { readonly view: unknown } = fixture.nativeElement.querySelector(
        'app-station-details-desktop',
      );
      expect(panel.view).toEqual({ station: first, details: undefined, status: 'error' });
    });

    it('shows no station while the presented one is not in the loaded list', async () => {
      loadStations({ PK_ChargingStationID: 1 });
      selectedStationId.set(999);
      presented.set({ stationId: 999, details: undefined, status: 'resolved' });
      await renderDeferred();

      const panel: { readonly view: unknown } = fixture.nativeElement.querySelector(
        'app-station-details-desktop',
      );
      expect(panel.view).toBeUndefined();
    });

    it('uses the sheet on mobile', async () => {
      isDesktop.set(false);
      selectedStationId.set(1);
      await renderDeferred();

      expect(fixture.nativeElement.querySelector('app-station-details-mobile')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-station-details-desktop')).toBeNull();
    });

    it('saves the favorites toggled in the details', async () => {
      selectedStationId.set(1);
      await renderDeferred();
      const panel = fixture.debugElement.query(By.css('app-station-details-desktop'));
      const favorites = TestBed.inject(FavoritesStore);

      panel.triggerEventHandler('stationFavoriteToggled', 1);
      panel.triggerEventHandler('chargePointFavoriteToggled', {
        chargingStationId: 1,
        chargePointId: 7,
        name: 'Left',
      });
      await fixture.whenStable();

      expect(favorites.favorites()).toEqual({
        stations: [{ stationId: 1, connectors: [{ id: 7, name: 'Left' }] }],
      });
      const sidePanel: {
        favoriteStationIdSet: ReadonlySet<number>;
        favoriteChargePoints: readonly unknown[];
      } = panel.nativeElement;
      expect(sidePanel.favoriteStationIdSet).toEqual(new Set([1]));
      expect(sidePanel.favoriteChargePoints).toEqual([
        { chargingStationId: 1, chargePointId: 7, name: 'Left' },
      ]);
    });
  });

  describe('panes', () => {
    it('opens and closes the filters with the filters button', async () => {
      expect(expanded('Filters')).toBeFalse();

      await press('Filters');
      expect(expanded('Filters')).toBeTrue();

      await press('Filters');
      expect(expanded('Filters')).toBeFalse();
    });

    it('closes the station details and the address results when a pane opens', async () => {
      await press('Filters');

      expect(clearSelection).toHaveBeenCalledTimes(1);
      expect(closePanel).toHaveBeenCalledTimes(1);

      await press('Filters');

      expect(clearSelection).toHaveBeenCalledTimes(1);
    });

    it('opens and closes the favorites with the favorites button', async () => {
      expect(expanded('Favorites')).toBeFalse();

      await press('Favorites');
      expect(expanded('Favorites')).toBeTrue();
      expect(clearSelection).toHaveBeenCalledTimes(1);

      await press('Favorites');
      expect(expanded('Favorites')).toBeFalse();
      expect(clearSelection).toHaveBeenCalledTimes(1);
    });

    it('shows one pane at a time: the filters and the favorites close each other', async () => {
      await press('Favorites');
      await press('Filters');

      expect(expanded('Filters')).toBeTrue();
      expect(expanded('Favorites')).toBeFalse();

      await press('Favorites');

      expect(expanded('Favorites')).toBeTrue();
      expect(expanded('Filters')).toBeFalse();
    });

    it('keeps the new pane open when the replaced one reports that it closed', async () => {
      await press('Filters');
      await renderDeferred();
      await press('Favorites');

      fixture.debugElement
        .query(By.css('app-filters-desktop'))
        .triggerEventHandler('openChange', false);
      await fixture.whenStable();

      expect(expanded('Favorites')).toBeTrue();
    });

    it('closes the pane that reports that it closed', async () => {
      await press('Filters');
      await renderDeferred();

      fixture.debugElement
        .query(By.css('app-filters-desktop'))
        .triggerEventHandler('openChange', false);
      await fixture.whenStable();

      expect(expanded('Filters')).toBeFalse();
    });

    it('tells the filters how many stations match', async () => {
      loadStations(
        { PK_ChargingStationID: 1, availableBoxes: 4 },
        { PK_ChargingStationID: 2, availableBoxes: 0 },
      );
      filters.set({ ...EMPTY_STATION_FILTERS, availability: [AvailabilityFilter.Available] });
      await press('Filters');
      await renderDeferred();

      const popover: { readonly matchCount: number } =
        fixture.nativeElement.querySelector('app-filters-desktop');
      expect(popover.matchCount).toBe(1);
    });

    it('closes the panes and the address results on a click on the empty map', async () => {
      await press('Favorites');

      fixture.debugElement
        .query(By.css('app-station-map'))
        .triggerEventHandler('backgroundClicked');
      await fixture.whenStable();

      expect(expanded('Favorites')).toBeFalse();
      expect(closePanel).toHaveBeenCalledTimes(2);
    });

    it('closes the panes when a station is selected on the map', async () => {
      await press('Filters');

      fixture.debugElement
        .query(By.css('app-station-map'))
        .triggerEventHandler('stationSelected', 7);
      await fixture.whenStable();

      expect(selectStation).toHaveBeenCalledOnceWith(7);
      expect(expanded('Filters')).toBeFalse();
    });

    it('selects a station picked from the favorites, closes them and focuses the map on it', async () => {
      const picked = TestBed.inject(StationMapper).stationDtoToUi(
        stationDto({ PK_ChargingStationID: 5, Latitude: 60.1, Longitude: 11.2 }),
      );
      await press('Favorites');
      await renderDeferred();

      fixture.debugElement
        .query(By.css('app-favorites-desktop, app-favorites-mobile'))
        .triggerEventHandler('stationSelected', picked);
      await fixture.whenStable();

      expect(selectStation).toHaveBeenCalledOnceWith(5);
      expect(mapInput<unknown>('focus')).toEqual({ latitude: 60.1, longitude: 11.2 });
      expect(expanded('Favorites')).toBeFalse();
    });
  });

  describe('header', () => {
    it('shows its heading in the page header', () => {
      const title = (fixture.nativeElement as HTMLElement).querySelector('ion-header ion-title');

      expect(title?.textContent?.trim()).toBe('EV Charging Stations');
    });

    it('puts the address search in the toolbar row of the title and buttons on desktop', () => {
      const toolbars = (fixture.nativeElement as HTMLElement).querySelectorAll(
        'ion-header ion-toolbar',
      );

      expect(toolbars.length).toBe(1);
      expect(toolbars[0].querySelector('app-address-search')).not.toBeNull();
    });

    it('gives the address search a row of its own on mobile', async () => {
      isDesktop.set(false);
      await fixture.whenStable();

      const toolbars = (fixture.nativeElement as HTMLElement).querySelectorAll(
        'ion-header ion-toolbar',
      );
      expect(toolbars.length).toBe(2);
      expect(toolbars[0].querySelector('app-address-search')).toBeNull();
      expect(toolbars[1].querySelector('app-address-search')).not.toBeNull();
    });
  });

  describe('status', () => {
    function mapStatus() {
      return fixture.debugElement.query(By.css('app-map-status'));
    }

    it('passes the stations, the filter result and the details request to the status', async () => {
      loadStations({ availableBoxes: 4 }, { availableBoxes: 0 });
      filters.set({ ...EMPTY_STATION_FILTERS, availability: [AvailabilityFilter.Unavailable] });
      detailsStatus.set('loading');
      await fixture.whenStable();

      expect(mapStatus().properties).toEqual(
        jasmine.objectContaining({
          stationsStatus: 'resolved',
          stationCount: 2,
          matchCount: 1,
          detailsLoading: true,
        }),
      );
    });

    it('reloads the stations and clears the filters on request', () => {
      mapStatus().triggerEventHandler('retry');
      mapStatus().triggerEventHandler('clearFilters');

      expect(reload).toHaveBeenCalled();
      expect(clearFilters).toHaveBeenCalled();
    });
  });
});
