import { Component, computed, inject, output } from '@angular/core';
import { IonButton, IonList, IonSpinner } from '@ionic/angular';
import { Station } from '@core/models/ui/station/station.ui';
import { StationsStore } from '@core/store/stations.store';
import { FavoriteRow } from '@features/favorites/components/favorite-row/favorite-row';
import { FavoriteStationNamePipe } from '@features/favorites/pipes/favorite-station-name.pipe';
import { FavoriteGroupsService } from '@features/favorites/services/favorite-groups.service';
import { FavoritesStore } from '@features/favorites/store/favorites.store';

@Component({
  selector: 'app-favorites-content',
  imports: [IonList, IonButton, IonSpinner, FavoriteRow, FavoriteStationNamePipe],
  templateUrl: './favorites-content.html',
  styleUrl: './favorites-content.scss',
})
export class FavoritesContent {
  readonly stationSelected = output<Station>();

  protected readonly stationsStore = inject(StationsStore);
  protected readonly favoritesStore = inject(FavoritesStore);

  private readonly groupsService = inject(FavoriteGroupsService);

  protected readonly groups = computed(() =>
    this.groupsService.groupFavorites(this.stationsStore.stations(), this.favoritesStore.shown()),
  );

  protected selectStation(station: Station | undefined): void {
    if (station) {
      this.stationSelected.emit(station);
    }
  }
}
