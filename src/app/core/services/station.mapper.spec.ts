import { TestBed } from '@angular/core/testing';
import { ChargingStationType } from '@core/enums/station/charging-station-type.enum';
import { ConnectorIconName } from '@core/enums/station/connector-icon-name.enum';
import { ConnectorType } from '@core/enums/station/connector-type.enum';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { stationDto } from '@core/testing/station.fixtures';
import { StationMapper } from './station.mapper';

describe('StationMapper', () => {
  let mapper: StationMapper;

  beforeEach(() => {
    mapper = TestBed.inject(StationMapper);
  });

  it('maps the station fields the app uses', () => {
    expect(mapper.stationDtoToUi(stationDto())).toEqual({
      chargingStationId: 34684,
      name: 'Ullernbyggene',
      address: 'Silurveien 42',
      postCode: '0380',
      town: 'Oslo',
      stateOrProvince: 'Oslo',
      country: 'Norway',
      latitude: 59.933706,
      longitude: 10.657575,
      kWhMin: 22.2,
      kWhMax: 22.2,
      isOpen: true,
      availableBoxes: 29,
      offlineBoxes: 0,
      occupiedBoxes: 3,
      totalBoxes: 32,
      connectors: [
        {
          amount: 32,
          available: 29,
          cpConnectorTypeId: CPConnectorTypeID.Type2,
          name: 'Type - 2',
        },
      ],
      operatorName: 'CURRENT',
      operatorLogoUrl: 'https://apistoragesc.blob.core.windows.net/dashboardimagessc/current_c.png',
      isActive: true,
      chargingStationType: ChargingStationType.ApartmentBuilding,
    });
  });

  it('keeps a null StateOrProvince', () => {
    expect(mapper.stationDtoToUi(stationDto({ StateOrProvince: null })).stateOrProvince).toBeNull();
  });

  it('maps every connector of a station', () => {
    const station = mapper.stationDtoToUi(
      stationDto({
        Connectors: [
          {
            Amount: 57,
            Available: 50,
            PK_CPConnectorTypeID: CPConnectorTypeID.CHAdeMO,
            Name: 'CHAdeMO',
            IconName: ConnectorIconName.CHAdeMO,
            ConnectorType: ConnectorType.CHAdeMO,
          },
          {
            Amount: 4,
            Available: 4,
            PK_CPConnectorTypeID: CPConnectorTypeID.CCS2,
            Name: 'CCS2',
            IconName: ConnectorIconName.CCS2,
            ConnectorType: ConnectorType.CCS2,
          },
        ],
      }),
    );
    expect(station.connectors.map((c) => [c.cpConnectorTypeId, c.amount, c.available])).toEqual([
      [CPConnectorTypeID.CHAdeMO, 57, 50],
      [CPConnectorTypeID.CCS2, 4, 4],
    ]);
  });

  it('maps a list of stations in API order', () => {
    const stations = mapper.stationsDtoToUi([
      stationDto({ PK_ChargingStationID: 2 }),
      stationDto({ PK_ChargingStationID: 1 }),
    ]);
    expect(stations.map((s) => s.chargingStationId)).toEqual([2, 1]);
  });

  it('maps an empty result to an empty list', () => {
    expect(mapper.stationsDtoToUi([])).toEqual([]);
  });
});
