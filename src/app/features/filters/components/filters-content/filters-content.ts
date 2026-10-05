import { Component, computed, inject } from '@angular/core';
import { StationsStore } from '@core/store/stations.store';
import { FilterGroup } from '@features/filters/components/filters-content/filter-group/filter-group';
import {
  AVAILABILITY_FILTER_OPTIONS,
  OPENING_FILTER_OPTIONS,
} from '@features/filters/constants/station-filter-options.const';
import { FilterOptionsService } from '@features/filters/services/filter-options.service';
import { FiltersStore } from '@features/filters/store/filters.store';

@Component({
  selector: 'app-filters-content',
  imports: [FilterGroup],
  templateUrl: './filters-content.html',
  styleUrl: './filters-content.scss',
})
export class FiltersContent {
  protected readonly filtersStore = inject(FiltersStore);
  private readonly stationsStore = inject(StationsStore);
  private readonly filterOptions = inject(FilterOptionsService);

  protected readonly availabilityOptions = AVAILABILITY_FILTER_OPTIONS;
  protected readonly openingOptions = OPENING_FILTER_OPTIONS;
  protected readonly connectorTypeOptions = computed(() =>
    this.filterOptions.connectorTypeOptions(this.stationsStore.stations()),
  );
}
