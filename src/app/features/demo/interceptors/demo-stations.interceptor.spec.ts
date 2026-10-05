import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiEnvelope } from '@core/models/dto/api-envelope.dto';
import { StationDto } from '@core/models/dto/station/station.dto';
import { StationsApiService } from '@core/services/stations-api.service';
import { stationDto } from '@core/testing/station.fixtures';
import { DemoModeService } from '@features/demo/services/demo-mode.service';
import { demoStationsInterceptor } from './demo-stations.interceptor';

describe('demoStationsInterceptor', () => {
  const body: ApiEnvelope<readonly StationDto[]> = { Result: [stationDto()] };
  const otherUrl = `${StationsApiService.URL}/other`;
  let http: HttpClient;
  let controller: HttpTestingController;

  function setUp(stationCount: number | undefined): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([demoStationsInterceptor])),
        provideHttpClientTesting(),
        { provide: DemoModeService, useValue: { stationCount } },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  }

  afterEach(() => controller.verify());

  it('fills the stations response up to the demo count', () => {
    setUp(25);
    let count = 0;
    http
      .get<ApiEnvelope<readonly StationDto[]>>(StationsApiService.URL)
      .subscribe((response) => (count = response.Result.length));

    controller.expectOne(StationsApiService.URL).flush(body);

    expect(count).toBe(25);
  });

  it('leaves the stations response alone outside demo mode', () => {
    setUp(undefined);
    let response: unknown;
    http.get(StationsApiService.URL).subscribe((result) => (response = result));

    controller.expectOne(StationsApiService.URL).flush(body);

    expect(response).toEqual(body);
  });

  it('leaves other requests alone in demo mode', () => {
    setUp(25);
    let response: unknown;
    http.get(otherUrl).subscribe((result) => (response = result));

    controller.expectOne(otherUrl).flush(body);

    expect(response).toEqual(body);
  });
});
