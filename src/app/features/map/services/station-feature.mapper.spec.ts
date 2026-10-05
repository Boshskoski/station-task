import { TestBed } from '@angular/core/testing';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { mapPlace } from '@features/map/testing/map.fixtures';
import { StationFeatureMapper } from './station-feature.mapper';

describe('StationFeatureMapper', () => {
  let mapper: StationFeatureMapper;
  let station: Station;

  beforeEach(() => {
    mapper = TestBed.inject(StationFeatureMapper);
    station = TestBed.inject(StationMapper).stationDtoToUi(stationDto());
  });

  it('maps a station to a GeoJSON point with only the properties the map draws', () => {
    expect(mapper.stationUiToFeature(station)).toEqual({
      type: 'Feature',
      id: 34684,
      geometry: { type: 'Point', coordinates: [10.657575, 59.933706] },
      properties: { chargingStationId: 34684, availableBoxes: 29, isOpen: true },
    });
  });

  it('maps a searched place to one GeoJSON point, or to nothing', () => {
    expect(mapper.placeUiToFeatureCollection(mapPlace()).features).toEqual([
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10.7522, 59.9139] },
        properties: {},
      },
    ]);
    expect(mapper.placeUiToFeatureCollection(undefined).features).toEqual([]);
  });

  it('maps the user position to one GeoJSON point with its accuracy in pixels at zoom 22', () => {
    const [feature] = mapper.positionUiToFeatureCollection({
      latitude: 0,
      longitude: 10,
      accuracy: 100,
    }).features;

    expect(feature.geometry).toEqual({ type: 'Point', coordinates: [10, 0] });
    expect(feature.properties.accuracyPixelsAtReferenceZoom).toBeCloseTo(
      (100 * 2 ** 22) / 78271.517,
      3,
    );
  });

  it('shrinks the metres per pixel towards the poles so the same accuracy draws a larger ring', () => {
    const at = (latitude: number): number =>
      mapper.positionUiToFeatureCollection({ latitude, longitude: 0, accuracy: 50 }).features[0]
        .properties.accuracyPixelsAtReferenceZoom;

    expect(at(60)).toBeCloseTo(at(0) * 2, 3);
  });

  it('maps a missing user position to an empty collection', () => {
    expect(mapper.positionUiToFeatureCollection(undefined).features).toEqual([]);
  });

  it('turns the bounding box of a place into map bounds', () => {
    expect(mapper.placeUiToBounds(mapPlace()).toArray()).toEqual([
      [10.74, 59.91],
      [10.76, 59.915],
    ]);
  });

  it('returns the west, south, east and north edges around all stations', () => {
    const north = { ...station, latitude: 60.1, longitude: 10.9 };
    const south = { ...station, latitude: 59.8, longitude: 10.5 };

    expect(mapper.stationsUiToBounds([station, north, south]).toArray()).toEqual([
      [10.5, 59.8],
      [10.9, 60.1],
    ]);
  });
});
