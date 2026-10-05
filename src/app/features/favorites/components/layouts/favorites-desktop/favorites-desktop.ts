import { Component, model, output } from '@angular/core';
import { IonButton, IonContent, IonIcon, IonPopover } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { Station } from '@core/models/ui/station/station.ui';
import { FavoritesContent } from '@features/favorites/components/favorites-content/favorites-content';
import { FavoritesHeader } from '@features/favorites/components/favorites-header/favorites-header';
import { FAVORITES_TRIGGER_ID } from '@features/favorites/constants/favorites-trigger-id.const';
import { NonModalPopover } from '@shared/directives/non-modal-popover.directive';

@Component({
  selector: 'app-favorites-desktop',
  imports: [
    IonPopover,
    IonButton,
    IonIcon,
    IonContent,
    FavoritesHeader,
    FavoritesContent,
    NonModalPopover,
  ],
  templateUrl: './favorites-desktop.html',
  styleUrl: './favorites-desktop.scss',
})
export class FavoritesDesktop {
  readonly open = model(false);
  readonly stationSelected = output<Station>();

  protected readonly triggerId = FAVORITES_TRIGGER_ID;

  constructor() {
    addIcons({ close });
  }
}
