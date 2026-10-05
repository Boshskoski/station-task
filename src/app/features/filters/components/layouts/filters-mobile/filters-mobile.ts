import { Component, input, model } from '@angular/core';
import { IonButton, IonFooter, IonModal, IonToolbar } from '@ionic/angular';
import { FiltersContent } from '@features/filters/components/filters-content/filters-content';
import { FiltersHeader } from '@features/filters/components/filters-header/filters-header';
import { PluralPipe } from '@shared/pipes/plural.pipe';

@Component({
  selector: 'app-filters-mobile',
  imports: [IonModal, IonToolbar, IonButton, IonFooter, FiltersHeader, FiltersContent, PluralPipe],
  templateUrl: './filters-mobile.html',
  styleUrl: './filters-mobile.scss',
})
export class FiltersMobile {
  readonly open = model(false);
  readonly matchCount = input.required<number>();
}
