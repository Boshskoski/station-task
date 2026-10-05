import { TestBed } from '@angular/core/testing';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { EMPTY_STATION_FILTERS } from '@features/filters/constants/empty-station-filters.const';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { OpeningFilter } from '@features/filters/enums/opening-filter.enum';
import { StationFilters } from '@features/filters/models/ui/station-filters.ui';
import { StationFiltersStorageService } from './station-filters-storage.service';

describe('StationFiltersStorageService', () => {
  const key = 'stations.filters.v1';
  let service: StationFiltersStorageService;

  beforeEach(() => {
    service = TestBed.inject(StationFiltersStorageService);
  });

  afterEach(() => localStorage.removeItem(key));

  it('saves the filters and loads them back', () => {
    const filters: StationFilters = {
      availability: [AvailabilityFilter.Available],
      opening: [OpeningFilter.Open, OpeningFilter.Closed],
      connectorTypes: [CPConnectorTypeID.CHAdeMO],
    };

    service.save(filters);

    expect(JSON.parse(localStorage.getItem(key) ?? 'null')).toEqual(filters);
    expect(service.load()).toEqual(filters);
  });

  it('loads empty filters when nothing is stored', () => {
    expect(service.load()).toEqual(EMPTY_STATION_FILTERS);
  });

  it('drops unknown and duplicate values from the stored filters', () => {
    localStorage.setItem(
      key,
      JSON.stringify({
        availability: ['available', 'bogus', 'available'],
        opening: ['closed', 1],
        connectorTypes: [7, 99, '6', 4],
      }),
    );

    expect(service.load()).toEqual({
      availability: [AvailabilityFilter.Available],
      opening: [OpeningFilter.Closed],
      connectorTypes: [CPConnectorTypeID.Type2, CPConnectorTypeID.CCS2],
    });
  });

  it('loads empty groups for fields with the wrong shape', () => {
    localStorage.setItem(key, JSON.stringify({ availability: 'available', opening: null }));

    expect(service.load()).toEqual(EMPTY_STATION_FILTERS);
  });

  for (const stored of ['"text"', '42', 'null', '[]', '{broken']) {
    it(`loads empty filters when the stored value is ${stored}`, () => {
      spyOn(console, 'error');
      localStorage.setItem(key, stored);

      expect(service.load()).toEqual(EMPTY_STATION_FILTERS);
    });
  }
});
