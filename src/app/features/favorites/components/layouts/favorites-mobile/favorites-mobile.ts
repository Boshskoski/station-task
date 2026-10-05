import { Component, model, output } from '@angular/core';
import { IonButton, IonModal } from '@ionic/angular';
import { Station } from '@core/models/ui/station/station.ui';
import { FavoritesContent } from '@features/favorites/components/favorites-content/favorites-content';
import { FavoritesHeader } from '@features/favorites/components/favorites-header/favorites-header';

@Component({
  selector: 'app-favorites-mobile',
  imports: [IonModal, IonButton, FavoritesHeader, FavoritesContent],
  templateUrl: './favorites-mobile.html',
})
export class FavoritesMobile {
  readonly open = model(false);
  readonly stationSelected = output<Station>();
}
