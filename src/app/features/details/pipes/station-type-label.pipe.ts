import { Pipe, PipeTransform } from '@angular/core';
import { ChargingStationType } from '@core/enums/station/charging-station-type.enum';
import { CHARGING_STATION_TYPE_LABELS } from '@features/details/constants/station-details-labels.const';

@Pipe({ name: 'stationTypeLabel' })
export class StationTypeLabelPipe implements PipeTransform {
  transform(type: ChargingStationType): string {
    return CHARGING_STATION_TYPE_LABELS[type];
  }
}
