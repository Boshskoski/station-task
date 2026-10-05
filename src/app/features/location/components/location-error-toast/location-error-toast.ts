import { Component, inject } from '@angular/core';
import { IonToast } from '@ionic/angular';
import { LOCATION_CONFIG } from '@features/location/constants/location-config.const';
import { LocationErrorMessagePipe } from '@features/location/pipes/location-error-message.pipe';
import { UserLocationStore } from '@features/location/store/user-location.store';

@Component({
  selector: 'app-location-error-toast',
  imports: [IonToast, LocationErrorMessagePipe],
  templateUrl: './location-error-toast.html',
})
export class LocationErrorToast {
  protected readonly locationStore = inject(UserLocationStore);

  protected readonly duration = LOCATION_CONFIG.toastDurationMs;
  protected readonly buttons = [{ text: 'Dismiss', role: 'cancel' }];
}
