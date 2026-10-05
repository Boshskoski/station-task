import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { OpeningFilter } from '@features/filters/enums/opening-filter.enum';

export interface StationFilters {
  readonly availability: readonly AvailabilityFilter[];
  readonly opening: readonly OpeningFilter[];
  readonly connectorTypes: readonly CPConnectorTypeID[];
}
