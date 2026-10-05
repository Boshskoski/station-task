import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ADDRESS_SEARCH_CONFIG } from '@features/search/constants/address-search-config.const';
import { GeocodedPlace } from '@features/search/models/ui/geocoded-place.ui';
import { geocodedPlace, nominatimPlaceDto } from '@features/search/testing/search.fixtures';
import { GeocodingApiService } from './geocoding-api.service';

describe('GeocodingApiService', () => {
  let service: GeocodingApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GeocodingApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends the query to the geocoder and maps the places', () => {
    let places: readonly GeocodedPlace[] = [];
    service.search('karl johans').subscribe((result) => (places = result));

    const request = http.expectOne(
      (req) =>
        req.url === 'https://nominatim.openstreetmap.org/search' &&
        req.params.get('q') === 'karl johans',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('format')).toBe('jsonv2');
    expect(request.request.params.get('limit')).toBe(String(ADDRESS_SEARCH_CONFIG.maxResults));
    request.flush([nominatimPlaceDto()]);

    expect(places).toEqual([geocodedPlace()]);
  });

  it('returns an empty list when nothing matches', () => {
    let places: readonly GeocodedPlace[] | undefined;
    service.search('zzzzzz').subscribe((result) => (places = result));

    http.expectOne((req) => req.url === GeocodingApiService.URL).flush([]);

    expect(places).toEqual([]);
  });

  it('surfaces a failed request as an error', () => {
    let failed = false;
    service.search('oslo').subscribe({ error: () => (failed = true) });

    http
      .expectOne((req) => req.url === GeocodingApiService.URL)
      .flush(null, { status: 429, statusText: 'Too Many Requests' });

    expect(failed).toBeTrue();
  });
});
