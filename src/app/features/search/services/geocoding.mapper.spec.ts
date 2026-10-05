import { TestBed } from '@angular/core/testing';
import { geocodedPlace, nominatimPlaceDto } from '@features/search/testing/search.fixtures';
import { GeocodingMapper } from './geocoding.mapper';

describe('GeocodingMapper', () => {
  let mapper: GeocodingMapper;

  beforeEach(() => {
    mapper = TestBed.inject(GeocodingMapper);
  });

  it('renames the fields and converts the coordinates to numbers', () => {
    expect(mapper.placesDtoToUi([nominatimPlaceDto()])).toEqual([geocodedPlace()]);
  });

  it('maps every place of a response', () => {
    const places = mapper.placesDtoToUi([
      nominatimPlaceDto({ place_id: 1 }),
      nominatimPlaceDto({ place_id: 2 }),
    ]);

    expect(places.map(({ placeId }) => placeId)).toEqual([1, 2]);
  });
});
