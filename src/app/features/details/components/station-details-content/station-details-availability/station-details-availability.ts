import { Component, input } from '@angular/core';
import { Station } from '@core/models/ui/station/station.ui';

@Component({
  selector: 'app-station-details-availability',
  templateUrl: './station-details-availability.html',
  styleUrl: './station-details-availability.scss',
})
export class StationDetailsAvailability {
  readonly station = input.required<Station>();
}
