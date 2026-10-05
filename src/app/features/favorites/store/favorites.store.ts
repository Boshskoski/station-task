import { computed, inject, Service, signal } from '@angular/core';
import { FavoriteChargePoint } from '@features/favorites/models/ui/favorite-charge-point.ui';
import { FavoriteConnector } from '@features/favorites/models/ui/favorite-connector.ui';
import { FavoriteStation } from '@features/favorites/models/ui/favorite-station.ui';
import { Favorites } from '@features/favorites/models/ui/favorites.ui';
import { FavoritesStorageService } from '@features/favorites/services/favorites-storage.service';

@Service()
export class FavoritesStore {
  private readonly storage = inject(FavoritesStorageService);

  private readonly state = signal<Favorites>(this.storage.load());
  private readonly sharedState = signal<Favorites | undefined>(undefined);

  readonly favorites = this.state.asReadonly();
  readonly shared = this.sharedState.asReadonly();
  // A tab opened from a link shows the link's favorites everywhere until a heart click saves them.
  readonly shown = computed(() => this.sharedState() ?? this.state());
  readonly stationIds = computed<readonly number[]>(() =>
    this.shown().stations.map((station) => station.stationId),
  );
  readonly stationIdSet = computed<ReadonlySet<number>>(() => new Set(this.stationIds()));
  readonly chargePoints = computed<readonly FavoriteChargePoint[]>(() =>
    this.shown().stations.flatMap(({ stationId, connectors }) =>
      connectors.map(({ id, name }) => ({ chargingStationId: stationId, chargePointId: id, name })),
    ),
  );
  readonly count = computed(() =>
    this.shown().stations.reduce((count, station) => count + 1 + station.connectors.length, 0),
  );

  isStationFavorite(stationId: number): boolean {
    return this.stationIdSet().has(stationId);
  }

  isConnectorFavorite(stationId: number, connectorId: number): boolean {
    return this.chargePoints().some(
      (point) => point.chargingStationId === stationId && point.chargePointId === connectorId,
    );
  }

  matchesSaved(favorites: Favorites): boolean {
    return JSON.stringify(favorites) === JSON.stringify(this.state());
  }

  toggleStation(stationId: number): void {
    const { stations } = this.shown();
    this.update(
      this.isStationFavorite(stationId)
        ? stations.filter((station) => station.stationId !== stationId)
        : [...stations, { stationId, connectors: [] }],
    );
  }

  toggleConnector(stationId: number, connector: FavoriteConnector): void {
    const { stations } = this.shown();
    if (!this.isStationFavorite(stationId)) {
      this.update([...stations, { stationId, connectors: [connector] }]);
      return;
    }
    const isFavorite = this.isConnectorFavorite(stationId, connector.id);
    this.update(
      stations.map((station) =>
        station.stationId !== stationId
          ? station
          : {
              stationId,
              connectors: isFavorite
                ? station.connectors.filter((other) => other.id !== connector.id)
                : [...station.connectors, connector],
            },
      ),
    );
  }

  showShared(favorites: Favorites): void {
    this.sharedState.set(favorites);
  }

  private update(stations: readonly FavoriteStation[]): void {
    const favorites: Favorites = { stations };
    this.sharedState.set(undefined);
    this.state.set(favorites);
    this.storage.save(favorites);
  }
}
