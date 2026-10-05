import { ChargingStationType } from '@core/enums/station/charging-station-type.enum';
import { StationConnectorDto } from '@core/models/dto/station/station-connector.dto';
import { ChargePointDto } from './charge-point.dto';
import { StationSummaryDto } from './station-summary.dto';
import { StationSupportInformationDto } from './station-support-information.dto';

export interface StationDetailsDto {
  readonly Summary: StationSummaryDto;
  readonly SupportInformation: StationSupportInformationDto;
  readonly OwnedByCompanyName: string;
  readonly Currency: string;
  readonly IsFavorite: boolean;
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
  readonly IsOpen: boolean;
  readonly ChargingPoints: readonly ChargePointDto[];
  readonly availableBoxes: number;
  readonly offlineBoxes: number;
  readonly totalBoxes: number;
  readonly Connectors: readonly StationConnectorDto[];
  readonly OperatorName: string;
  readonly OperatorLogoURL: string;
  readonly IsActive: boolean;
  readonly ChargingStationType: ChargingStationType;
}
