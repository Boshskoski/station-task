export interface MapPlace {
  readonly latitude: number;
  readonly longitude: number;
  readonly boundingBox: readonly [south: number, north: number, west: number, east: number];
}
