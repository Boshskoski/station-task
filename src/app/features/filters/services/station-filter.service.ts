import { Service } from '@angular/core';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { Station } from '@core/models/ui/station/station.ui';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { OpeningFilter } from '@features/filters/enums/opening-filter.enum';
import { StationFilters } from '@features/filters/models/ui/station-filters.ui';

@Service()
export class StationFilterService {
  filterStations(stations: readonly Station[], filters: StationFilters): readonly Station[] {
    return this.countActive(filters) === 0
      ? stations
      : stations.filter((station) => this.matches(station, filters));
  }

  countActive({ availability, opening, connectorTypes }: StationFilters): number {
    return availability.length + opening.length + connectorTypes.length;
  }

  isSameResult(previous: readonly Station[], next: readonly Station[]): boolean {
    return (
      previous === next ||
      (previous.length === next.length && previous.every((station, i) => station === next[i]))
    );
  }

  private matches(station: Station, filters: StationFilters): boolean {
    return (
      this.matchesAvailability(station, filters.availability) &&
      this.matchesOpening(station, filters.opening) &&
      this.matchesConnectorTypes(station, filters.connectorTypes)
    );
  }

  private matchesAvailability(station: Station, selected: readonly AvailabilityFilter[]): boolean {
    return (
      selected.length === 0 ||
      selected.includes(
        station.availableBoxes > 0 ? AvailabilityFilter.Available : AvailabilityFilter.Unavailable,
      )
    );
  }

  private matchesOpening(station: Station, selected: readonly OpeningFilter[]): boolean {
    return (
      selected.length === 0 ||
      selected.includes(station.isOpen ? OpeningFilter.Open : OpeningFilter.Closed)
    );
  }

  private matchesConnectorTypes(station: Station, selected: readonly CPConnectorTypeID[]): boolean {
    return (
      selected.length === 0 ||
      station.connectors.some((connector) => selected.includes(connector.cpConnectorTypeId))
    );
  }
}
