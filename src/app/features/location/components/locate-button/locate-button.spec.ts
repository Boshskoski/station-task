import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { UserPosition } from '@features/location/models/ui/user-position.ui';
import { UserLocationStore } from '@features/location/store/user-location.store';
import { userPosition } from '@features/location/testing/location.fixtures';
import { LocateButton } from './locate-button';

describe('LocateButton', () => {
  const position = signal<UserPosition | undefined>(undefined);
  const locating = signal(false);
  const locate = jasmine.createSpy('locate');
  let fixture: ComponentFixture<LocateButton>;

  beforeEach(async () => {
    position.set(undefined);
    locating.set(false);
    locate.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({}),
        { provide: UserLocationStore, useValue: { position, locating, locate } },
      ],
    });
    fixture = TestBed.createComponent(LocateButton);
    await fixture.whenStable();
  });

  function button(): HTMLIonFabButtonElement {
    return fixture.nativeElement.querySelector('ion-fab-button');
  }

  it('is labelled for assistive technology', async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(button().shadowRoot?.querySelector('button')?.getAttribute('aria-label')).toBe(
      'Show my location',
    );
  });

  it('asks for the location when pressed', () => {
    button().click();

    expect(locate).toHaveBeenCalledTimes(1);
  });

  it('shows a spinner and is disabled while locating', async () => {
    expect(button().querySelector('ion-icon')).not.toBeNull();
    expect(button().querySelector('ion-spinner')).toBeNull();

    locating.set(true);
    await fixture.whenStable();

    expect(button().querySelector('ion-spinner')).not.toBeNull();
    expect(button().querySelector('ion-icon')).toBeNull();
    expect(button().disabled).toBeTrue();
    expect(button().getAttribute('aria-busy')).toBe('true');
  });

  it('turns primary once the location is known', async () => {
    expect(button().color).toBe('light');

    position.set(userPosition());
    await fixture.whenStable();

    expect(button().color).toBe('primary');
  });
});
