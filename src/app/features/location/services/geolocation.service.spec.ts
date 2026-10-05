import { TestBed } from '@angular/core/testing';
import { LOCATION_CONFIG } from '@features/location/constants/location-config.const';
import { LocationError } from '@features/location/errors/location.error';
import { geolocationError, geolocationPosition, userPosition } from '@features/location/testing/location.fixtures';
import { GEOLOCATION } from '@features/location/tokens/geolocation.token';
import { GeolocationService } from './geolocation.service';

describe('GeolocationService', () => {
  const geolocation = jasmine.createSpyObj<Geolocation>('Geolocation', [
    'getCurrentPosition',
    'watchPosition',
    'clearWatch',
  ]);
  const getCurrentPosition = geolocation.getCurrentPosition;

  function create(provided: Geolocation | undefined) {
    TestBed.configureTestingModule({ providers: [{ provide: GEOLOCATION, useValue: provided }] });
    return TestBed.inject(GeolocationService);
  }

  async function failureOf(promise: Promise<unknown>): Promise<LocationError> {
    try {
      await promise;
    } catch (error) {
      return error as LocationError;
    }
    throw new Error('Expected the request to fail');
  }

  beforeEach(() => getCurrentPosition.calls.reset());

  it('resolves the position of the device', async () => {
    getCurrentPosition.and.callFake((success: PositionCallback) => success(geolocationPosition()));

    expect(await create(geolocation).getCurrentPosition()).toEqual(userPosition());
    expect(getCurrentPosition.calls.mostRecent().args[2]).toBe(LOCATION_CONFIG.positionOptions);
  });

  it('rejects with unsupported when the browser has no geolocation', async () => {
    const error = await failureOf(create(undefined).getCurrentPosition());

    expect(error.kind).toBe('unsupported');
  });

  it('rejects with denied when the user refuses the permission', async () => {
    getCurrentPosition.and.callFake((_: PositionCallback, failure: PositionErrorCallback) =>
      failure(geolocationError(1)),
    );

    expect((await failureOf(create(geolocation).getCurrentPosition())).kind).toBe('denied');
  });

  it('rejects with insecure when the page is not a secure context', async () => {
    spyOnProperty(window, 'isSecureContext', 'get').and.returnValue(false);
    getCurrentPosition.and.callFake((_: PositionCallback, failure: PositionErrorCallback) =>
      failure(geolocationError(1)),
    );

    expect((await failureOf(create(geolocation).getCurrentPosition())).kind).toBe('insecure');
  });

  it('rejects with timeout when the position takes too long', async () => {
    getCurrentPosition.and.callFake((_: PositionCallback, failure: PositionErrorCallback) =>
      failure(geolocationError(3)),
    );

    expect((await failureOf(create(geolocation).getCurrentPosition())).kind).toBe('timeout');
  });
});
