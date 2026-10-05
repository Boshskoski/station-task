import { Component, inject, input } from '@angular/core';
import { IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { flash, moon, sunny } from 'ionicons/icons';
import { ThemeService } from '@shared/services/theme.service';

@Component({
  selector: 'app-page-header',
  imports: [IonHeader, IonToolbar, IonTitle, IonIcon, IonButtons, IonButton],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {
  readonly heading = input.required<string>();

  protected readonly theme = inject(ThemeService);

  constructor() {
    addIcons({ flash, moon, sunny });
  }
}
