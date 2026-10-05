import { Favorites } from '@features/favorites/models/ui/favorites.ui';
import { StationFilters } from '@features/filters/models/ui/station-filters.ui';

export interface MapUrlState {
  readonly stationId: number | undefined;
  readonly query: string | undefined;
  readonly filters: StationFilters;
  readonly favorites: Favorites | undefined;
}
