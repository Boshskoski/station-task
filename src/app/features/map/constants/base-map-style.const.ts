import type { StyleSpecification } from 'maplibre-gl';
import { environment } from '@env/environment';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';

export const BASE_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    [STATION_MAP_CONFIG.tilesSourceId]: {
      type: 'raster',
      tiles: [environment.tileUrl],
      tileSize: STATION_MAP_CONFIG.tileSize,
      maxzoom: STATION_MAP_CONFIG.sourceMaxZoom,
      attribution: environment.tileAttribution,
    },
  },
  layers: [],
};
