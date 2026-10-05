import { booleanAttribute, Component, inject, input } from '@angular/core';
import { IonSearchbar, SearchbarCustomEvent } from '@ionic/angular';
import { ADDRESS_SEARCH_CONFIG } from '@features/search/constants/address-search-config.const';
import { AddressSearchStore } from '@features/search/store/address-search.store';

@Component({
  selector: 'app-address-search',
  imports: [IonSearchbar],
  templateUrl: './address-search.html',
  styleUrl: './address-search.scss',
  host: { '[class.address-search--compact]': 'compact()' },
})
export class AddressSearch {
  readonly compact = input(false, { transform: booleanAttribute });

  protected readonly searchStore = inject(AddressSearchStore);
  protected readonly config = ADDRESS_SEARCH_CONFIG;

  private submittedAt = 0;

  protected onInput({ detail }: SearchbarCustomEvent): void {
    const typedAt = detail.event?.timeStamp;
    if (typedAt !== undefined && typedAt < this.submittedAt) {
      return;
    }
    this.searchStore.search(detail.value ?? '');
  }

  protected submit(event: Event): void {
    this.submittedAt = event.timeStamp;
    this.searchStore.submit((event.currentTarget as HTMLIonSearchbarElement).value ?? '');
  }
}
