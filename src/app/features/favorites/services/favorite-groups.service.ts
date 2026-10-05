import { Service } from '@angular/core';
import { Station } from '@core/models/ui/station/station.ui';
import { FavoriteGroup } from '@features/favorites/models/ui/favorite-group.ui';
import { Favorites } from '@features/favorites/models/ui/favorites.ui';

@Service()
export class FavoriteGroupsService {
  groupFavorites(
    stations: readonly Station[],
    { stations: favorites }: Favorites,
  ): readonly FavoriteGroup[] {
    if (favorites.length === 0) {
      return [];
    }
    const ids = new Set(favorites.map((favorite) => favorite.stationId));
    const found = new Map<number, Station>();
    for (const station of stations) {
      if (ids.has(station.chargingStationId)) {
        found.set(station.chargingStationId, station);
      }
    }
    return favorites.map(({ stationId, connectors }) => ({
      chargingStationId: stationId,
      station: found.get(stationId),
      connectors,
    }));
  }
}
