import { TypeCostCharging } from '@features/details/enums/type-cost-charging.enum';

export interface StationPricingDto {
  readonly Type_Cost_Charging: TypeCostCharging;
  readonly ChargingCostKWH: number;
  readonly CostPriceVATPercentage: number;
  readonly Currency: string;
  readonly StartupCostPrice: number;
}
