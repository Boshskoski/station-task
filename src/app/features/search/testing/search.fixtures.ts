import { NominatimPlaceDto } from '@features/search/models/dto/nominatim-place.dto';
import { GeocodedPlace } from '@features/search/models/ui/geocoded-place.ui';

export function nominatimPlaceDto(overrides: Partial<NominatimPlaceDto> = {}): NominatimPlaceDto {
  return {
    place_id: 101,
    lat: '59.9139',
    lon: '10.7522',
    name: 'Karl Johans gate',
    display_name: 'Karl Johans gate, Sentrum, Oslo, 0154, Norway',
    boundingbox: ['59.9100', '59.9150', '10.7400', '10.7600'],
    ...overrides,
  };
}

export function geocodedPlace(overrides: Partial<GeocodedPlace> = {}): GeocodedPlace {
  return {
    placeId: 101,
    latitude: 59.9139,
    longitude: 10.7522,
    name: 'Karl Johans gate',
    displayName: 'Karl Johans gate, Sentrum, Oslo, 0154, Norway',
    boundingBox: [59.91, 59.915, 10.74, 10.76],
    ...overrides,
  };
}
