import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { LOCATION_ERROR_MESSAGES } from '@features/location/constants/location-error-messages.const';
import { UserLocationStore } from '@features/location/store/user-location.store';
import { LocationErrorKind } from '@features/location/types/location-error-kind.type';
import { LocationErrorToast } from './location-error-toast';

describe('LocationErrorToast', () => {
  const error = signal<LocationErrorKind | undefined>(undefined);
  const dismissError = jasmine.createSpy('dismissError');
  let fixture: ComponentFixture<LocationErrorToast>;
  let toast: HTMLIonToastElement;

  beforeEach(async () => {
    error.set(undefined);
    dismissError.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({ animated: false }),
        { provide: UserLocationStore, useValue: { error, dismissError } },
      ],
    });
    fixture = TestBed.createComponent(LocationErrorToast);
    await fixture.whenStable();
    toast = fixture.nativeElement.querySelector('ion-toast');
  });

  afterEach(() => toast.remove());

  function present(kind: LocationErrorKind): Promise<Event> {
    const presented = new Promise<Event>((resolve) =>
      toast.addEventListener('didPresent', resolve, { once: true }),
    );
    error.set(kind);
    return presented;
  }

  it('stays closed while there is no error', () => {
    expect(toast.isOpen).toBeFalse();
  });

  it('opens with the message of the error', async () => {
    await present('denied');

    expect(toast.isOpen).toBeTrue();
    expect(toast.message).toBe(LOCATION_ERROR_MESSAGES.denied);
  });

  it('explains how to fix a blocked permission', async () => {
    await present('denied');

    expect(toast.message).toContain('browser settings');
  });

  it('clears the error once the toast is dismissed', async () => {
    await present('timeout');

    await toast.dismiss();

    expect(dismissError).toHaveBeenCalledTimes(1);
  });
});
