import { inject, Service } from '@angular/core';
import { MapUrlReaderService } from '@pages/map/services/map-url-reader.service';
import { MapUrlWriterService } from '@pages/map/services/map-url-writer.service';

@Service({ autoProvided: false })
export class MapUrlSyncService {
  private readonly reader = inject(MapUrlReaderService);
  private readonly writer = inject(MapUrlWriterService);

  // The URL fills the stores first; only then the writer starts to mirror store changes into the URL.
  init(): void {
    this.reader.applyInitialUrl();
    this.writer.start();
    this.reader.start();
  }
}
