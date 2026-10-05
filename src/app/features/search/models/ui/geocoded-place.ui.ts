export interface GeocodedPlace {
  readonly placeId: number;
  readonly latitude: number;
  readonly longitude: number;
  readonly name: string;
  readonly displayName: string;
  readonly boundingBox: readonly [south: number, north: number, west: number, east: number];
}
