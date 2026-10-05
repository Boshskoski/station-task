import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'favoriteLabel' })
export class FavoriteLabelPipe implements PipeTransform {
  transform(name: string, isFavorite: boolean): string {
    return isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`;
  }
}
