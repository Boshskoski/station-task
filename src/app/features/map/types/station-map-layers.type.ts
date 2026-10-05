import type {
  CircleLayerSpecification,
  FilterSpecification,
  LineLayerSpecification,
  RasterLayerSpecification,
  SymbolLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec';

interface StationMapLayerBase {
  readonly id: string;
  readonly source: string;
  readonly filter?: FilterSpecification;
  readonly layout?: SymbolLayerSpecification['layout'];
}

export type StationMapLayer = StationMapLayerBase &
  (
    | { readonly type: 'raster'; readonly paint: RasterLayerSpecification['paint'] }
    | { readonly type: 'circle'; readonly paint: CircleLayerSpecification['paint'] }
    | { readonly type: 'symbol'; readonly paint: SymbolLayerSpecification['paint'] }
    | { readonly type: 'line'; readonly paint: LineLayerSpecification['paint'] }
  );
