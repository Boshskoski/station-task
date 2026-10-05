import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { StationsApiService } from '@core/services/stations-api.service';
import { stationDto } from '@core/testing/station.fixtures';
import { StationsStore } from './stations.store';

describe('StationsStore', () => {
  let stations: readonly Station[];

  function setup(getStations: () => Observable<readonly Station[]>): StationsStore {
    TestBed.configureTestingModule({
      providers: [{ provide: StationsApiService, useValue: { getStations } }],
    });
    stations = TestBed.inject(StationMapper).stationsDtoToUi([
      stationDto({ PK_ChargingStationID: 1, availableBoxes: 4 }),
      stationDto({ PK_ChargingStationID: 2, availableBoxes: 0 }),
    ]);
    return TestBed.inject(StationsStore);
  }

  it('exposes loading, then the loaded stations', async () => {
    const response = new Subject<readonly Station[]>();
    const store = setup(() => response);
    TestBed.tick();
    expect(store.status()).toBe('loading');
    expect(store.stations()).toEqual([]);

    response.next(stations);
    response.complete();
    await settle();

    expect(store.status()).toBe('resolved');
    expect(store.stations()).toBe(stations);
  });

  it('exposes an error state and recovers on reload', async () => {
    let fail = true;
    const store = setup(() => (fail ? throwError(() => new Error('boom')) : of(stations)));
    await settle();
    expect(store.status()).toBe('error');
    expect(store.stations()).toEqual([]);

    fail = false;
    store.reload();
    await settle();
    expect(store.status()).toBe('resolved');
    expect(store.stations()).toBe(stations);
  });

  it('finds a loaded station by id', async () => {
    const store = setup(() => of(stations));
    await settle();

    expect(store.findStation(2)).toBe(stations[1]);
    expect(store.findStation(999)).toBeUndefined();
    expect(store.findStation(undefined)).toBeUndefined();
  });

  it('finds nothing while the stations are loading', () => {
    const store = setup(() => new Subject<readonly Station[]>());
    TestBed.tick();

    expect(store.findStation(1)).toBeUndefined();
  });
});

async function settle(): Promise<void> {
  await TestBed.inject(ApplicationRef).whenStable();
}
