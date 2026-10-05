import { ChargingStationType } from '@core/enums/station/charging-station-type.enum';
import { StationConnectorDto } from './station-connector.dto';

export interface StationDto {
  readonly IsFavorite: boolean;
  readonly PK_ChargingStationID: number;
  readonly Name: string;
  readonly Address: string;
  readonly PostCode: string;
  readonly Town: string;
  readonly StateOrProvince: string | null;
  readonly Country: string;
  readonly Latitude: number;
  readonly Longitude: number;
  readonly kWhMin: number;
  readonly kWhMax: number;
  readonly Distance: number;
  readonly IsOpen: boolean;
  readonly availableBoxes: number;
  readonly offlineBoxes: number;
  readonly occupiedBoxes: number;
  readonly totalBoxes: number;
  readonly Connectors: readonly StationConnectorDto[];
  readonly OperatorName: string;
  readonly OperatorLogoURL: string;
  readonly IsActive: boolean;
  readonly ChargingStationType: ChargingStationType;
}
