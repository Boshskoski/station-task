import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import type { GeoJSONSourceDiff } from 'maplibre-gl';
import { Station } from '@core/models/ui/station/station.ui';
import { UserLocationFeatureProperties } from '@features/map/models/ui/user-location-feature-properties.ui';

export type StationFeatureProperties = Pick<
  Station,
  'chargingStationId' | 'availableBoxes' | 'isOpen'
>;

export type StationFeature = Feature<Point, StationFeatureProperties>;

export type StationFeatureCollection = FeatureCollection<Point, StationFeatureProperties>;

export type StationSourceDiff = Required<Pick<GeoJSONSourceDiff, 'remove' | 'add'>>;

export type SearchFeatureCollection = FeatureCollection<Point>;

export type UserLocationFeatureCollection = FeatureCollection<Point, UserLocationFeatureProperties>;

export type SpiderFeatureCollection = FeatureCollection<
  Point | LineString,
  StationFeatureProperties
>;
