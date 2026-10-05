import { computed, inject, Service, signal } from '@angular/core';
import { EMPTY_STATION_FILTERS } from '@features/filters/constants/empty-station-filters.const';
import { StationFilters } from '@features/filters/models/ui/station-filters.ui';
import { StationFilterService } from '@features/filters/services/station-filter.service';
import { StationFiltersStorageService } from '@features/filters/services/station-filters-storage.service';

@Service()
export class FiltersStore {
  private readonly stationFilter = inject(StationFilterService);
  private readonly storage = inject(StationFiltersStorageService);

  private readonly state = signal<StationFilters>(this.storage.load());

  readonly filters = this.state.asReadonly();
  readonly activeFilterCount = computed(() => this.stationFilter.countActive(this.filters()));

  setFilters(filters: StationFilters): void {
    this.state.set(filters);
    this.storage.save(filters);
  }

  showFilters(filters: StationFilters): void {
    this.state.set(filters);
  }

  setFilter<K extends keyof StationFilters>(group: K, values: StationFilters[K]): void {
    this.setFilters({ ...this.filters(), [group]: values });
  }

  clearFilters(): void {
    this.setFilters(EMPTY_STATION_FILTERS);
  }
}
