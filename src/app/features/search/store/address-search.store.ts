import { computed, inject, Service, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { ADDRESS_SEARCH_CONFIG } from '@features/search/constants/address-search-config.const';
import { GeocodedPlace } from '@features/search/models/ui/geocoded-place.ui';
import { GeocodingApiService } from '@features/search/services/geocoding-api.service';

@Service()
export class AddressSearchStore {
  private static readonly NO_RESULTS: readonly GeocodedPlace[] = [];

  private readonly api = inject(GeocodingApiService);

  private readonly searchText = signal('');
  private readonly term = signal<string | undefined>(undefined);
  private readonly place = signal<GeocodedPlace | undefined>(undefined);
  private readonly panelVisible = signal(false);
  private readonly selectingFirst = signal(false);
  private readonly resource = rxResource({
    params: () => this.term(),
    stream: ({ params }) =>
      this.api.search(params).pipe(
        tap({
          next: (places) => this.finishSelectingFirst(places),
          error: () => this.finishSelectingFirst(AddressSearchStore.NO_RESULTS),
        }),
      ),
  });

  readonly query = this.searchText.asReadonly();
  readonly selectedPlace = this.place.asReadonly();
  readonly panelOpen = this.panelVisible.asReadonly();
  readonly status = this.resource.status;
  readonly isLoading = this.resource.isLoading;
  readonly results = computed(() =>
    this.resource.hasValue() ? this.resource.value() : AddressSearchStore.NO_RESULTS,
  );

  search(text: string): void {
    this.selectingFirst.set(false);
    this.setQuery(text);
    this.panelVisible.set(this.term() !== undefined);
  }

  submit(text: string): void {
    const [first] = this.results();
    if (this.toTerm(text) === this.term() && this.status() === 'resolved') {
      if (first) {
        this.select(first);
      }
      return;
    }
    this.searchAndSelectFirst(text);
  }

  searchAndSelectFirst(text: string): void {
    this.setQuery(text);
    this.selectingFirst.set(this.term() !== undefined);
  }

  select(place: GeocodedPlace): void {
    this.place.set({ ...place });
    this.searchText.set(place.displayName);
    this.panelVisible.set(false);
  }

  reopen(): void {
    const showsSelectedPlace = this.selectedPlace()?.displayName === this.query();
    this.panelVisible.set(this.term() !== undefined && !showsSelectedPlace);
  }

  closePanel(): void {
    this.panelVisible.set(false);
  }

  retry(): void {
    this.resource.reload();
  }

  clear(): void {
    this.selectingFirst.set(false);
    this.searchText.set('');
    this.term.set(undefined);
    this.place.set(undefined);
    this.panelVisible.set(false);
  }

  private setQuery(text: string): void {
    this.searchText.set(text);
    this.term.set(this.toTerm(text));
  }

  private toTerm(text: string): string | undefined {
    const trimmed = text.trim();
    return trimmed.length >= ADDRESS_SEARCH_CONFIG.minQueryLength ? trimmed : undefined;
  }

  private finishSelectingFirst([first]: readonly GeocodedPlace[]): void {
    if (!this.selectingFirst()) {
      return;
    }
    this.selectingFirst.set(false);
    if (first) {
      this.select(first);
    } else {
      this.panelVisible.set(true);
    }
  }
}
