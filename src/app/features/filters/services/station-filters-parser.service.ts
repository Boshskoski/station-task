import { Service } from '@angular/core';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { OpeningFilter } from '@features/filters/enums/opening-filter.enum';
import { StationFilters } from '@features/filters/models/ui/station-filters.ui';

@Service()
export class StationFiltersParserService {
  private static readonly AVAILABILITY = Object.values(AvailabilityFilter);
  private static readonly OPENING = Object.values(OpeningFilter);
  private static readonly CONNECTOR_TYPES = Object.values(CPConnectorTypeID).filter(
    (value): value is CPConnectorTypeID => typeof value === 'number',
  );

  parse({ availability, opening, connectorTypes }: Partial<Record<keyof StationFilters, unknown>>): StationFilters {
    return {
      availability: this.knownValues(availability, StationFiltersParserService.AVAILABILITY),
      opening: this.knownValues(opening, StationFiltersParserService.OPENING),
      connectorTypes: this.knownValues(connectorTypes, StationFiltersParserService.CONNECTOR_TYPES),
    };
  }

  private knownValues<T>(candidate: unknown, known: readonly T[]): readonly T[] {
    return Array.isArray(candidate) ? known.filter((value) => candidate.includes(value)) : [];
  }
}
