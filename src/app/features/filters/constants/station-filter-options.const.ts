import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { OpeningFilter } from '@features/filters/enums/opening-filter.enum';
import { FilterOption } from '@features/filters/models/ui/filter-option.ui';

export const AVAILABILITY_FILTER_OPTIONS: readonly FilterOption<AvailabilityFilter>[] = [
  { value: AvailabilityFilter.Available, label: 'Has free chargers' },
  { value: AvailabilityFilter.Unavailable, label: 'No free chargers' },
];

export const OPENING_FILTER_OPTIONS: readonly FilterOption<OpeningFilter>[] = [
  { value: OpeningFilter.Open, label: 'Open' },
  { value: OpeningFilter.Closed, label: 'Closed' },
];
