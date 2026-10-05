import { Pipe, PipeTransform } from '@angular/core';
import { CHARGE_POINT_STATUS_COLORS } from '@features/details/constants/station-details-labels.const';
import { ChargePointStatus } from '@features/details/enums/charge-point-status.enum';

@Pipe({ name: 'chargePointStatusColor' })
export class ChargePointStatusColorPipe implements PipeTransform {
  transform(status: ChargePointStatus): string {
    return CHARGE_POINT_STATUS_COLORS[status];
  }
}
