import { inject, Service } from '@angular/core';
import type { GeoJSONSource, MapLibreMap } from 'maplibre-gl';
import { Station } from '@core/models/ui/station/station.ui';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { StationFeatureMapper } from '@features/map/services/station-feature.mapper';
import { StationSourceDiff } from '@features/map/types/station-map-feature.type';

@Service({ autoProvided: false })
export class StationSourceService {
  private readonly featureMapper = inject(StationFeatureMapper);
  private sourceStations: readonly Station[] = [];

  // A diff instead of setData, so MapLibre serializes only the added stations for its worker.
  update(map: MapLibreMap, stations: readonly Station[]): void {
    const source = map.getSource<GeoJSONSource>(STATION_MAP_CONFIG.stationsSourceId);
    if (!source) {
      return;
    }
    const diff = this.diff(this.sourceStations, stations);
    this.sourceStations = stations;
    if (diff.remove.length > 0 || diff.add.length > 0) {
      void source.updateData(diff);
    }
  }

  // Compares object references: a station whose object changed is removed and added again.
  private diff(previous: readonly Station[], next: readonly Station[]): StationSourceDiff {
    const previousStations = new Set(previous);
    const nextStations = new Set(next);
    return {
      remove: previous
        .filter((station) => !nextStations.has(station))
        .map((station) => station.chargingStationId),
      add: next
        .filter((station) => !previousStations.has(station))
        .map((station) => this.featureMapper.stationUiToFeature(station)),
    };
  }
}
