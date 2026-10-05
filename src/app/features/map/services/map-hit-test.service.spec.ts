import { TestBed } from '@angular/core/testing';
import type { MapGeoJSONFeature, MapLibreMap, MapMouseEvent } from 'maplibre-gl';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { MapHitTestService } from './map-hit-test.service';

describe('MapHitTestService', () => {
  const point = { x: 1, y: 1 } as MapMouseEvent['point'];

  let service: MapHitTestService;
  let rendered: Record<string, object>;
  let canvas: { style: { cursor: string } };
  let map: MapLibreMap;

  function move(): void {
    service.updateCursor({ target: map, point } as MapMouseEvent);
  }

  beforeEach(() => {
    rendered = {};
    canvas = { style: { cursor: '' } };
    const fake = jasmine.createSpyObj('map', ['queryRenderedFeatures', 'getCanvas']);
    fake.queryRenderedFeatures.and.callFake(
      (_point: unknown, { layers }: { layers: readonly string[] }) =>
        layers.flatMap((id) => (rendered[id] ? [rendered[id]] : [])),
    );
    fake.getCanvas.and.callFake(() => canvas);
    map = fake;
    service = TestBed.inject(MapHitTestService);
  });

  it('finds a station on the map and inside an open spider', () => {
    const spiderStation = { id: 'spider' } as unknown as MapGeoJSONFeature;
    rendered[STATION_MAP_CONFIG.spiderStationLayerId] = spiderStation;

    expect(service.stationAt(map, point)).toBe(spiderStation);
    expect(service.clusterAt(map, point)).toBeUndefined();
  });

  it('finds a cluster', () => {
    const cluster = { id: 'cluster' } as unknown as MapGeoJSONFeature;
    rendered[STATION_MAP_CONFIG.clusterLayerId] = cluster;

    expect(service.clusterAt(map, point)).toBe(cluster);
    expect(service.stationAt(map, point)).toBeUndefined();
  });

  it('shows a pointer over a station or a cluster and the default cursor elsewhere', () => {
    rendered[STATION_MAP_CONFIG.stationLayerId] = {};
    move();
    expect(canvas.style.cursor).toBe('pointer');

    rendered = { [STATION_MAP_CONFIG.clusterLayerId]: {} };
    move();
    expect(canvas.style.cursor).toBe('pointer');

    rendered = {};
    move();
    expect(canvas.style.cursor).toBe('');
  });
});
