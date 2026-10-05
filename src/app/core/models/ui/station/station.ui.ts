import { ChargingStationType } from '@core/enums/station/charging-station-type.enum';
import { StationConnector } from './station-connector.ui';

export interface Station {
  readonly chargingStationId: number;
  readonly name: string;
  readonly address: string;
  readonly postCode: string;
  readonly town: string;
  readonly stateOrProvince: string | null;
  readonly country: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly kWhMin: number;
  readonly kWhMax: number;
  readonly isOpen: boolean;
  readonly availableBoxes: number;
  readonly offlineBoxes: number;
  readonly occupiedBoxes: number;
  readonly totalBoxes: number;
  readonly connectors: readonly StationConnector[];
  readonly operatorName: string;
  readonly operatorLogoUrl: string;
  readonly isActive: boolean;
  readonly chargingStationType: ChargingStationType;
}
