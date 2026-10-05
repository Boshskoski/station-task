import { Pipe, PipeTransform } from '@angular/core';
import { TYPE_COST_CHARGING_LABELS } from '@features/details/constants/station-details-labels.const';
import { TypeCostCharging } from '@features/details/enums/type-cost-charging.enum';

@Pipe({ name: 'costTypeLabel' })
export class CostTypeLabelPipe implements PipeTransform {
  transform(type: TypeCostCharging): string {
    return TYPE_COST_CHARGING_LABELS[type];
  }
}
