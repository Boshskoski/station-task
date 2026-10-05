import { formatNumber } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { Station } from '@core/models/ui/station/station.ui';

@Pipe({ name: 'powerRange' })
export class PowerRangePipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform({ kWhMin, kWhMax }: Station): string {
    const min = formatNumber(kWhMin, this.locale, '1.0-1');
    return kWhMax === kWhMin
      ? `${min} kW`
      : `${min} – ${formatNumber(kWhMax, this.locale, '1.0-1')} kW`;
  }
}
