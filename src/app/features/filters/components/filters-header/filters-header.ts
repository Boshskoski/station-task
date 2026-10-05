import { Component, inject } from '@angular/core';
import { IonButton, IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { FiltersStore } from '@features/filters/store/filters.store';

@Component({
  selector: 'app-filters-header',
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton],
  templateUrl: './filters-header.html',
})
export class FiltersHeader {
  protected readonly filtersStore = inject(FiltersStore);
}
