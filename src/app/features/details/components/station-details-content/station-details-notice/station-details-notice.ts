import { Component, output } from '@angular/core';
import { IonButton } from '@ionic/angular';

@Component({
  selector: 'app-station-details-notice',
  imports: [IonButton],
  templateUrl: './station-details-notice.html',
  styleUrl: './station-details-notice.scss',
})
export class StationDetailsNotice {
  readonly retry = output<void>();
}
