import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@env/environment';
import { Station } from '@core/models/ui/station/station.ui';

@Pipe({ name: 'directionsHref' })
export class DirectionsHrefPipe implements PipeTransform {
  transform({ latitude, longitude }: Station): string {
    const url = new URL(environment.directionsUrl);
    url.searchParams.set('api', '1');
    url.searchParams.set('destination', `${latitude},${longitude}`);
    return url.toString();
  }
}
