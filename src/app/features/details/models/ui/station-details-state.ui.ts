import { ResourceStatus } from '@angular/core';
import { StationDetails } from '@features/details/models/ui/station-details.ui';

export interface StationDetailsState {
  readonly stationId: number;
  readonly details: StationDetails | undefined;
  readonly status: ResourceStatus;
}
