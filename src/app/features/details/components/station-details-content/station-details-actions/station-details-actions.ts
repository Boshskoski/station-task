import { Component, input, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close, heart, heartOutline } from 'ionicons/icons';
import { FavoriteLabelPipe } from '@shared/pipes/favorite-label.pipe';

@Component({
  selector: 'app-station-details-actions',
  imports: [IonButton, IonIcon, FavoriteLabelPipe],
  templateUrl: './station-details-actions.html',
  styleUrl: './station-details-actions.scss',
})
export class StationDetailsActions {
  readonly favorite = input.required<boolean>();
  readonly favoriteToggled = output<void>();
  readonly closed = output<void>();

  constructor() {
    addIcons({ close, heart, heartOutline });
  }
}
