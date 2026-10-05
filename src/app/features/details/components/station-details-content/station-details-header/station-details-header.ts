import { Component, input } from '@angular/core';
import { IonButton, IonChip, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { navigate } from 'ionicons/icons';
import { Station } from '@core/models/ui/station/station.ui';
import { AddressLinePipe } from '@features/details/pipes/address-line.pipe';
import { DirectionsHrefPipe } from '@features/details/pipes/directions-href.pipe';
import { PowerRangePipe } from '@features/details/pipes/power-range.pipe';
import { StationTypeLabelPipe } from '@features/details/pipes/station-type-label.pipe';

@Component({
  selector: 'app-station-details-header',
  imports: [
    IonButton,
    IonChip,
    IonIcon,
    AddressLinePipe,
    DirectionsHrefPipe,
    PowerRangePipe,
    StationTypeLabelPipe,
  ],
  templateUrl: './station-details-header.html',
  styleUrl: './station-details-header.scss',
})
export class StationDetailsHeader {
  readonly station = input.required<Station>();

  constructor() {
    addIcons({ navigate });
  }
}
