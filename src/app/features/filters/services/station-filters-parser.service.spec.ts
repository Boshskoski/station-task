import { TestBed } from '@angular/core/testing';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { EMPTY_STATION_FILTERS } from '@features/filters/constants/empty-station-filters.const';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { OpeningFilter } from '@features/filters/enums/opening-filter.enum';
import { StationFiltersParserService } from './station-filters-parser.service';

describe('StationFiltersParserService', () => {
  let parser: StationFiltersParserService;

  beforeEach(() => {
    parser = TestBed.inject(StationFiltersParserService);
  });

  it('keeps the known values of each group in enum order, without duplicates', () => {
    expect(
      parser.parse({
        availability: ['unavailable', 'available', 'available'],
        opening: ['closed', 'open'],
        connectorTypes: [7, 4, 7],
      }),
    ).toEqual({
      availability: [AvailabilityFilter.Available, AvailabilityFilter.Unavailable],
      opening: [OpeningFilter.Open, OpeningFilter.Closed],
      connectorTypes: [CPConnectorTypeID.Type2, CPConnectorTypeID.CCS2],
    });
  });

  it('drops the values that belong to another group or to no group', () => {
    const mixed = ['available', 'open', 'bogus', 4];

    expect(parser.parse({ availability: mixed, opening: mixed, connectorTypes: mixed })).toEqual({
      availability: [AvailabilityFilter.Available],
      opening: [OpeningFilter.Open],
      connectorTypes: [CPConnectorTypeID.Type2],
    });
  });

  it('returns empty groups for missing or non-array values', () => {
    expect(parser.parse({})).toEqual(EMPTY_STATION_FILTERS);
    expect(parser.parse({ availability: 'available', opening: null, connectorTypes: 4 })).toEqual(
      EMPTY_STATION_FILTERS,
    );
  });
});
