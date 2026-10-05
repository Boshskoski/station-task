import { StationPricingDto } from './station-pricing.dto';

export interface StationSummaryDto {
  readonly PricingNow: StationPricingDto;
}
