import { ChargingStationType } from '@core/enums/station/charging-station-type.enum';
import { ConnectorIconName } from '@core/enums/station/connector-icon-name.enum';
import { ConnectorType } from '@core/enums/station/connector-type.enum';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { StationConnectorDto } from '@core/models/dto/station/station-connector.dto';
import { StationDto } from '@core/models/dto/station/station.dto';

export function stationDto(overrides: Partial<StationDto> = {}): StationDto {
  return {
    IsFavorite: false,
    PK_ChargingStationID: 34684,
    Name: 'Ullernbyggene',
    Address: 'Silurveien 42',
    PostCode: '0380',
    Town: 'Oslo',
    StateOrProvince: 'Oslo',
    Country: 'Norway',
    Latitude: 59.933706,
    Longitude: 10.657575,
    kWhMin: 22.2,
    kWhMax: 22.2,
    Distance: 0.270060927113542,
    IsOpen: true,
    availableBoxes: 29,
    offlineBoxes: 0,
    occupiedBoxes: 3,
    totalBoxes: 32,
    Connectors: [stationConnectorDto()],
    OperatorName: 'CURRENT',
    OperatorLogoURL: 'https://apistoragesc.blob.core.windows.net/dashboardimagessc/current_c.png',
    IsActive: true,
    ChargingStationType: ChargingStationType.ApartmentBuilding,
    ...overrides,
  };
}

export function stationConnectorDto(overrides: Partial<StationConnectorDto> = {}): StationConnectorDto {
  return {
    Amount: 32,
    Available: 29,
    PK_CPConnectorTypeID: CPConnectorTypeID.Type2,
    Name: 'Type - 2',
    IconName: ConnectorIconName.Type2,
    ConnectorType: ConnectorType.Type2,
    ...overrides,
  };
}
