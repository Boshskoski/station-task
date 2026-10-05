import { ResourceStatus } from '@angular/core';
import { Station } from '@core/models/ui/station/station.ui';
import { StationDetails } from '@features/details/models/ui/station-details.ui';

export interface StationDetailsView {
  readonly station: Station;
  readonly details: StationDetails | undefined;
  readonly status: ResourceStatus;
}
