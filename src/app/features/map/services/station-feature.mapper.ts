import { Service } from '@angular/core';
import { LngLatBounds } from 'maplibre-gl';
import { Station } from '@core/models/ui/station/station.ui';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { MapPlace } from '@features/map/models/ui/map-place.ui';
import { MapPosition } from '@features/map/models/ui/map-position.ui';
import {
  SearchFeatureCollection,
  StationFeature,
  UserLocationFeatureCollection,
} from '@features/map/types/station-map-feature.type';

@Service()
export class StationFeatureMapper {
  private static readonly METERS_PER_PIXEL_AT_ZOOM_0 = 78271.517;

  stationUiToFeature({ chargingStationId, availableBoxes, isOpen, longitude, latitude }: Station): StationFeature {
    return {
      type: 'Feature',
      id: chargingStationId,
      geometry: { type: 'Point', coordinates: [longitude, latitude] },
      properties: { chargingStationId, availableBoxes, isOpen },
    };
  }

  placeUiToFeatureCollection(place: MapPlace | undefined): SearchFeatureCollection {
    return {
      type: 'FeatureCollection',
      features: place
        ? [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [place.longitude, place.latitude] },
              properties: {},
            },
          ]
        : [],
    };
  }

  positionUiToFeatureCollection(position: MapPosition | undefined): UserLocationFeatureCollection {
    return {
      type: 'FeatureCollection',
      features: position
        ? [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [position.longitude, position.latitude] },
              properties: { accuracyPixelsAtReferenceZoom: this.accuracyUiToPixels(position) },
            },
          ]
        : [],
    };
  }

  placeUiToBounds(place: MapPlace): LngLatBounds {
    const [south, north, west, east] = place.boundingBox;
    return new LngLatBounds([west, south], [east, north]);
  }

  stationsUiToBounds(stations: readonly Station[]): LngLatBounds {
    return stations.reduce(
      (bounds, { longitude, latitude }) => bounds.extend([longitude, latitude]),
      new LngLatBounds(),
    );
  }

  private accuracyUiToPixels({ latitude, accuracy }: MapPosition): number {
    const metersPerPixel =
      (StationFeatureMapper.METERS_PER_PIXEL_AT_ZOOM_0 * Math.cos((latitude * Math.PI) / 180)) /
      2 ** STATION_MAP_CONFIG.accuracyReferenceZoom;
    return accuracy / metersPerPixel;
  }
}
