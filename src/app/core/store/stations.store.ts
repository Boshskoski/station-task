import { computed, inject, Service } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Station } from '@core/models/ui/station/station.ui';
import { StationsApiService } from '@core/services/stations-api.service';

@Service()
export class StationsStore {
  private readonly api = inject(StationsApiService);

  private readonly stationsResource = rxResource({ stream: () => this.api.getStations() });

  readonly stations = computed<readonly Station[]>(() =>
    this.stationsResource.hasValue() ? this.stationsResource.value() : [],
  );
  readonly status = this.stationsResource.status;

  reload(): void {
    this.stationsResource.reload();
  }

  findStation(chargingStationId: number | undefined): Station | undefined {
    return chargingStationId === undefined
      ? undefined
      : this.stations().find((station) => station.chargingStationId === chargingStationId);
  }
}
