import { DecimalPipe } from '@angular/common';
import { Component, inject, input, model } from '@angular/core';
import { IonButton, IonContent, IonFooter, IonIcon, IonPopover, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { StationsStore } from '@core/store/stations.store';
import { FiltersContent } from '@features/filters/components/filters-content/filters-content';
import { FiltersHeader } from '@features/filters/components/filters-header/filters-header';
import { FILTERS_TRIGGER_ID } from '@features/filters/constants/filters-trigger-id.const';
import { NonModalPopover } from '@shared/directives/non-modal-popover.directive';
import { PluralPipe } from '@shared/pipes/plural.pipe';

@Component({
  selector: 'app-filters-desktop',
  imports: [
    IonPopover,
    IonToolbar,
    IonButton,
    IonIcon,
    IonContent,
    IonFooter,
    FiltersHeader,
    FiltersContent,
    DecimalPipe,
    PluralPipe,
    NonModalPopover,
  ],
  templateUrl: './filters-desktop.html',
  styleUrl: './filters-desktop.scss',
})
export class FiltersDesktop {
  readonly open = model(false);
  readonly matchCount = input.required<number>();

  protected readonly stationsStore = inject(StationsStore);
  protected readonly triggerId = FILTERS_TRIGGER_ID;

  constructor() {
    addIcons({ close });
  }
}
