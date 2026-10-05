import { Pipe, PipeTransform } from '@angular/core';
import { FavoriteGroup } from '@features/favorites/models/ui/favorite-group.ui';

@Pipe({ name: 'favoriteStationName' })
export class FavoriteStationNamePipe implements PipeTransform {
  transform({ station, chargingStationId }: FavoriteGroup): string {
    return station?.name ?? `Station ${chargingStationId}`;
  }
}
