import { ChargePoint } from './charge-point.ui';
import { StationPricing } from './station-pricing.ui';
import { StationSupportInformation } from './station-support-information.ui';

export interface StationDetails {
  readonly pricing: StationPricing;
  readonly support: StationSupportInformation;
  readonly ownedByCompanyName: string;
  readonly chargingPoints: readonly ChargePoint[];
}
