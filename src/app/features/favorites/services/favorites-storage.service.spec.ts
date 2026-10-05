import { TestBed } from '@angular/core/testing';
import { Favorites } from '@features/favorites/models/ui/favorites.ui';
import { FavoritesStorageService } from './favorites-storage.service';

describe('FavoritesStorageService', () => {
  const key = 'stations.favorites.v2';
  const empty: Favorites = { stations: [] };
  let service: FavoritesStorageService;

  beforeEach(() => {
    service = TestBed.inject(FavoritesStorageService);
  });

  afterEach(() => localStorage.removeItem(key));

  it('saves the favorites and loads them back', () => {
    const favorites: Favorites = {
      stations: [{ stationId: 3, connectors: [{ id: 9, name: 'Aura 1' }] }],
    };

    service.save(favorites);

    expect(JSON.parse(localStorage.getItem(key) ?? 'null')).toEqual(favorites);
    expect(service.load()).toEqual(favorites);
  });

  it('loads empty favorites when nothing is stored', () => {
    expect(service.load()).toEqual(empty);
  });

  it('validates what it loads', () => {
    localStorage.setItem(key, JSON.stringify({ stations: [{ stationId: 'x' }, { stationId: 4 }] }));

    expect(service.load()).toEqual({ stations: [{ stationId: 4, connectors: [] }] });
  });

  for (const stored of ['"text"', '42', 'null', '{broken']) {
    it(`loads empty favorites when the stored value is ${stored}`, () => {
      spyOn(console, 'error');
      localStorage.setItem(key, stored);

      expect(service.load()).toEqual(empty);
    });
  }
});
