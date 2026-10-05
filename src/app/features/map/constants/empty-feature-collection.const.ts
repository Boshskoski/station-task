import type { FeatureCollection } from 'geojson';

export const EMPTY_FEATURE_COLLECTION: FeatureCollection<never, never> = {
  type: 'FeatureCollection',
  features: [],
};
