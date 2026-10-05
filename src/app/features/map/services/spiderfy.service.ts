import { inject, Service, signal } from '@angular/core';
import type { GeoJSONSource, MapGeoJSONFeature, MapLibreMap } from 'maplibre-gl';
import { EMPTY_FEATURE_COLLECTION } from '@features/map/constants/empty-feature-collection.const';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { SpiderfyLayoutService } from '@features/map/services/spiderfy-layout.service';
import { SpiderFeatureCollection, StationFeature } from '@features/map/types/station-map-feature.type';

@Service({ autoProvided: false })
export class SpiderfyService {
  private readonly spiderfyLayout = inject(SpiderfyLayoutService);
  private readonly spider = signal<SpiderFeatureCollection>(EMPTY_FEATURE_COLLECTION);
  private clusterId: number | undefined;

  readonly features = this.spider.asReadonly();

  // Stations at the same spot never split by zooming, so beyond the max zoom they are spread out.
  async expandCluster(map: MapLibreMap, cluster: MapGeoJSONFeature): Promise<void> {
    const clusterId: number = cluster.properties['cluster_id'];
    const wasOpen = clusterId === this.clusterId;
    this.close();
    const source = map.getSource<GeoJSONSource>(STATION_MAP_CONFIG.stationsSourceId);
    if (wasOpen || !source || cluster.geometry.type !== 'Point') {
      return;
    }
    const [lng, lat] = cluster.geometry.coordinates;
    const expansionZoom = await source.getClusterExpansionZoom(clusterId);
    if (expansionZoom <= map.getMaxZoom()) {
      map.easeTo({ center: { lng, lat }, zoom: expansionZoom });
      return;
    }
    const leaves = await source.getClusterLeaves(clusterId, Infinity, 0);
    this.spider.set(
      this.spiderfyLayout.createSpider(map, { lng, lat }, leaves as StationFeature[]),
    );
    this.clusterId = clusterId;
  }

  close(): void {
    this.spider.set(EMPTY_FEATURE_COLLECTION);
    this.clusterId = undefined;
  }
}
