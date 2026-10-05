import { TypeCostCharging } from '@features/details/enums/type-cost-charging.enum';

export interface StationPricing {
  readonly typeCostCharging: TypeCostCharging;
  readonly chargingCostKWH: number;
  readonly costPriceVATPercentage: number;
  readonly currency: string;
  readonly startupCostPrice: number;
}
