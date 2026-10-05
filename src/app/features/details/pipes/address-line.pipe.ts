import { Pipe, PipeTransform } from '@angular/core';
import { Station } from '@core/models/ui/station/station.ui';

@Pipe({ name: 'addressLine' })
export class AddressLinePipe implements PipeTransform {
  transform({ address, postCode, town, stateOrProvince, country }: Station): string {
    return [
      address,
      `${postCode} ${town}`,
      stateOrProvince !== town ? stateOrProvince : null,
      country,
    ]
      .filter(Boolean)
      .join(', ');
  }
}
