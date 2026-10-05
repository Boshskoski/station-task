import { TestBed } from '@angular/core/testing';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { stationConnectorDto, stationDto } from '@core/testing/station.fixtures';
import { EMPTY_STATION_FILTERS } from '@features/filters/constants/empty-station-filters.const';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { OpeningFilter } from '@features/filters/enums/opening-filter.enum';
import { StationFilters } from '@features/filters/models/ui/station-filters.ui';
import { StationFilterService } from './station-filter.service';

describe('StationFilterService', () => {
  const chademo = stationConnectorDto({
    PK_CPConnectorTypeID: CPConnectorTypeID.CHAdeMO,
    Name: 'CHAdeMO',
  });
  const ccs2 = stationConnectorDto({ PK_CPConnectorTypeID: CPConnectorTypeID.CCS2, Name: 'CCS2' });
  let service: StationFilterService;
  let stations: readonly Station[];

  beforeEach(() => {
    service = TestBed.inject(StationFilterService);
    stations = TestBed.inject(StationMapper).stationsDtoToUi([
      stationDto({ PK_ChargingStationID: 1, availableBoxes: 3, IsOpen: true }),
      stationDto({
        PK_ChargingStationID: 2,
        availableBoxes: 0,
        IsOpen: true,
        Connectors: [chademo],
      }),
      stationDto({ PK_ChargingStationID: 3, availableBoxes: 5, IsOpen: false, Connectors: [ccs2] }),
      stationDto({ PK_ChargingStationID: 4, availableBoxes: 0, IsOpen: false, Connectors: [] }),
      stationDto({
        PK_ChargingStationID: 5,
        availableBoxes: 1,
        IsOpen: true,
        Connectors: [chademo, ccs2],
      }),
    ]);
  });

  function ids(filters: Partial<StationFilters>): number[] {
    return service
      .filterStations(stations, { ...EMPTY_STATION_FILTERS, ...filters })
      .map((station) => station.chargingStationId);
  }

  it('returns the same list when no filter is selected', () => {
    expect(service.filterStations(stations, EMPTY_STATION_FILTERS)).toBe(stations);
  });

  it('keeps stations with free chargers for the Available option', () => {
    expect(ids({ availability: [AvailabilityFilter.Available] })).toEqual([1, 3, 5]);
  });

  it('keeps stations without free chargers for the Unavailable option', () => {
    expect(ids({ availability: [AvailabilityFilter.Unavailable] })).toEqual([2, 4]);
  });

  it('keeps open or closed stations by the opening option', () => {
    expect(ids({ opening: [OpeningFilter.Open] })).toEqual([1, 2, 5]);
    expect(ids({ opening: [OpeningFilter.Closed] })).toEqual([3, 4]);
  });

  it('combines the options of one group with OR', () => {
    expect(
      ids({ availability: [AvailabilityFilter.Available, AvailabilityFilter.Unavailable] }),
    ).toEqual([1, 2, 3, 4, 5]);
    expect(ids({ opening: [OpeningFilter.Open, OpeningFilter.Closed] })).toEqual([1, 2, 3, 4, 5]);
  });

  it('keeps stations that have any of the selected connector types', () => {
    expect(ids({ connectorTypes: [CPConnectorTypeID.CHAdeMO] })).toEqual([2, 5]);
    expect(ids({ connectorTypes: [CPConnectorTypeID.Type2, CPConnectorTypeID.CCS2] })).toEqual([
      1, 3, 5,
    ]);
  });

  it('combines the groups with AND', () => {
    expect(
      ids({
        availability: [AvailabilityFilter.Available],
        opening: [OpeningFilter.Open],
        connectorTypes: [CPConnectorTypeID.CCS2],
      }),
    ).toEqual([5]);
  });

  it('returns no stations when nothing matches', () => {
    expect(
      ids({
        availability: [AvailabilityFilter.Unavailable],
        opening: [OpeningFilter.Open],
        connectorTypes: [CPConnectorTypeID.CCS2],
      }),
    ).toEqual([]);
  });

  it('keeps the original station objects', () => {
    const result = service.filterStations(stations, {
      ...EMPTY_STATION_FILTERS,
      opening: [OpeningFilter.Closed],
    });

    expect(result[0]).toBe(stations[2]);
    expect(result[1]).toBe(stations[3]);
  });

  it('counts the selected options of every group', () => {
    expect(service.countActive(EMPTY_STATION_FILTERS)).toBe(0);
    expect(
      service.countActive({
        availability: [AvailabilityFilter.Available, AvailabilityFilter.Unavailable],
        opening: [OpeningFilter.Open],
        connectorTypes: [CPConnectorTypeID.CHAdeMO],
      }),
    ).toBe(4);
  });

  it('treats the same stations in the same order as the same result', () => {
    expect(service.isSameResult(stations, stations)).toBeTrue();
    expect(service.isSameResult(stations, [...stations])).toBeTrue();
    expect(service.isSameResult(stations, stations.slice(1))).toBeFalse();
    expect(service.isSameResult(stations, [...stations].reverse())).toBeFalse();
    expect(
      service.isSameResult(
        stations,
        stations.map((station) => ({ ...station })),
      ),
    ).toBeFalse();
  });
});
