import { inject, Service } from '@angular/core';
import type { MapGeoJSONFeature, MapLibreMap, MapMouseEvent } from 'maplibre-gl';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { MapFocus } from '@features/map/models/ui/map-focus.ui';
import { MapPlace } from '@features/map/models/ui/map-place.ui';
import { MapPosition } from '@features/map/models/ui/map-position.ui';
import { StationFeatureMapper } from '@features/map/services/station-feature.mapper';
import { OverlayInsets } from '@shared/models/ui/overlay-insets.ui';

@Service()
export class StationMapCameraService {
  private readonly featureMapper = inject(StationFeatureMapper);

  fitPlace(map: MapLibreMap, place: MapPlace): void {
    map.fitBounds(this.featureMapper.placeUiToBounds(place), {
      padding: STATION_MAP_CONFIG.fitPadding,
      maxZoom: STATION_MAP_CONFIG.searchMaxZoom,
    });
  }

  centerOn(map: MapLibreMap, { latitude, longitude }: MapPosition): void {
    map.easeTo({
      center: { lng: longitude, lat: latitude },
      zoom: Math.max(map.getZoom(), STATION_MAP_CONFIG.locateZoom),
    });
  }

  focus(map: MapLibreMap, { latitude, longitude }: MapFocus, insets: OverlayInsets): void {
    map.easeTo({
      center: { lng: longitude, lat: latitude },
      zoom: Math.max(map.getZoom(), STATION_MAP_CONFIG.focusZoom),
      offset: this.centerOffset(insets),
    });
  }

  reveal(map: MapLibreMap, station: MapGeoJSONFeature, point: MapMouseEvent['point'], insets: OverlayInsets): void {
    if (
      station.geometry.type !== 'Point' ||
      !this.isCovered(point, map.getContainer().clientHeight, insets)
    ) {
      return;
    }
    const [lng, lat] = station.geometry.coordinates;
    map.easeTo({ center: { lng, lat }, offset: this.centerOffset(insets) });
  }

  // Raster tiles are only sharp at whole zoom levels, and MapLibre does not snap pinch zooms.
  snapZoom(map: MapLibreMap): void {
    const zoom = map.getZoom();
    if (!Number.isInteger(zoom)) {
      map.easeTo({ zoom: Math.round(zoom) });
    }
  }

  private centerOffset({ left, bottom }: OverlayInsets): [number, number] {
    return [left / 2, -bottom / 2];
  }

  private isCovered(point: MapMouseEvent['point'], mapHeight: number, { left, bottom }: OverlayInsets): boolean {
    const margin = STATION_MAP_CONFIG.revealMargin;
    return (
      (left > 0 && point.x < left + margin) || (bottom > 0 && point.y > mapHeight - bottom - margin)
    );
  }
}
