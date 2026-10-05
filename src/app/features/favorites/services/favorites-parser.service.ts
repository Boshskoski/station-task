import { Service } from '@angular/core';
import { FavoriteConnector } from '@features/favorites/models/ui/favorite-connector.ui';
import { FavoriteStation } from '@features/favorites/models/ui/favorite-station.ui';
import { Favorites } from '@features/favorites/models/ui/favorites.ui';

@Service()
export class FavoritesParserService {
  private static readonly EMPTY: Favorites = { stations: [] };

  parse(value: unknown): Favorites {
    const { stations }: Partial<Record<keyof Favorites, unknown>> = this.asObject(value);
    if (!Array.isArray(stations)) {
      return FavoritesParserService.EMPTY;
    }
    const seen = new Set<number>();
    const favorites: FavoriteStation[] = [];
    for (const item of stations) {
      const { stationId, connectors }: Partial<Record<keyof FavoriteStation, unknown>> =
        this.asObject(item);
      if (this.isId(stationId) && !seen.has(stationId)) {
        seen.add(stationId);
        favorites.push({ stationId, connectors: this.connectors(connectors) });
      }
    }
    return { stations: favorites };
  }

  private connectors(value: unknown): readonly FavoriteConnector[] {
    if (!Array.isArray(value)) {
      return [];
    }
    const seen = new Set<number>();
    const connectors: FavoriteConnector[] = [];
    for (const item of value) {
      const { id, name }: Partial<Record<keyof FavoriteConnector, unknown>> = this.asObject(item);
      if (this.isId(id) && typeof name === 'string' && !seen.has(id)) {
        seen.add(id);
        connectors.push({ id, name });
      }
    }
    return connectors;
  }

  private asObject(value: unknown): object {
    return typeof value === 'object' && value !== null ? value : {};
  }

  private isId(value: unknown): value is number {
    return Number.isInteger(value);
  }
}
