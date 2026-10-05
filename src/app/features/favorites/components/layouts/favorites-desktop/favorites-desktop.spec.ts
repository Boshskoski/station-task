import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { of } from 'rxjs';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { StationsApiService } from '@core/services/stations-api.service';
import { stationDto } from '@core/testing/station.fixtures';
import { FAVORITES_TRIGGER_ID } from '@features/favorites/constants/favorites-trigger-id.const';
import { FavoritesStore } from '@features/favorites/store/favorites.store';
import { FavoritesDesktop } from './favorites-desktop';

describe('FavoritesDesktop', () => {
  let fixture: ComponentFixture<FavoritesDesktop>;
  let popover: HTMLIonPopoverElement;
  let trigger: HTMLButtonElement;
  let stations: readonly Station[];

  beforeEach(async () => {
    trigger = document.createElement('button');
    trigger.id = FAVORITES_TRIGGER_ID;
    document.body.appendChild(trigger);
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({ animated: false }),
        { provide: StationsApiService, useValue: { getStations: () => of(stations) } },
      ],
    });
    stations = TestBed.inject(StationMapper).stationsDtoToUi([
      stationDto({ PK_ChargingStationID: 1, Name: 'First' }),
    ]);
    TestBed.inject(FavoritesStore).toggleStation(1);
    fixture = TestBed.createComponent(FavoritesDesktop);
    await fixture.whenStable();
    popover = fixture.nativeElement.querySelector('ion-popover');
    const presented = new Promise((resolve) =>
      popover.addEventListener('didPresent', resolve, { once: true }),
    );
    fixture.componentRef.setInput('open', true);
    await presented;
    await fixture.whenStable();
  });

  afterEach(() => {
    popover.remove();
    trigger.remove();
    localStorage.removeItem('stations.favorites.v2');
  });

  it('opens under the favorites button without dimming the map', () => {
    expect(popover.trigger).toBe(FAVORITES_TRIGGER_ID);
    expect(popover.side).toBe('bottom');
    expect(popover.alignment).toBe('end');
    expect(popover.showBackdrop).toBeFalse();
    expect(popover.focusTrap).toBeFalse();
    expect(popover.querySelector('app-favorites-content')?.textContent).toContain('First');
  });

  it('passes on the station that is picked', () => {
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.stationSelected.subscribe(selected);

    popover.querySelector<HTMLElement>('ion-item:not(.favorite-row--connector)')?.click();

    expect(selected).toHaveBeenCalledOnceWith(stations[0]);
  });

  it('closes with its close button', async () => {
    const dismissed = new Promise((resolve) =>
      popover.addEventListener('didDismiss', resolve, { once: true }),
    );

    popover.querySelector<HTMLElement>('.favorites-close')?.click();
    await dismissed;
    await fixture.whenStable();

    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('closes when the window is resized', async () => {
    const dismissed = new Promise((resolve) =>
      popover.addEventListener('didDismiss', resolve, { once: true }),
    );

    window.dispatchEvent(new Event('resize'));
    await dismissed;
    await fixture.whenStable();

    expect(fixture.componentInstance.open()).toBeFalse();
  });
});
