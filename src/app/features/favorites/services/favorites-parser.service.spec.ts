import { TestBed } from '@angular/core/testing';
import { Favorites } from '@features/favorites/models/ui/favorites.ui';
import { FavoritesParserService } from './favorites-parser.service';

describe('FavoritesParserService', () => {
  const empty: Favorites = { stations: [] };
  let parser: FavoritesParserService;

  beforeEach(() => {
    parser = TestBed.inject(FavoritesParserService);
  });

  it('keeps valid favorites as they are', () => {
    const favorites: Favorites = {
      stations: [
        { stationId: 3, connectors: [{ id: 9, name: 'Aura 1' }] },
        { stationId: 1, connectors: [] },
      ],
    };

    expect(parser.parse(favorites)).toEqual(favorites);
  });

  it('drops invalid and duplicate stations and connectors', () => {
    expect(
      parser.parse({
        stations: [
          {
            stationId: 1,
            connectors: [
              { id: 5, name: 'A' },
              { id: 5, name: 'A again' },
              { id: 6 },
              { id: '7', name: 'B' },
              'text',
              null,
              { id: 8, name: 'C' },
            ],
          },
          { stationId: 1, connectors: [] },
          { stationId: '2', connectors: [] },
          { stationId: 2.5 },
          null,
          { stationId: 4 },
        ],
      }),
    ).toEqual({
      stations: [
        {
          stationId: 1,
          connectors: [
            { id: 5, name: 'A' },
            { id: 8, name: 'C' },
          ],
        },
        { stationId: 4, connectors: [] },
      ],
    });
  });

  it('returns no favorites when the stations have the wrong shape', () => {
    expect(parser.parse({ stations: 'x' })).toEqual(empty);
  });

  for (const value of ['text', 42, null, undefined, {}]) {
    it(`returns no favorites for ${JSON.stringify(value)}`, () => {
      expect(parser.parse(value)).toEqual(empty);
    });
  }
});
