import { ChargePointStatus } from '@features/details/enums/charge-point-status.enum';
import { ChargePointConnector } from './charge-point-connector.ui';

export interface ChargePoint {
  readonly chargePointId: number;
  readonly name: string;
  readonly isActive: boolean;
  readonly isOpen: boolean;
  readonly currentStatus: ChargePointStatus;
  readonly maxKW: number;
  readonly volts: number;
  readonly connectorTypes: readonly ChargePointConnector[];
  readonly chargerCode: string;
}
