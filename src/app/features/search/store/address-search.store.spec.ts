import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GeocodingApiService } from '@features/search/services/geocoding-api.service';
import { geocodedPlace, nominatimPlaceDto } from '@features/search/testing/search.fixtures';
import { AddressSearchStore } from './address-search.store';

describe('AddressSearchStore', () => {
  let store: AddressSearchStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AddressSearchStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function settle(): Promise<void> {
    TestBed.tick();
    await Promise.resolve();
    TestBed.tick();
  }

  function pending() {
    return http.match((req) => req.url === GeocodingApiService.URL);
  }

  it('is idle and sends no request for a query shorter than three characters', async () => {
    store.search('os');
    await settle();

    expect(store.status()).toBe('idle');
    expect(store.panelOpen()).toBeFalse();
    expect(pending().length).toBe(0);
  });

  it('searches the trimmed query and exposes the results', async () => {
    store.search('  oslo  ');
    await settle();

    expect(store.status()).toBe('loading');
    expect(store.panelOpen()).toBeTrue();
    const [request] = pending();
    expect(request.request.params.get('q')).toBe('oslo');
    request.flush([nominatimPlaceDto()]);
    await settle();

    expect(store.status()).toBe('resolved');
    expect(store.results()).toEqual([geocodedPlace()]);
  });

  it('reports an empty result', async () => {
    store.search('nowhere');
    await settle();
    pending()[0].flush([]);
    await settle();

    expect(store.status()).toBe('resolved');
    expect(store.results()).toEqual([]);
  });

  it('reports an error and retries the request', async () => {
    store.search('oslo');
    await settle();
    pending()[0].flush(null, { status: 500, statusText: 'Server Error' });
    await settle();

    expect(store.status()).toBe('error');

    store.retry();
    await settle();
    expect(pending().length).toBe(1);
  });

  it('cancels the in-flight request when the query changes', async () => {
    store.search('oslo');
    await settle();
    const [first] = pending();

    store.search('bergen');
    await settle();

    expect(first.cancelled).toBeTrue();
    expect(pending().map((req) => req.request.params.get('q'))).toEqual(['bergen']);
  });

  it('selects a place, shows its name in the search box and closes the panel without searching again', async () => {
    store.search('karl');
    await settle();
    pending()[0].flush([nominatimPlaceDto()]);
    await settle();

    store.select(geocodedPlace());
    await settle();

    expect(store.selectedPlace()).toEqual(geocodedPlace());
    expect(store.query()).toBe(geocodedPlace().displayName);
    expect(store.panelOpen()).toBeFalse();
    expect(pending().length).toBe(0);
  });

  it('gives every pick a new object, so picking the same place again still moves the map', () => {
    store.select(geocodedPlace());
    const firstPick = store.selectedPlace();

    store.select(geocodedPlace());

    expect(store.selectedPlace()).toEqual(geocodedPlace());
    expect(store.selectedPlace()).not.toBe(firstPick);
  });

  it('submits text that was already searched by selecting its first result at once', async () => {
    store.search('oslo');
    await settle();
    pending()[0].flush([nominatimPlaceDto(), nominatimPlaceDto({ place_id: 202 })]);
    await settle();

    store.submit(' oslo ');
    await settle();

    expect(store.selectedPlace()).toEqual(geocodedPlace());
    expect(store.panelOpen()).toBeFalse();
    expect(pending().length).toBe(0);
  });

  it('submits new text by searching it right away and selecting its first result', async () => {
    store.search('oslo');
    await settle();
    pending()[0].flush([nominatimPlaceDto()]);
    await settle();

    store.submit('bergen');
    await settle();
    const [request] = pending();
    expect(request.request.params.get('q')).toBe('bergen');
    request.flush([nominatimPlaceDto({ place_id: 5, display_name: 'Bergen, Norway' })]);
    await settle();

    expect(store.selectedPlace()?.placeId).toBe(5);
    expect(store.query()).toBe('Bergen, Norway');
  });

  it('submits text whose search is still running by selecting its first result when it arrives', async () => {
    store.search('oslo');
    await settle();

    store.submit('oslo');
    await settle();
    expect(store.selectedPlace()).toBeUndefined();
    const requests = pending();
    expect(requests.length).toBe(1);
    requests[0].flush([nominatimPlaceDto()]);
    await settle();

    expect(store.selectedPlace()).toEqual(geocodedPlace());
  });

  it('reopens the panel only when there is a search to show', async () => {
    store.reopen();
    expect(store.panelOpen()).toBeFalse();

    store.search('oslo');
    store.closePanel();
    store.reopen();

    expect(store.panelOpen()).toBeTrue();
    await settle();
    pending();
  });

  it('stays closed when the searchbar gets focus back while it shows the selected place', async () => {
    store.search('karl');
    await settle();
    pending()[0].flush([nominatimPlaceDto()]);
    await settle();
    store.select(geocodedPlace());
    store.closePanel();

    store.reopen();

    expect(store.panelOpen()).toBeFalse();
  });

  it('reopens the panel on focus once the text of the selected place is edited', async () => {
    store.search('karl');
    await settle();
    pending()[0].flush([nominatimPlaceDto()]);
    await settle();
    store.select(geocodedPlace());
    store.search(`${geocodedPlace().displayName} 1`);
    store.closePanel();

    store.reopen();

    expect(store.panelOpen()).toBeTrue();
    await settle();
    pending();
  });

  it('clears the query, the results and the selected place', async () => {
    store.search('oslo');
    await settle();
    pending()[0].flush([nominatimPlaceDto()]);
    await settle();
    store.select(geocodedPlace());

    store.clear();
    await settle();

    expect(store.query()).toBe('');
    expect(store.selectedPlace()).toBeUndefined();
    expect(store.status()).toBe('idle');
    expect(store.results()).toEqual([]);
  });

  it('searches a query and selects the first result without opening the panel', async () => {
    store.searchAndSelectFirst('karl johan');
    await settle();

    expect(store.query()).toBe('karl johan');
    expect(store.panelOpen()).toBeFalse();
    const [request] = pending();
    expect(request.request.params.get('q')).toBe('karl johan');
    request.flush([nominatimPlaceDto(), nominatimPlaceDto({ place_id: 202 })]);
    await settle();

    expect(store.selectedPlace()).toEqual(geocodedPlace());
    expect(store.query()).toBe(geocodedPlace().displayName);
    expect(store.panelOpen()).toBeFalse();
  });

  it('opens the panel when a query to select from finds nothing', async () => {
    store.searchAndSelectFirst('nowhere');
    await settle();
    pending()[0].flush([]);
    await settle();

    expect(store.selectedPlace()).toBeUndefined();
    expect(store.status()).toBe('resolved');
    expect(store.results()).toEqual([]);
    expect(store.panelOpen()).toBeTrue();
  });

  it('opens the panel with the error when a search to select from fails', async () => {
    store.searchAndSelectFirst('oslo');
    await settle();
    pending()[0].flush(null, { status: 500, statusText: 'Server Error' });
    await settle();

    expect(store.status()).toBe('error');
    expect(store.panelOpen()).toBeTrue();
  });

  it('does not select a result for the user once they type a new query', async () => {
    store.searchAndSelectFirst('oslo');
    await settle();

    store.search('bergen');
    await settle();
    pending()
      .find((request) => request.request.params.get('q') === 'bergen')
      ?.flush([nominatimPlaceDto()]);
    await settle();

    expect(store.selectedPlace()).toBeUndefined();
    expect(store.status()).toBe('resolved');
    expect(store.panelOpen()).toBeTrue();
  });

  it('puts a short query into the search box without searching', async () => {
    store.searchAndSelectFirst('os');
    await settle();

    expect(store.query()).toBe('os');
    expect(store.status()).toBe('idle');
    expect(pending().length).toBe(0);
  });
});
