import { ChargePointStatus } from '@features/details/enums/charge-point-status.enum';
import { ChargePointConnectorDto } from './charge-point-connector.dto';

export interface ChargePointDto {
  readonly IsFavorite: boolean;
  readonly PK_ChargePointID: number;
  readonly Name: string;
  readonly IsActive: boolean;
  readonly IsOpen: boolean;
  readonly CurrentStatus: ChargePointStatus;
  readonly MaxKWH: number;
  readonly MaxKW: number;
  readonly Volts: number;
  readonly ConnectorTypes: readonly ChargePointConnectorDto[];
  readonly ChargerCode: string;
}
