import { Service } from '@angular/core';
import type { MapGeoJSONFeature, MapLibreMap, MapMouseEvent } from 'maplibre-gl';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';

@Service()
export class MapHitTestService {
  stationAt(map: MapLibreMap, point: MapMouseEvent['point']): MapGeoJSONFeature | undefined {
    return map.queryRenderedFeatures(point, {
      layers: [STATION_MAP_CONFIG.stationLayerId, STATION_MAP_CONFIG.spiderStationLayerId],
    })[0];
  }

  clusterAt(map: MapLibreMap, point: MapMouseEvent['point']): MapGeoJSONFeature | undefined {
    return map.queryRenderedFeatures(point, { layers: [STATION_MAP_CONFIG.clusterLayerId] })[0];
  }

  updateCursor({ target: map, point }: MapMouseEvent): void {
    map.getCanvas().style.cursor =
      this.clusterAt(map, point) || this.stationAt(map, point) ? 'pointer' : '';
  }
}
