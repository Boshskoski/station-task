import { inject, Service } from '@angular/core';
import type { MapLibreMap } from 'maplibre-gl';
import type { AllPaintProperties } from '@maplibre/maplibre-gl-style-spec';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { MapPalette } from '@features/map/models/ui/map-palette.ui';
import { StationMapIcon } from '@features/map/models/ui/station-map-icon.ui';
import { StationIconService } from '@features/map/services/station-icon.service';
import { StationMapStyleService } from '@features/map/services/station-map-style.service';
import { StationMapLayer } from '@features/map/types/station-map-layers.type';

@Service()
export class StationMapLayersService {
  private readonly mapStyleService = inject(StationMapStyleService);
  private readonly stationIcon = inject(StationIconService);

  show(map: MapLibreMap, palette: MapPalette): void {
    this.showIcons(map, this.mapStyleService.icons(palette));
    this.showLayers(map, this.mapStyleService.create(palette));
  }

  private showIcons(map: MapLibreMap, icons: readonly StationMapIcon[]): void {
    for (const { id, color } of icons) {
      const image = this.stationIcon.create(color);
      if (map.hasImage(id)) {
        map.updateImage(id, image);
      } else {
        map.addImage(id, image, { pixelRatio: STATION_MAP_CONFIG.iconPixelRatio });
      }
    }
  }

  // <mgl-layer> adds 13 hit-tested mouse listeners per layer, so layers are added directly.
  private showLayers(map: MapLibreMap, layers: readonly StationMapLayer[]): void {
    for (const layer of layers) {
      if (!map.getLayer(layer.id)) {
        map.addLayer(layer);
        continue;
      }
      const paint = Object.entries(layer.paint ?? {}) as [
        keyof AllPaintProperties,
        AllPaintProperties[keyof AllPaintProperties],
      ][];
      for (const [name, value] of paint) {
        map.setPaintProperty(layer.id, name, value);
      }
    }
  }
}
