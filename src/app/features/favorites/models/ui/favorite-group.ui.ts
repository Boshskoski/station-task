import { Station } from '@core/models/ui/station/station.ui';
import { FavoriteConnector } from '@features/favorites/models/ui/favorite-connector.ui';

export interface FavoriteGroup {
  readonly chargingStationId: number;
  readonly station: Station | undefined;
  readonly connectors: readonly FavoriteConnector[];
}
