import { TestBed } from '@angular/core/testing';
import { FavoriteConnector } from '@features/favorites/models/ui/favorite-connector.ui';
import { FavoritesStore } from './favorites.store';

describe('FavoritesStore', () => {
  const key = 'stations.favorites.v2';
  const connector: FavoriteConnector = { id: 5, name: 'Aura 1' };

  afterEach(() => localStorage.removeItem(key));

  function stored(): unknown {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  }

  it('starts empty', () => {
    const store = TestBed.inject(FavoritesStore);

    expect(store.favorites()).toEqual({ stations: [] });
    expect(store.chargePoints()).toEqual([]);
    expect(store.count()).toBe(0);
  });

  it('adds and removes a favorite station and saves each change', () => {
    const store = TestBed.inject(FavoritesStore);

    store.toggleStation(7);
    store.toggleStation(9);

    expect(store.stationIds()).toEqual([7, 9]);
    expect(store.stationIdSet().has(7)).toBeTrue();
    expect(stored()).toEqual({
      stations: [
        { stationId: 7, connectors: [] },
        { stationId: 9, connectors: [] },
      ],
    });

    store.toggleStation(7);

    expect(store.stationIds()).toEqual([9]);
    expect(stored()).toEqual({ stations: [{ stationId: 9, connectors: [] }] });
  });

  it('adds the station of a favorite connector and keeps it when the connector is removed', () => {
    const store = TestBed.inject(FavoritesStore);

    store.toggleConnector(1, connector);

    expect(stored()).toEqual({ stations: [{ stationId: 1, connectors: [connector] }] });
    expect(store.isStationFavorite(1)).toBeTrue();

    store.toggleConnector(1, { ...connector, name: 'Renamed' });

    expect(stored()).toEqual({ stations: [{ stationId: 1, connectors: [] }] });
  });

  it('adds a connector to a station that is already a favorite', () => {
    const store = TestBed.inject(FavoritesStore);
    store.toggleStation(1);
    store.toggleStation(2);

    store.toggleConnector(1, connector);

    expect(store.favorites()).toEqual({
      stations: [
        { stationId: 1, connectors: [connector] },
        { stationId: 2, connectors: [] },
      ],
    });
  });

  it('removes the connectors of a station together with the station', () => {
    const store = TestBed.inject(FavoritesStore);
    store.toggleConnector(1, connector);

    store.toggleStation(1);

    expect(store.favorites()).toEqual({ stations: [] });
  });

  it('tells connectors with the same id apart by station', () => {
    const store = TestBed.inject(FavoritesStore);

    store.toggleConnector(1, connector);
    store.toggleConnector(2, connector);

    expect(store.isConnectorFavorite(1, 5)).toBeTrue();
    expect(store.isConnectorFavorite(2, 5)).toBeTrue();
    expect(store.isConnectorFavorite(3, 5)).toBeFalse();
    expect(store.isConnectorFavorite(1, 6)).toBeFalse();
  });

  it('lists the favorite connectors as charge points of their station', () => {
    const store = TestBed.inject(FavoritesStore);

    store.toggleConnector(1, connector);

    expect(store.chargePoints()).toEqual([
      { chargingStationId: 1, chargePointId: 5, name: 'Aura 1' },
    ]);
  });

  it('counts stations and connectors together', () => {
    const store = TestBed.inject(FavoritesStore);

    store.toggleStation(2);
    store.toggleConnector(1, connector);

    expect(store.count()).toBe(3);
  });

  it('tells whether a list of favorites is the saved one', () => {
    const store = TestBed.inject(FavoritesStore);
    store.toggleConnector(1, connector);

    expect(
      store.matchesSaved({ stations: [{ stationId: 1, connectors: [connector] }] }),
    ).toBeTrue();
    expect(store.matchesSaved({ stations: [{ stationId: 1, connectors: [] }] })).toBeFalse();
    expect(store.matchesSaved({ stations: [] })).toBeFalse();
  });

  it('shows favorites from a link without saving or changing its own', () => {
    const store = TestBed.inject(FavoritesStore);
    store.toggleStation(1);
    const shared = { stations: [{ stationId: 8, connectors: [connector] }] };

    store.showShared(shared);

    expect(store.shared()).toBe(shared);
    expect(store.favorites()).toEqual({ stations: [{ stationId: 1, connectors: [] }] });
    expect(stored()).toEqual({ stations: [{ stationId: 1, connectors: [] }] });
  });

  it('shows and counts the favorites from a link, not the saved ones', () => {
    const store = TestBed.inject(FavoritesStore);
    store.toggleStation(1);
    store.toggleStation(2);
    store.toggleConnector(2, connector);
    expect(store.shown()).toBe(store.favorites());
    expect(store.count()).toBe(3);

    const shared = { stations: [{ stationId: 8, connectors: [] }] };
    store.showShared(shared);

    expect(store.shown()).toBe(shared);
    expect(store.count()).toBe(1);
  });

  it('starts with the favorites saved in an earlier session', () => {
    localStorage.setItem(
      key,
      JSON.stringify({ stations: [{ stationId: 4, connectors: [connector] }, { stationId: 'x' }] }),
    );

    const store = TestBed.inject(FavoritesStore);

    expect(store.favorites()).toEqual({ stations: [{ stationId: 4, connectors: [connector] }] });
  });
});
