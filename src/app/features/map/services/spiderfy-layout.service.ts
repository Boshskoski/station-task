import { Service } from '@angular/core';
import type { LngLat, MapLibreMap } from 'maplibre-gl';
import { SpiderFeatureCollection, StationFeature } from '@features/map/types/station-map-feature.type';

@Service()
export class SpiderfyLayoutService {
  private static readonly MIN_RADIUS = 48;
  private static readonly LEG_SPACING = 44;

  createSpider(
    map: Pick<MapLibreMap, 'project' | 'unproject'>,
    center: Pick<LngLat, 'lng' | 'lat'>,
    leaves: readonly StationFeature[],
  ): SpiderFeatureCollection {
    const origin = map.project(center);
    const offsets = this.legOffsets(leaves.length);
    return {
      type: 'FeatureCollection',
      features: leaves.flatMap(({ properties }, index): SpiderFeatureCollection['features'] => {
        const [x, y] = offsets[index];
        const { lng, lat } = map.unproject([origin.x + x, origin.y + y]);
        const leg = [
          [center.lng, center.lat],
          [lng, lat],
        ];
        return [
          { type: 'Feature', geometry: { type: 'LineString', coordinates: leg }, properties },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties },
        ];
      }),
    };
  }

  legOffsets(count: number): readonly (readonly [x: number, y: number])[] {
    const radius = Math.max(
      SpiderfyLayoutService.MIN_RADIUS,
      (count * SpiderfyLayoutService.LEG_SPACING) / (2 * Math.PI),
    );
    return Array.from({ length: count }, (_, index) => {
      const angle = Math.PI + (2 * Math.PI * index) / count;
      return [Math.round(radius * Math.cos(angle)), Math.round(radius * Math.sin(angle))] as const;
    });
  }
}
