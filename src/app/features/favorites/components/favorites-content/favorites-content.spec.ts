import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { StationsApiService } from '@core/services/stations-api.service';
import { stationDto } from '@core/testing/station.fixtures';
import { FavoritesStore } from '@features/favorites/store/favorites.store';
import { FavoritesContent } from './favorites-content';

describe('FavoritesContent', () => {
  const aura = { id: 5, name: 'Aura 1' };
  let fixture: ComponentFixture<FavoritesContent>;
  let favorites: FavoritesStore;
  let stations: readonly Station[];

  async function setup(getStations: () => Observable<readonly Station[]>, settle = true): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({}),
        { provide: StationsApiService, useValue: { getStations } },
      ],
    });
    stations = TestBed.inject(StationMapper).stationsDtoToUi([
      stationDto({ PK_ChargingStationID: 1, Name: 'First', Town: 'Oslo' }),
      stationDto({ PK_ChargingStationID: 2, Name: 'Second', Town: 'Bergen' }),
    ]);
    favorites = TestBed.inject(FavoritesStore);
    fixture = TestBed.createComponent(FavoritesContent);
    await (settle ? fixture.whenStable() : Promise.resolve());
  }

  afterEach(() => localStorage.removeItem('stations.favorites.v2'));

  function element(): HTMLElement {
    return fixture.nativeElement;
  }

  function text(): string {
    return element().textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  function rows(): HTMLElement[] {
    return Array.from(element().querySelectorAll<HTMLElement>('ion-item'));
  }

  function titles(): (string | undefined)[] {
    return rows().map((row) => row.querySelector('.favorite-row__title')?.textContent?.trim());
  }

  function heartIcons(): (string | undefined)[] {
    return rows().map(
      (row) => row.querySelector<HTMLElement & { name?: string }>('ion-button ion-icon')?.name,
    );
  }

  async function pickSpy(): Promise<jasmine.Spy> {
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.stationSelected.subscribe(selected);
    await fixture.whenStable();
    return selected;
  }

  it('explains how to add favorites when there are none', async () => {
    await setup(() => of(stations));

    expect(text()).toContain('No favorites yet.');
    expect(rows().length).toBe(0);
  });

  it('lists the favorite stations with their favorite connectors under them', async () => {
    await setup(() => of(stations));
    favorites.toggleStation(2);
    favorites.toggleConnector(1, aura);
    await fixture.whenStable();

    expect(rows().map((row) => row.classList.contains('favorite-row--connector'))).toEqual([
      false,
      false,
      true,
    ]);
    expect(rows()[0].textContent).toContain('Bergen');
    expect(titles()).toEqual(['Second', 'First', 'Aura 1']);
  });

  it('emits the station that is picked', async () => {
    await setup(() => of(stations));
    favorites.toggleStation(2);
    const selected = await pickSpy();

    rows()[0].click();

    expect(selected).toHaveBeenCalledOnceWith(stations[1]);
  });

  it('removes a favorite station and its connectors without picking it', async () => {
    await setup(() => of(stations));
    favorites.toggleConnector(1, aura);
    const selected = await pickSpy();

    rows()[0].querySelector<HTMLElement>('ion-button')?.click();
    await fixture.whenStable();

    expect(favorites.favorites()).toEqual({ stations: [] });
    expect(selected).not.toHaveBeenCalled();
    expect(text()).toContain('No favorites yet.');
  });

  it('emits the station of a favorite connector that is picked', async () => {
    await setup(() => of(stations));
    favorites.toggleConnector(1, aura);
    const selected = await pickSpy();

    rows()[1].click();

    expect(selected).toHaveBeenCalledOnceWith(stations[0]);
    expect((rows()[1] as HTMLIonItemElement).button).toBeTrue();
  });

  it('removes a favorite connector and keeps its station', async () => {
    await setup(() => of(stations));
    favorites.toggleConnector(1, aura);
    const selected = await pickSpy();

    rows()[1].querySelector<HTMLElement>('ion-button')?.click();
    await fixture.whenStable();

    expect(selected).not.toHaveBeenCalled();
    expect(favorites.favorites()).toEqual({ stations: [{ stationId: 1, connectors: [] }] });
    expect(titles()).toEqual(['First']);
  });

  it('shows a favorite whose station is gone, not clickable, and lets the user remove it', async () => {
    await setup(() => of(stations));
    favorites.toggleConnector(99, aura);
    const selected = await pickSpy();

    expect(rows()[0].textContent).toContain('No longer available');
    rows()[1].click();
    expect((rows()[1] as HTMLIonItemElement).button).toBeFalse();
    expect(selected).not.toHaveBeenCalled();

    rows()[0].querySelector<HTMLElement>('ion-button')?.click();
    await fixture.whenStable();

    expect(favorites.favorites()).toEqual({ stations: [] });
  });

  describe('with favorites from a link', () => {
    const linked = {
      stations: [
        { stationId: 2, connectors: [] },
        { stationId: 1, connectors: [aura] },
      ],
    };

    it('lists the favorites from the link, all with filled hearts', async () => {
      await setup(() => of(stations));
      favorites.toggleStation(1);
      favorites.showShared(linked);
      await fixture.whenStable();

      expect(titles()).toEqual(['Second', 'First', 'Aura 1']);
      expect(heartIcons()).toEqual(['heart', 'heart', 'heart']);
    });

    it('removes a row from the link list and saves the rest when its heart is clicked', async () => {
      await setup(() => of(stations));
      favorites.showShared(linked);
      await fixture.whenStable();

      rows()[0].querySelector<HTMLElement>('ion-button')?.click();
      await fixture.whenStable();

      expect(favorites.shared()).toBeUndefined();
      expect(favorites.favorites().stations.map((station) => station.stationId)).toEqual([1]);
      expect(titles()).toEqual(['First', 'Aura 1']);
    });
  });

  it('shows a loading note while the stations load', async () => {
    await setup(() => NEVER, false);
    favorites.toggleStation(1);
    TestBed.tick();

    expect(element().querySelector('[role="status"]')?.textContent).toContain('Loading stations');
    expect(rows().length).toBe(0);
  });

  it('shows an error with a retry when the stations fail to load', async () => {
    await setup(() => throwError(() => new Error('boom')));
    favorites.toggleStation(1);
    await fixture.whenStable();

    expect(element().querySelector('[role="alert"]')?.textContent).toContain(
      'Could not load stations.',
    );
    expect(element().querySelector('[role="alert"] ion-button')).not.toBeNull();
  });
});
