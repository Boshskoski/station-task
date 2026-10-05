import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { StationDetails } from '@features/details/models/ui/station-details.ui';
import { StationDetailsApiService } from '@features/details/services/station-details-api.service';
import { StationDetailsMapper } from '@features/details/services/station-details.mapper';
import { stationDetailsDto } from '@features/details/testing/station-details.fixtures';
import { StationDetailsStore } from './station-details.store';

describe('StationDetailsStore', () => {
  let details: StationDetails;
  const getStationDetails = jasmine.createSpy('getStationDetails');

  function setup(respond: (id: number) => Observable<StationDetails>): StationDetailsStore {
    getStationDetails.calls.reset();
    getStationDetails.and.callFake(respond);
    TestBed.configureTestingModule({
      providers: [{ provide: StationDetailsApiService, useValue: { getStationDetails } }],
    });
    details = TestBed.inject(StationDetailsMapper).stationDetailsDtoToUi(stationDetailsDto());
    return TestBed.inject(StationDetailsStore);
  }

  it('does not fetch while no station is selected', async () => {
    const store = setup(() => of(details));
    await settle();

    expect(getStationDetails).not.toHaveBeenCalled();
    expect(store.selectedStationId()).toBeUndefined();
    expect(store.details()).toBeUndefined();
    expect(store.status()).toBe('idle');
  });

  it('selects a station by id and clears the selection', async () => {
    const store = setup(() => of(details));
    store.selectStation(2);
    await settle();
    expect(store.selectedStationId()).toBe(2);
    expect(getStationDetails).toHaveBeenCalledOnceWith(2);

    store.clearSelection();
    await settle();
    expect(store.selectedStationId()).toBeUndefined();
    expect(store.status()).toBe('idle');
  });

  it('exposes loading, then the details of the selected station', async () => {
    const response = new Subject<StationDetails>();
    const store = setup(() => response);
    store.selectStation(31984);
    TestBed.tick();

    expect(getStationDetails).toHaveBeenCalledOnceWith(31984);
    expect(store.status()).toBe('loading');
    expect(store.details()).toBeUndefined();

    response.next(details);
    response.complete();
    await settle();

    expect(store.status()).toBe('resolved');
    expect(store.details()).toBe(details);
  });

  it('exposes an error state and recovers on reload', async () => {
    let fail = true;
    const store = setup(() => (fail ? throwError(() => new Error('boom')) : of(details)));
    store.selectStation(1);
    await settle();
    expect(store.status()).toBe('error');
    expect(store.details()).toBeUndefined();

    fail = false;
    store.reload();
    await settle();
    expect(store.status()).toBe('resolved');
    expect(store.details()).toBe(details);
  });

  it('drops the previous details when another station is selected', async () => {
    const second = new Subject<StationDetails>();
    const store = setup((id) => (id === 1 ? of(details) : second));
    store.selectStation(1);
    await settle();
    expect(store.details()).toBe(details);

    store.selectStation(2);
    TestBed.tick();
    expect(store.status()).toBe('loading');
    expect(store.details()).toBeUndefined();
  });

  it('shows cached details at once when a station is selected again and refreshes them', async () => {
    const refreshed = new Subject<StationDetails>();
    let calls = 0;
    const store = setup((id) => (id === 1 && ++calls === 2 ? refreshed : of(details)));
    store.selectStation(1);
    await settle();
    store.selectStation(2);
    await settle();

    store.selectStation(1);
    TestBed.tick();
    expect(store.status()).toBe('resolved');
    expect(store.details()).toBe(details);

    const updated = { ...details, name: 'Updated' };
    refreshed.next(updated);
    refreshed.complete();
    await settle();
    expect(store.details()).toBe(updated);
  });

  it('keeps cached details when the background refresh fails', async () => {
    let fail = false;
    const store = setup(() => (fail ? throwError(() => new Error('boom')) : of(details)));
    store.selectStation(1);
    await settle();
    store.selectStation(2);
    await settle();

    fail = true;
    store.selectStation(1);
    await settle();
    expect(store.status()).toBe('resolved');
    expect(store.details()).toBe(details);
  });

  describe('presented view', () => {
    it('is empty until the first selection has its details', async () => {
      const response = new Subject<StationDetails>();
      const store = setup(() => response);
      await settle();
      expect(store.presented()).toBeUndefined();

      store.selectStation(1);
      TestBed.tick();
      expect(store.presented()).toBeUndefined();

      response.next(details);
      response.complete();
      await settle();
      expect(store.presented()?.stationId).toBe(1);
      expect(store.presented()?.details).toBe(details);
      expect(store.presented()?.status).toBe('resolved');
    });

    it('keeps the previous station until the next one is ready', async () => {
      const second = new Subject<StationDetails>();
      const store = setup((id) => (id === 1 ? of(details) : second));
      await settle();
      store.selectStation(1);
      await settle();
      expect(store.presented()?.stationId).toBe(1);

      store.selectStation(2);
      TestBed.tick();
      expect(store.status()).toBe('loading');
      expect(store.presented()?.stationId).toBe(1);

      second.next(details);
      second.complete();
      await settle();
      expect(store.presented()?.stationId).toBe(2);
    });

    it('presents the basic station with an error status when the details fail', async () => {
      const store = setup((id) => (id === 1 ? of(details) : throwError(() => new Error('boom'))));
      await settle();
      store.selectStation(1);
      await settle();

      store.selectStation(2);
      await settle();
      expect(store.presented()?.stationId).toBe(2);
      expect(store.presented()?.details).toBeUndefined();
      expect(store.presented()?.status).toBe('error');
    });

    it('presents a cached station at once', async () => {
      const store = setup((id) => (id === 1 ? of(details) : of({ ...details, name: 'Two' })));
      await settle();
      store.selectStation(1);
      await settle();
      store.selectStation(2);
      await settle();

      store.selectStation(1);
      TestBed.tick();
      expect(store.presented()?.stationId).toBe(1);
      expect(store.presented()?.details).toBe(details);
    });

    it('is empty again when the selection is cleared', async () => {
      const store = setup(() => of(details));
      await settle();
      store.selectStation(1);
      await settle();

      store.clearSelection();
      expect(store.presented()).toBeUndefined();
    });
  });
});

async function settle(): Promise<void> {
  await TestBed.inject(ApplicationRef).whenStable();
}
