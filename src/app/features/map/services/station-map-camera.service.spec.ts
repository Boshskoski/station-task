import { TestBed } from '@angular/core/testing';
import type { MapGeoJSONFeature, MapLibreMap } from 'maplibre-gl';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { mapPlace, mapPosition } from '@features/map/testing/map.fixtures';
import { StationMapCameraService } from './station-map-camera.service';

describe('StationMapCameraService', () => {
  const station = {
    geometry: { type: 'Point', coordinates: [10.5, 60.2] },
  } as unknown as MapGeoJSONFeature;
  const mobile = { left: 0, bottom: 340 };
  const desktop = { left: 432, bottom: 0 };

  let service: StationMapCameraService;
  let zoom: number;
  let mapHeight: number;
  let map: Record<'easeTo' | 'fitBounds' | 'getZoom' | 'getContainer', jasmine.Spy>;

  function camera(): MapLibreMap {
    return map as unknown as MapLibreMap;
  }

  function easeToOptions(): { center?: unknown; zoom?: number; offset: [number, number] } {
    return map.easeTo.calls.mostRecent().args[0];
  }

  function expectOffset(expectedX: number, expectedY: number): void {
    const [x, y] = easeToOptions().offset;
    expect(x).toBe(expectedX);
    expect(y).toBe(expectedY);
  }

  beforeEach(() => {
    zoom = 11;
    mapHeight = 732;
    map = jasmine.createSpyObj('map', ['easeTo', 'fitBounds', 'getZoom', 'getContainer']);
    map.getZoom.and.callFake(() => zoom);
    map.getContainer.and.callFake(() => ({ clientHeight: mapHeight }));
    service = TestBed.inject(StationMapCameraService);
  });

  it('fits a searched place into view, no closer than the search zoom', () => {
    service.fitPlace(camera(), mapPlace());

    expect(map.fitBounds).toHaveBeenCalledOnceWith(jasmine.anything(), {
      padding: STATION_MAP_CONFIG.fitPadding,
      maxZoom: STATION_MAP_CONFIG.searchMaxZoom,
    });
  });

  it('centres on the user position at least at the locate zoom', () => {
    const { latitude, longitude } = mapPosition();

    service.centerOn(camera(), mapPosition());

    expect(map.easeTo).toHaveBeenCalledOnceWith({
      center: { lng: longitude, lat: latitude },
      zoom: STATION_MAP_CONFIG.locateZoom,
    });
  });

  describe('focus', () => {
    it('keeps a closer zoom when the map is already zoomed in further', () => {
      zoom = 17;

      service.focus(camera(), { latitude: 60.1, longitude: 11.2 }, STATION_MAP_CONFIG.noInsets);

      expect(easeToOptions().zoom).toBe(17);
    });

    it('does not move the center when nothing covers the map', () => {
      service.focus(camera(), { latitude: 60.1, longitude: 11.2 }, STATION_MAP_CONFIG.noInsets);

      expectOffset(0, 0);
    });

    it('moves the center up by half of what a bottom sheet covers', () => {
      service.focus(camera(), { latitude: 60.1, longitude: 11.2 }, mobile);

      expectOffset(0, -170);
    });

    it('moves the center right by half of what a side panel covers', () => {
      service.focus(camera(), { latitude: 60.1, longitude: 11.2 }, desktop);

      expectOffset(216, 0);
    });
  });

  describe('reveal', () => {
    it('never moves when nothing covers the map', () => {
      service.reveal(camera(), station, { x: 0, y: 700 } as never, STATION_MAP_CONFIG.noInsets);

      expect(map.easeTo).not.toHaveBeenCalled();
    });

    it('moves a station under the bottom sheet into the visible area', () => {
      service.reveal(camera(), station, { x: 200, y: 600 } as never, mobile);

      expect(easeToOptions().center).toEqual({ lng: 10.5, lat: 60.2 });
      expectOffset(0, -170);
    });

    it('moves a station closer to the sheet than the reveal margin', () => {
      service.reveal(camera(), station, { x: 200, y: 372 } as never, mobile);

      expect(map.easeTo).toHaveBeenCalled();
    });

    it('does not move a station clearly above the bottom sheet', () => {
      service.reveal(camera(), station, { x: 200, y: 300 } as never, mobile);

      expect(map.easeTo).not.toHaveBeenCalled();
    });

    it('moves a station under the side panel', () => {
      service.reveal(camera(), station, { x: 200, y: 300 } as never, desktop);

      expectOffset(216, 0);
    });

    it('does not move a station right of the side panel', () => {
      service.reveal(camera(), station, { x: 700, y: 300 } as never, desktop);

      expect(map.easeTo).not.toHaveBeenCalled();
    });

    it('does not count the map edge next to a side panel as covered', () => {
      mapHeight = 700;

      service.reveal(camera(), station, { x: 700, y: 690 } as never, desktop);

      expect(map.easeTo).not.toHaveBeenCalled();
    });

    it('does not count the map edge next to a bottom sheet as covered', () => {
      service.reveal(camera(), station, { x: 10, y: 100 } as never, mobile);

      expect(map.easeTo).not.toHaveBeenCalled();
    });
  });

  describe('snapZoom', () => {
    it('rounds a fractional zoom to the nearest whole level', () => {
      zoom = 10.6;

      service.snapZoom(camera());

      expect(map.easeTo).toHaveBeenCalledOnceWith({ zoom: 11 });
    });

    it('leaves a whole zoom alone', () => {
      service.snapZoom(camera());

      expect(map.easeTo).not.toHaveBeenCalled();
    });
  });
});
