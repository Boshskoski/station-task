import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { of } from 'rxjs';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { StationsApiService } from '@core/services/stations-api.service';
import { stationDto } from '@core/testing/station.fixtures';
import { FavoritesStore } from '@features/favorites/store/favorites.store';
import { FavoritesMobile } from './favorites-mobile';

describe('FavoritesMobile', () => {
  let fixture: ComponentFixture<FavoritesMobile>;
  let modal: HTMLIonModalElement;
  let stations: readonly Station[];

  beforeEach(async () => {
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
    fixture = TestBed.createComponent(FavoritesMobile);
    await fixture.whenStable();
    modal = fixture.nativeElement.querySelector('ion-modal');
    const presented = new Promise((resolve) =>
      modal.addEventListener('didPresent', resolve, { once: true }),
    );
    fixture.componentRef.setInput('open', true);
    await presented;
    await fixture.whenStable();
  });

  afterEach(() => {
    modal.remove();
    localStorage.removeItem('stations.favorites.v2');
  });

  it('opens as a sheet that fits its content and lists the favorites', () => {
    expect(modal.breakpoints).toEqual([0, 1]);
    expect(modal.initialBreakpoint).toBe(1);
    expect(
      modal.querySelector('.auto-height-sheet__body app-favorites-content')?.textContent,
    ).toContain('First');
  });

  it('passes on the station that is picked', () => {
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.stationSelected.subscribe(selected);

    modal.querySelector<HTMLElement>('ion-item:not(.favorite-row--connector)')?.click();

    expect(selected).toHaveBeenCalledOnceWith(stations[0]);
  });

  it('closes with the Done button', async () => {
    const dismissed = new Promise((resolve) =>
      modal.addEventListener('didDismiss', resolve, { once: true }),
    );

    modal.querySelector<HTMLElement>('.favorites-close')?.click();
    await dismissed;
    await fixture.whenStable();

    expect(fixture.componentInstance.open()).toBeFalse();
  });
});
