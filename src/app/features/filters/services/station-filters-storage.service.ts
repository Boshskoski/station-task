import { inject, Service } from '@angular/core';
import { StorageService } from '@core/services/storage.service';
import { StorageKey } from '@core/types/storage-key.type';
import { StationFilters } from '@features/filters/models/ui/station-filters.ui';
import { StationFiltersParserService } from './station-filters-parser.service';

@Service()
export class StationFiltersStorageService {
  private static readonly KEY: StorageKey = 'stations.filters.v1';

  private readonly storage = inject(StorageService);
  private readonly parser = inject(StationFiltersParserService);

  load(): StationFilters {
    const stored = this.storage.read(StationFiltersStorageService.KEY);
    return this.parser.parse(typeof stored === 'object' && stored !== null ? stored : {});
  }

  save(filters: StationFilters): void {
    this.storage.write(StationFiltersStorageService.KEY, filters);
  }
}
