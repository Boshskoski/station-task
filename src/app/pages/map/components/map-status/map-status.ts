import { Component, input, output, ResourceStatus } from '@angular/core';
import { IonButton, IonSpinner, IonText } from '@ionic/angular';

@Component({
  selector: 'app-map-status',
  imports: [IonButton, IonSpinner, IonText],
  templateUrl: './map-status.html',
  styleUrl: './map-status.scss',
  host: { 'aria-live': 'polite' },
})
export class MapStatus {
  readonly stationsStatus = input.required<ResourceStatus>();
  readonly stationCount = input.required<number>();
  readonly matchCount = input.required<number>();
  readonly detailsLoading = input(false);
  readonly retry = output<void>();
  readonly clearFilters = output<void>();
}
