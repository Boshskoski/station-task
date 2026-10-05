import { booleanAttribute, Component, input, output } from '@angular/core';
import { IonButton, IonIcon, IonItem } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { flash, heart } from 'ionicons/icons';
import { FavoriteLabelPipe } from '@shared/pipes/favorite-label.pipe';

@Component({
  selector: 'app-favorite-row',
  imports: [IonItem, IonButton, IonIcon, FavoriteLabelPipe],
  templateUrl: './favorite-row.html',
  styleUrl: './favorite-row.scss',
})
export class FavoriteRow {
  readonly title = input.required<string>();
  readonly clickable = input(true);
  readonly connector = input(false, { transform: booleanAttribute });
  readonly selected = output<void>();
  readonly removed = output<void>();

  constructor() {
    addIcons({ flash, heart });
  }
}
