export interface NominatimPlaceDto {
  readonly place_id: number;
  readonly lat: string;
  readonly lon: string;
  readonly name: string;
  readonly display_name: string;
  readonly boundingbox: readonly [string, string, string, string];
}
