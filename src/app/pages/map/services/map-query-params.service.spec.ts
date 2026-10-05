import { TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, Router } from '@angular/router';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { EMPTY_STATION_FILTERS } from '@features/filters/constants/empty-station-filters.const';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { OpeningFilter } from '@features/filters/enums/opening-filter.enum';
import { MapUrlState } from '@pages/map/models/ui/map-url-state.ui';
import { ParsedMapUrlState } from '@pages/map/models/ui/parsed-map-url-state.ui';
import { MapQueryParamsService } from './map-query-params.service';

describe('MapQueryParamsService', () => {
  const emptyState: ParsedMapUrlState = {
    stationId: undefined,
    query: undefined,
    filters: undefined,
    favorites: undefined,
  };
  const favorites = {
    stations: [{ stationId: 34684, connectors: [{ id: 12, name: 'Type 2 - 1' }] }],
  };
  let service: MapQueryParamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    service = TestBed.inject(MapQueryParamsService);
  });

  it('parses every parameter', () => {
    expect(
      service.parse(
        convertToParamMap({
          station: '34684',
          q: ' Karl Johans gate ',
          status: 'available,open',
          type: '4,7',
          favorites: JSON.stringify(favorites),
        }),
      ),
    ).toEqual({
      stationId: 34684,
      query: 'Karl Johans gate',
      filters: {
        availability: [AvailabilityFilter.Available],
        opening: [OpeningFilter.Open],
        connectorTypes: [CPConnectorTypeID.Type2, CPConnectorTypeID.CCS2],
      },
      favorites,
    });
  });

  it('parses an empty URL as no station, no query, filters not given and no favorites', () => {
    expect(service.parse(convertToParamMap({}))).toEqual(emptyState);
  });

  it('ignores station ids that are not positive integers', () => {
    for (const station of ['abc', '0', '-5', '1.5', '012', '', '99999999999999999999']) {
      expect(service.parse(convertToParamMap({ station })).stationId)
        .withContext(station)
        .toBeUndefined();
    }
  });

  it('treats an empty query as absent', () => {
    expect(service.parse(convertToParamMap({ q: '   ' })).query).toBeUndefined();
  });

  it('drops unknown and duplicate filter values and accepts repeated parameters', () => {
    const state = service.parse(
      convertToParamMap({ status: ['closed,bogus', 'unavailable,closed'], type: ['6,99', 'x'] }),
    );

    expect(state.filters).toEqual({
      availability: [AvailabilityFilter.Unavailable],
      opening: [OpeningFilter.Closed],
      connectorTypes: [CPConnectorTypeID.CHAdeMO],
    });
  });

  it('treats filter parameters with only invalid values as absent, so the saved filters stay', () => {
    expect(
      service.parse(convertToParamMap({ status: 'bogus', type: '99' })).filters,
    ).toBeUndefined();
  });

  it('validates the favorites from the URL and drops invalid entries', () => {
    const params = convertToParamMap({
      favorites: JSON.stringify({ stations: [...favorites.stations, { stationId: 'x' }] }),
    });

    expect(service.parse(params).favorites).toEqual(favorites);
  });

  it('ignores favorites that are not JSON or have no valid entry', () => {
    for (const value of ['{broken', '"text"', '', '{"stations":[{"stationId":"x"}]}']) {
      expect(service.parse(convertToParamMap({ favorites: value })).favorites)
        .withContext(value)
        .toBeUndefined();
    }
  });

  it('serializes the state with only the parameters that have a value', () => {
    expect(
      service.serialize({
        stationId: 34684,
        query: 'Oslo',
        filters: {
          availability: [AvailabilityFilter.Available],
          opening: [OpeningFilter.Closed],
          connectorTypes: [CPConnectorTypeID.CHAdeMO, CPConnectorTypeID.CCS2],
        },
        favorites,
      }),
    ).toEqual({
      station: 34684,
      q: 'Oslo',
      status: 'available,closed',
      type: '6,7',
      favorites: JSON.stringify(favorites),
    });

    expect(service.serialize({ ...emptyState, filters: EMPTY_STATION_FILTERS })).toEqual({});
  });

  it('writes a readable URL and parses it back to the same state', () => {
    const router = TestBed.inject(Router);
    const state: MapUrlState = {
      stationId: 7,
      query: 'Bergen',
      filters: {
        availability: [AvailabilityFilter.Unavailable],
        opening: [OpeningFilter.Open],
        connectorTypes: [CPConnectorTypeID.Type2],
      },
      favorites: undefined,
    };

    const url = router.serializeUrl(
      router.createUrlTree([], { queryParams: service.serialize(state) }),
    );

    expect(url).toBe('/?station=7&q=Bergen&status=unavailable,open&type=4');
    expect(service.parse(router.parseUrl(url).queryParamMap)).toEqual(state);
  });

  it('writes the favorites as URL-encoded JSON and parses them back', () => {
    const router = TestBed.inject(Router);
    const state: MapUrlState = { ...emptyState, filters: EMPTY_STATION_FILTERS, favorites };

    const url = router.serializeUrl(
      router.createUrlTree([], { queryParams: service.serialize(state) }),
    );

    expect(url).toMatch(/^\/\?favorites=%7B%22stations%22:%5B%7B%22stationId%22:34684,/);
    expect(service.parse(router.parseUrl(url).queryParamMap).favorites).toEqual(favorites);
  });
});
