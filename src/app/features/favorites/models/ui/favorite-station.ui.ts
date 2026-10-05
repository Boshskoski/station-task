import { FavoriteConnector } from './favorite-connector.ui';

export interface FavoriteStation {
  readonly stationId: number;
  readonly connectors: readonly FavoriteConnector[];
}
