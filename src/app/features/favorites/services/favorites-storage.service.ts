import { inject, Service } from '@angular/core';
import { StorageService } from '@core/services/storage.service';
import { StorageKey } from '@core/types/storage-key.type';
import { Favorites } from '@features/favorites/models/ui/favorites.ui';
import { FavoritesParserService } from '@features/favorites/services/favorites-parser.service';

@Service()
export class FavoritesStorageService {
  private static readonly KEY: StorageKey = 'stations.favorites.v2';

  private readonly storage = inject(StorageService);
  private readonly parser = inject(FavoritesParserService);

  load(): Favorites {
    return this.parser.parse(this.storage.read(FavoritesStorageService.KEY));
  }

  save(favorites: Favorites): void {
    this.storage.write(FavoritesStorageService.KEY, favorites);
  }
}
