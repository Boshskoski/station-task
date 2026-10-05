import { computed, inject, linkedSignal, ResourceStatus, Service, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { StationDetailsState } from '@features/details/models/ui/station-details-state.ui';
import { StationDetails } from '@features/details/models/ui/station-details.ui';
import { StationDetailsApiService } from '@features/details/services/station-details-api.service';

@Service()
export class StationDetailsStore {
  private readonly api = inject(StationDetailsApiService);

  private readonly selectedId = signal<number | undefined>(undefined);
  private readonly cache = signal<ReadonlyMap<number, StationDetails>>(new Map());
  private readonly detailsResource = rxResource({
    params: () => this.selectedId(),
    stream: ({ params }) =>
      this.api.getStationDetails(params).pipe(tap((details) => this.remember(params, details))),
  });

  readonly selectedStationId = this.selectedId.asReadonly();
  readonly details = computed<StationDetails | undefined>(() => {
    const id = this.selectedId();
    return id === undefined ? undefined : this.cache().get(id);
  });
  readonly status = computed<ResourceStatus>(() => {
    if (this.details()) {
      return 'resolved';
    }
    if (this.detailsResource.error()) {
      return 'error';
    }
    return this.selectedId() === undefined ? 'idle' : 'loading';
  });

  private readonly selectedState = computed<StationDetailsState | undefined>(() => {
    const stationId = this.selectedId();
    return stationId === undefined
      ? undefined
      : { stationId, details: this.details(), status: this.status() };
  });

  readonly presented = linkedSignal<
    StationDetailsState | undefined,
    StationDetailsState | undefined
  >({
    source: this.selectedState,
    computation: (state, previous) => (state?.status === 'loading' ? previous?.value : state),
  });

  selectStation(chargingStationId: number): void {
    this.selectedId.set(chargingStationId);
  }

  clearSelection(): void {
    this.selectedId.set(undefined);
  }

  reload(): void {
    this.detailsResource.reload();
  }

  private remember(chargingStationId: number, details: StationDetails): void {
    this.cache.update((cache) => new Map(cache).set(chargingStationId, details));
  }
}
