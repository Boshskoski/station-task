import { TestBed } from '@angular/core/testing';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { StationMapper } from '@core/services/station.mapper';
import { stationConnectorDto, stationDto } from '@core/testing/station.fixtures';
import { FilterOptionsService } from './filter-options.service';

describe('FilterOptionsService', () => {
  it('lists every connector type of the stations once, labelled with its API name', () => {
    const chademo = stationConnectorDto({
      PK_CPConnectorTypeID: CPConnectorTypeID.CHAdeMO,
      Name: 'CHAdeMO',
    });
    const ccs2 = stationConnectorDto({
      PK_CPConnectorTypeID: CPConnectorTypeID.CCS2,
      Name: 'CCS2',
    });
    const stations = TestBed.inject(StationMapper).stationsDtoToUi([
      stationDto({ PK_ChargingStationID: 1, Connectors: [ccs2, chademo] }),
      stationDto({ PK_ChargingStationID: 2 }),
      stationDto({ PK_ChargingStationID: 3, Connectors: [chademo] }),
      stationDto({ PK_ChargingStationID: 4, Connectors: [] }),
    ]);

    expect(TestBed.inject(FilterOptionsService).connectorTypeOptions(stations)).toEqual([
      { value: CPConnectorTypeID.Type2, label: 'Type - 2' },
      { value: CPConnectorTypeID.CHAdeMO, label: 'CHAdeMO' },
      { value: CPConnectorTypeID.CCS2, label: 'CCS2' },
    ]);
  });

  it('lists no connector types without stations', () => {
    expect(TestBed.inject(FilterOptionsService).connectorTypeOptions([])).toEqual([]);
  });
});
