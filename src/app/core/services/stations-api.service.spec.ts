import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { stationDto } from '@core/testing/station.fixtures';
import { StationsApiService } from './stations-api.service';

describe('StationsApiService', () => {
  let service: StationsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StationsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches the stations and maps the response', () => {
    let ids: readonly number[] = [];
    service
      .getStations()
      .subscribe((stations) => (ids = stations.map((station) => station.chargingStationId)));

    const request = http.expectOne('https://dummyjson.com/c/a8f2-a16e-4e37-a9d6');
    expect(request.request.method).toBe('GET');
    request.flush({ Result: [stationDto({ PK_ChargingStationID: 7 })] });

    expect(ids).toEqual([7]);
  });

  it('surfaces a failed request as an error', () => {
    let failed = false;
    service.getStations().subscribe({ error: () => (failed = true) });

    http.expectOne(StationsApiService.URL).flush(null, { status: 500, statusText: 'Server Error' });

    expect(failed).toBeTrue();
  });
});
