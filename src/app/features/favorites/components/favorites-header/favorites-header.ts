import { Component } from '@angular/core';
import { IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-favorites-header',
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons],
  templateUrl: './favorites-header.html',
})
export class FavoritesHeader {}
