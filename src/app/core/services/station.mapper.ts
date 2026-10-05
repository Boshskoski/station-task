import { Service } from '@angular/core';
import { StationConnectorDto } from '@core/models/dto/station/station-connector.dto';
import { StationDto } from '@core/models/dto/station/station.dto';
import { StationConnector } from '@core/models/ui/station/station-connector.ui';
import { Station } from '@core/models/ui/station/station.ui';

@Service()
export class StationMapper {
  stationsDtoToUi(stations: readonly StationDto[]): readonly Station[] {
    return stations.map((station) => this.stationDtoToUi(station));
  }

  stationDtoToUi(station: StationDto): Station {
    return {
      chargingStationId: station.PK_ChargingStationID,
      name: station.Name,
      address: station.Address,
      postCode: station.PostCode,
      town: station.Town,
      stateOrProvince: station.StateOrProvince,
      country: station.Country,
      latitude: station.Latitude,
      longitude: station.Longitude,
      kWhMin: station.kWhMin,
      kWhMax: station.kWhMax,
      isOpen: station.IsOpen,
      availableBoxes: station.availableBoxes,
      offlineBoxes: station.offlineBoxes,
      occupiedBoxes: station.occupiedBoxes,
      totalBoxes: station.totalBoxes,
      connectors: station.Connectors.map((connector) => this.connectorDtoToUi(connector)),
      operatorName: station.OperatorName,
      operatorLogoUrl: station.OperatorLogoURL,
      isActive: station.IsActive,
      chargingStationType: station.ChargingStationType,
    };
  }

  private connectorDtoToUi(connector: StationConnectorDto): StationConnector {
    return {
      amount: connector.Amount,
      available: connector.Available,
      cpConnectorTypeId: connector.PK_CPConnectorTypeID,
      name: connector.Name,
    };
  }
}
