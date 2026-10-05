import { TestBed } from '@angular/core/testing';
import { LocationError } from '@features/location/errors/location.error';
import { UserPosition } from '@features/location/models/ui/user-position.ui';
import { GeolocationService } from '@features/location/services/geolocation.service';
import { userPosition } from '@features/location/testing/location.fixtures';
import { UserLocationStore } from './user-location.store';

describe('UserLocationStore', () => {
  const getCurrentPosition = jasmine.createSpy('getCurrentPosition');
  let store: UserLocationStore;

  beforeEach(() => {
    getCurrentPosition.calls.reset();
    TestBed.configureTestingModule({
      providers: [{ provide: GeolocationService, useValue: { getCurrentPosition } }],
    });
    store = TestBed.inject(UserLocationStore);
  });

  it('starts without a position, a request or an error', () => {
    expect(store.position()).toBeUndefined();
    expect(store.locating()).toBeFalse();
    expect(store.error()).toBeUndefined();
  });

  it('is locating until the position arrives, then keeps it', async () => {
    let resolve!: (position: UserPosition) => void;
    getCurrentPosition.and.returnValue(new Promise<UserPosition>((done) => (resolve = done)));

    const request = store.locate();
    expect(store.locating()).toBeTrue();

    resolve(userPosition());
    await request;

    expect(store.locating()).toBeFalse();
    expect(store.position()).toEqual(userPosition());
    expect(store.error()).toBeUndefined();
  });

  it('ignores a second request while one is running', async () => {
    getCurrentPosition.and.returnValue(new Promise(() => undefined));

    void store.locate();
    await store.locate();

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('exposes the kind of a failed request and stops locating', async () => {
    getCurrentPosition.and.rejectWith(new LocationError('denied'));

    await store.locate();

    expect(store.error()).toBe('denied');
    expect(store.locating()).toBeFalse();
    expect(store.position()).toBeUndefined();
  });

  it('treats an unexpected failure as an unavailable position', async () => {
    getCurrentPosition.and.rejectWith(new Error('boom'));

    await store.locate();

    expect(store.error()).toBe('unavailable');
  });

  it('keeps the last position when a later request fails and clears the error on retry', async () => {
    getCurrentPosition.and.resolveTo(userPosition());
    await store.locate();
    getCurrentPosition.and.rejectWith(new LocationError('timeout'));
    await store.locate();

    expect(store.position()).toEqual(userPosition());
    expect(store.error()).toBe('timeout');

    getCurrentPosition.and.resolveTo(userPosition({ accuracy: 10 }));
    await store.locate();

    expect(store.error()).toBeUndefined();
    expect(store.position()?.accuracy).toBe(10);
  });

  it('dismisses the error', async () => {
    getCurrentPosition.and.rejectWith(new LocationError('timeout'));
    await store.locate();

    store.dismissError();

    expect(store.error()).toBeUndefined();
  });
});
