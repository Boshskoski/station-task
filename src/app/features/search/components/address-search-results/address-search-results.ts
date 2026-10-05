import { Component, computed, DOCUMENT, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonPopover, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { locationOutline } from 'ionicons/icons';
import { ADDRESS_SEARCH_CONFIG } from '@features/search/constants/address-search-config.const';
import { AddressSearchStore } from '@features/search/store/address-search.store';
import { NonModalPopover } from '@shared/directives/non-modal-popover.directive';
import { ViewportService } from '@shared/services/viewport.service';

@Component({
  selector: 'app-address-search-results',
  imports: [
    IonPopover,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonSpinner,
    IonButton,
    NonModalPopover,
  ],
  templateUrl: './address-search-results.html',
  styleUrl: './address-search-results.scss',
})
export class AddressSearchResults {
  protected readonly searchStore = inject(AddressSearchStore);
  protected readonly triggerId = ADDRESS_SEARCH_CONFIG.triggerId;

  private readonly document = inject(DOCUMENT);
  private readonly viewport = inject(ViewportService);
  private readonly anchorBottom = signal(0);

  protected readonly maxHeight = computed(() => {
    const { resultsMaxHeight, resultsMinHeight, resultsEdgeGap } = ADDRESS_SEARCH_CONFIG;
    const room = this.viewport.visibleBottom() - this.anchorBottom() - resultsEdgeGap;
    return Math.min(resultsMaxHeight, Math.max(resultsMinHeight, room));
  });

  constructor() {
    addIcons({ locationOutline });
  }

  protected prepare(): void {
    const trigger = this.document.getElementById(this.triggerId);
    const searchbar = this.document.getElementById(ADDRESS_SEARCH_CONFIG.searchbarId);
    this.anchorBottom.set(trigger?.getBoundingClientRect().bottom ?? 0);
    // Opening a popover blurs the searchbar while the user is still typing.
    searchbar?.querySelector('input')?.focus();
  }
}
