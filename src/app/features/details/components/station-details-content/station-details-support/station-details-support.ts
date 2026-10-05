import { Component, input } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { call, globe, headset, mail } from 'ionicons/icons';
import { StationSupportInformation } from '@features/details/models/ui/station-support-information.ui';
import { MailtoHrefPipe } from '@features/details/pipes/mailto-href.pipe';
import { TelHrefPipe } from '@features/details/pipes/tel-href.pipe';

@Component({
  selector: 'app-station-details-support',
  imports: [IonButton, IonIcon, MailtoHrefPipe, TelHrefPipe],
  templateUrl: './station-details-support.html',
  styleUrl: './station-details-support.scss',
})
export class StationDetailsSupport {
  readonly support = input.required<StationSupportInformation>();
  readonly ownerName = input.required<string>();

  constructor() {
    addIcons({ call, globe, headset, mail });
  }
}
