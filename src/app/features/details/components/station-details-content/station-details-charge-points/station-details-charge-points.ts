import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { IonButton, IonChip, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { ChargePoint } from '@features/details/models/ui/charge-point.ui';
import { ChargePointStatusColorPipe } from '@features/details/pipes/charge-point-status-color.pipe';
import { FavoriteLabelPipe } from '@shared/pipes/favorite-label.pipe';

@Component({
  selector: 'app-station-details-charge-points',
  imports: [
    IonButton,
    IonChip,
    IonIcon,
    DecimalPipe,
    ChargePointStatusColorPipe,
    FavoriteLabelPipe,
  ],
  templateUrl: './station-details-charge-points.html',
  styleUrl: './station-details-charge-points.scss',
})
export class StationDetailsChargePoints {
  readonly chargePoints = input.required<readonly ChargePoint[]>();
  readonly favoriteIds = input<ReadonlySet<number>>(new Set());
  readonly favoriteToggled = output<ChargePoint>();

  constructor() {
    addIcons({ heart, heartOutline });
  }
}
