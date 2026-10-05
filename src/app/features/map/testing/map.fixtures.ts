import { MapPlace } from '@features/map/models/ui/map-place.ui';
import { MapPosition } from '@features/map/models/ui/map-position.ui';

export function mapPlace(overrides: Partial<MapPlace> = {}): MapPlace {
  return {
    latitude: 59.9139,
    longitude: 10.7522,
    boundingBox: [59.91, 59.915, 10.74, 10.76],
    ...overrides,
  };
}

export function mapPosition(overrides: Partial<MapPosition> = {}): MapPosition {
  return { latitude: 59.9139, longitude: 10.7522, accuracy: 35, ...overrides };
}
