import { Component, computed, inject } from '@angular/core';
import { IonFab, IonFabButton, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { locate } from 'ionicons/icons';
import { UserLocationStore } from '@features/location/store/user-location.store';

@Component({
  selector: 'app-locate-button',
  imports: [IonFab, IonFabButton, IonIcon, IonSpinner],
  templateUrl: './locate-button.html',
  styleUrl: './locate-button.scss',
})
export class LocateButton {
  protected readonly locationStore = inject(UserLocationStore);

  protected readonly color = computed(() => (this.locationStore.position() ? 'primary' : 'light'));

  constructor() {
    addIcons({ locate });
  }
}
