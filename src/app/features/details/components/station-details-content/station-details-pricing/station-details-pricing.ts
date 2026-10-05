import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { StationPricing } from '@features/details/models/ui/station-pricing.ui';
import { CostTypeLabelPipe } from '@features/details/pipes/cost-type-label.pipe';

@Component({
  selector: 'app-station-details-pricing',
  imports: [CurrencyPipe, CostTypeLabelPipe],
  templateUrl: './station-details-pricing.html',
  styleUrl: './station-details-pricing.scss',
})
export class StationDetailsPricing {
  readonly pricing = input.required<StationPricing>();
}
