import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { stationDetailsDto } from '@features/details/testing/station-details.fixtures';
import { StationDetailsApiService } from './station-details-api.service';

describe('StationDetailsApiService', () => {
  let service: StationDetailsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StationDetailsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches the details of a station by id and maps the response', () => {
    let owner: string | undefined;
    service.getStationDetails(31984).subscribe((details) => (owner = details.ownedByCompanyName));

    const request = http.expectOne(
      (req) =>
        req.url === 'https://dummyjson.com/c/dc70-4ec5-44d3-9b41' &&
        req.params.get('id') === '31984',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ Result: stationDetailsDto() });

    expect(owner).toBe('Current Eco AS');
  });

  it('surfaces a failed details request as an error', () => {
    let failed = false;
    service.getStationDetails(1).subscribe({ error: () => (failed = true) });

    http
      .expectOne((req) => req.url === StationDetailsApiService.URL)
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(failed).toBeTrue();
  });
});
