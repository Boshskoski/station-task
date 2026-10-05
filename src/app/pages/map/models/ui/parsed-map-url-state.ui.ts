import { StationFilters } from '@features/filters/models/ui/station-filters.ui';
import { MapUrlState } from './map-url-state.ui';

export interface ParsedMapUrlState extends Omit<MapUrlState, 'filters'> {
  readonly filters: StationFilters | undefined;
}
