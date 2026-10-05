import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Location } from '@angular/common';
import { provideLocationMocks, SpyLocation } from '@angular/common/testing';
import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NEVER, Observable, of, Subject } from 'rxjs';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { StationsApiService } from '@core/services/stations-api.service';
import { stationDto } from '@core/testing/station.fixtures';
import { DemoModeService } from '@features/demo/services/demo-mode.service';
import { StationDetailsApiService } from '@features/details/services/station-details-api.service';
import { StationDetailsStore } from '@features/details/store/station-details.store';
import { Favorites } from '@features/favorites/models/ui/favorites.ui';
import { FavoritesStore } from '@features/favorites/store/favorites.store';
import { EMPTY_STATION_FILTERS } from '@features/filters/constants/empty-station-filters.const';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { OpeningFilter } from '@features/filters/enums/opening-filter.enum';
import { FiltersStore } from '@features/filters/store/filters.store';
import { GeocodingApiService } from '@features/search/services/geocoding-api.service';
import { AddressSearchStore } from '@features/search/store/address-search.store';
import { geocodedPlace, nominatimPlaceDto } from '@features/search/testing/search.fixtures';
import { MapPageStore } from '@pages/map/store/map-page.store';
import { MapUrlReaderService } from './map-url-reader.service';
import { MapUrlSyncService } from './map-url-sync.service';
import { MapUrlWriterService } from './map-url-writer.service';

describe('MapUrlSyncService', () => {
  const filtersKey = 'stations.filters.v1';
  const favoritesKey = 'stations.favorites.v2';
  const linked: Favorites = {
    stations: [
      { stationId: 2, connectors: [] },
      { stationId: 1, connectors: [{ id: 5, name: 'Aura 1' }] },
    ],
  };
  const openFilter = { ...EMPTY_STATION_FILTERS, opening: [OpeningFilter.Open] };
  let stations: readonly Station[];
  let location: SpyLocation;
  let details: StationDetailsStore;
  let filtersStore: FiltersStore;
  let favoritesStore: FavoritesStore;
  let page: MapPageStore;
  let search: AddressSearchStore;
  let http: HttpTestingController;

  afterEach(() => {
    http.verify();
    localStorage.removeItem(filtersKey);
    localStorage.removeItem(favoritesKey);
  });

  async function start(
    url: string,
    getStations: () => Observable<readonly Station[]> = () => of(stations),
    providers: readonly Provider[] = [],
  ): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '', children: [] }]),
        provideLocationMocks(),
        provideHttpClient(),
        provideHttpClientTesting(),
        MapUrlSyncService,
        MapUrlReaderService,
        MapUrlWriterService,
        { provide: StationsApiService, useValue: { getStations } },
        { provide: StationDetailsApiService, useValue: { getStationDetails: () => NEVER } },
        ...providers,
      ],
    });
    stations = TestBed.inject(StationMapper).stationsDtoToUi([
      stationDto({ PK_ChargingStationID: 1, Latitude: 59.91, Longitude: 10.75 }),
      stationDto({ PK_ChargingStationID: 2, Latitude: 60.39, Longitude: 5.32 }),
    ]);
    location = TestBed.inject(Location) as SpyLocation;
    details = TestBed.inject(StationDetailsStore);
    filtersStore = TestBed.inject(FiltersStore);
    favoritesStore = TestBed.inject(FavoritesStore);
    page = TestBed.inject(MapPageStore);
    search = TestBed.inject(AddressSearchStore);
    http = TestBed.inject(HttpTestingController);
    location.setInitialPath(url);
    TestBed.inject(Router).initialNavigation();
    await settle();
    TestBed.inject(MapUrlSyncService).init();
    await settle();
  }

  async function settle(): Promise<void> {
    for (let round = 0; round < 5; round++) {
      TestBed.tick();
      await new Promise((resolve) => setTimeout(resolve));
    }
  }

  async function back(): Promise<void> {
    location.back();
    await settle();
  }

  function lastUrlChange(): string | undefined {
    return location.urlChanges.at(-1);
  }

  function favoritesParam(favorites: Favorites): string {
    const json = encodeURIComponent(JSON.stringify(favorites));
    return `favorites=${json.replace(/%3A/g, ':').replace(/%2C/g, ',')}`;
  }

  function pickFavorite(station: Station): void {
    details.selectStation(station.chargingStationId);
    page.closePane();
    page.focusOn(station);
  }

  function geocodingRequests() {
    return http.match((request) => request.url === GeocodingApiService.URL);
  }

  describe('on start', () => {
    it('selects the station from the URL and focuses the map on it', async () => {
      await start('/?station=2');

      expect(details.selectedStationId()).toBe(2);
      expect(page.focus()).toEqual({ latitude: 60.39, longitude: 5.32 });
      expect(location.path()).toBe('/?station=2');
      expect(location.urlChanges).toEqual([]);
    });

    it('focuses the station only once the stations are loaded', async () => {
      const response = new Subject<readonly Station[]>();
      await start('/?station=2', () => response);

      expect(details.selectedStationId()).toBe(2);
      expect(page.focus()).toBeUndefined();

      response.next(stations);
      response.complete();
      await settle();

      expect(page.focus()).toEqual({ latitude: 60.39, longitude: 5.32 });
    });

    it('drops a station that is not in the loaded list and corrects the URL in place', async () => {
      await start('/?station=999');

      expect(details.selectedStationId()).toBeUndefined();
      expect(page.focus()).toBeUndefined();
      expect(lastUrlChange()).toBe('replace: /');
    });

    it('shows the filters from the URL without saving them and drops unknown values', async () => {
      localStorage.setItem(filtersKey, JSON.stringify({ connectorTypes: [6] }));

      await start('/?status=available,bogus&type=4,99');

      expect(filtersStore.filters()).toEqual({
        availability: [AvailabilityFilter.Available],
        opening: [],
        connectorTypes: [CPConnectorTypeID.Type2],
      });
      expect(JSON.parse(localStorage.getItem(filtersKey) ?? 'null')).toEqual({
        connectorTypes: [6],
      });
      expect(lastUrlChange()).toBe('replace: /?status=available&type=4');
    });

    it('saves the filters once the user changes them after opening a link', async () => {
      await start('/?type=4');

      filtersStore.setFilter('opening', [OpeningFilter.Open]);
      await settle();

      const expected = {
        availability: [],
        opening: [OpeningFilter.Open],
        connectorTypes: [CPConnectorTypeID.Type2],
      };
      expect(JSON.parse(localStorage.getItem(filtersKey) ?? 'null')).toEqual(expected);
      expect(lastUrlChange()).toBe('replace: /?status=open&type=4');
    });

    it('keeps the saved filters when the URL has none and does not add them to the URL', async () => {
      localStorage.setItem(filtersKey, JSON.stringify(openFilter));

      await start('/');

      expect(filtersStore.filters()).toEqual(openFilter);
      expect(location.path()).toBe('/');
      expect(location.urlChanges).toEqual([]);
    });

    it('does not add the saved filters to a URL with other parameters', async () => {
      localStorage.setItem(filtersKey, JSON.stringify(openFilter));

      await start('/?station=2');

      expect(filtersStore.filters()).toEqual(openFilter);
      expect(location.path()).toBe('/?station=2');
      expect(location.urlChanges).toEqual([]);
    });

    it('keeps the saved filters when the URL filters are all invalid and removes them from the URL', async () => {
      localStorage.setItem(filtersKey, JSON.stringify(openFilter));

      await start('/?type=99');

      expect(filtersStore.filters()).toEqual(openFilter);
      expect(JSON.parse(localStorage.getItem(filtersKey) ?? 'null')).toEqual(openFilter);
      expect(lastUrlChange()).toBe('replace: /');
    });

    it('searches the query from the URL and selects the first result', async () => {
      await start('/?q=karl%20johan');

      const [request] = geocodingRequests();
      expect(request.request.params.get('q')).toBe('karl johan');
      request.flush([nominatimPlaceDto()]);
      await settle();

      expect(search.selectedPlace()).toEqual(geocodedPlace());
      expect(TestBed.inject(Router).parseUrl(location.path()).queryParamMap.get('q')).toBe(
        geocodedPlace().displayName,
      );
      expect(lastUrlChange()).toMatch(/^replace: /);
    });

    it('focuses the station after the search from the same URL, so the station stays in view', async () => {
      await start('/?station=1&q=bergen');

      expect(page.focus()).toBeUndefined();

      geocodingRequests()[0].flush([nominatimPlaceDto()]);
      await settle();

      expect(search.selectedPlace()).toEqual(geocodedPlace());
      expect(page.focus()).toEqual({ latitude: 59.91, longitude: 10.75 });
    });

    it('shows the favorites from a link without saving them', async () => {
      await start(`/?${favoritesParam(linked)}`);

      expect(favoritesStore.shared()).toEqual(linked);
      expect(favoritesStore.favorites()).toEqual({ stations: [] });
      expect(favoritesStore.count()).toBe(3);
      expect(localStorage.getItem(favoritesKey)).toBeNull();
      expect(location.urlChanges).toEqual([]);
    });

    it('shows the saved favorites when the link has the same list', async () => {
      localStorage.setItem(favoritesKey, JSON.stringify(linked));

      await start(`/?${favoritesParam(linked)}`);

      expect(favoritesStore.shared()).toBeUndefined();
      expect(location.urlChanges).toEqual([]);
    });

    it('keeps the saved favorites out of the URL until a heart is clicked', async () => {
      localStorage.setItem(favoritesKey, JSON.stringify(linked));

      await start('/');
      expect(location.urlChanges).toEqual([]);

      details.selectStation(1);
      await settle();
      expect(lastUrlChange()).toBe('/?station=1');
    });

    it('removes a leftover view parameter from an old link', async () => {
      await start('/?station=1&view=favorites');

      expect(details.selectedStationId()).toBe(1);
      expect(page.isPaneOpen('favorites')).toBeFalse();
      expect(lastUrlChange()).toBe('replace: /?station=1');
    });
  });

  describe('writing the URL', () => {
    it('adds a history entry when a station is selected or closed', async () => {
      await start('/');

      details.selectStation(1);
      await settle();
      expect(lastUrlChange()).toBe('/?station=1');

      details.clearSelection();
      await settle();
      expect(lastUrlChange()).toBe('/');
    });

    it('does not touch the URL when the favorites list opens or closes', async () => {
      await start('/');

      page.openPane('favorites');
      await settle();
      page.closePane();
      await settle();

      expect(location.urlChanges).toEqual([]);
    });

    it('writes the favorites into the URL in place on every heart click and drops them when empty', async () => {
      await start('/?station=1');

      favoritesStore.toggleStation(1);
      await settle();
      expect(lastUrlChange()).toBe(
        `replace: /?station=1&${favoritesParam({ stations: [{ stationId: 1, connectors: [] }] })}`,
      );

      favoritesStore.toggleStation(1);
      await settle();
      expect(lastUrlChange()).toBe('replace: /?station=1');
    });

    it('replaces the current entry when the filters or the search query change', async () => {
      await start('/');

      filtersStore.setFilters(openFilter);
      await settle();
      expect(lastUrlChange()).toBe('replace: /?status=open');

      search.search('oslo');
      await settle();
      expect(lastUrlChange()).toBe('replace: /?q=oslo&status=open');
      geocodingRequests()[0].flush([]);
    });

    it('adds the saved filters to the URL once the user selects a station', async () => {
      localStorage.setItem(filtersKey, JSON.stringify(openFilter));
      await start('/');

      details.selectStation(1);
      await settle();

      expect(lastUrlChange()).toBe('/?station=1&status=open');
    });

    it('keeps the demo dataset size in every URL it writes', async () => {
      await start('/?demo=500', undefined, [
        { provide: DemoModeService, useValue: { stationCount: 500, queryParams: { demo: 500 } } },
      ]);

      details.selectStation(1);
      await settle();
      expect(lastUrlChange()).toBe('/?station=1&demo=500');

      filtersStore.setFilters(openFilter);
      await settle();
      expect(lastUrlChange()).toBe('replace: /?station=1&status=open&demo=500');
    });
  });

  describe('favorites from a link', () => {
    it('keeps them in the URL when a station is picked, and Back still shows them', async () => {
      await start(`/?${favoritesParam(linked)}`);

      pickFavorite(stations[1]);
      await settle();
      expect(lastUrlChange()).toBe(`/?station=2&${favoritesParam(linked)}`);

      await back();

      expect(favoritesStore.shared()).toEqual(linked);
    });

    it('saves the link list with the change when a heart is clicked, and writes it in place', async () => {
      await start(`/?${favoritesParam(linked)}`);

      favoritesStore.toggleStation(2);
      await settle();

      expect(favoritesStore.shared()).toBeUndefined();
      expect(favoritesStore.stationIds()).not.toContain(2);
      expect(lastUrlChange()).toMatch(/^replace: \/\?favorites=/);
    });
  });

  describe('on back and forward', () => {
    it('restores the station and the filters of the history entry, and keeps the filters for an entry without any', async () => {
      await start('/');
      details.selectStation(1);
      await settle();
      filtersStore.setFilters(openFilter);
      await settle();
      details.selectStation(2);
      await settle();

      await back();

      expect(location.path()).toBe('/?station=1&status=open');
      expect(details.selectedStationId()).toBe(1);
      expect(filtersStore.filters()).toEqual(openFilter);
      expect(page.focus()).toEqual({ latitude: 59.91, longitude: 10.75 });

      await back();

      expect(location.path()).toBe('/');
      expect(details.selectedStationId()).toBeUndefined();
      expect(filtersStore.filters()).toEqual(openFilter);
      expect(JSON.parse(localStorage.getItem(filtersKey) ?? 'null')).toEqual(openFilter);
    });

    it('restores the search of the history entry', async () => {
      await start('/?q=karl%20johan');
      geocodingRequests()[0].flush([nominatimPlaceDto()]);
      await settle();
      details.selectStation(1);
      await settle();
      search.clear();
      await settle();

      await back();

      const [request] = geocodingRequests();
      expect(request.request.params.get('q')).toBe(geocodedPlace().displayName);
      request.flush([nominatimPlaceDto()]);
      await settle();
      expect(search.selectedPlace()).toEqual(geocodedPlace());
      expect(details.selectedStationId()).toBeUndefined();
    });

    it('keeps the current favorites when going back to an entry with an older list', async () => {
      await start('/');
      details.selectStation(1);
      await settle();
      favoritesStore.toggleStation(1);
      await settle();

      await back();

      expect(favoritesStore.shared()).toBeUndefined();
      expect(favoritesStore.stationIds()).toEqual([1]);
      expect(location.path()).toBe(
        `/?${favoritesParam({ stations: [{ stationId: 1, connectors: [] }] })}`,
      );
    });

    it('does not add history entries while restoring one', async () => {
      await start('/');
      details.selectStation(1);
      await settle();
      details.selectStation(2);
      await settle();
      const changes = location.urlChanges.length;

      await back();

      expect(location.urlChanges.length).toBe(changes);
    });
  });
});
