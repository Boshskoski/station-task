import { TestBed } from '@angular/core/testing';
import { LngLat, Point } from 'maplibre-gl';
import { StationFeature } from '@features/map/types/station-map-feature.type';
import { SpiderfyLayoutService } from './spiderfy-layout.service';

describe('SpiderfyLayoutService', () => {
  let layout: SpiderfyLayoutService;

  beforeEach(() => {
    layout = TestBed.inject(SpiderfyLayoutService);
  });

  function leaf(chargingStationId: number): StationFeature {
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [10, 60] },
      properties: { chargingStationId, availableBoxes: 1, isOpen: true },
    };
  }

  it('draws a leg and a station for every leaf around the cluster', () => {
    const map = {
      project: () => new Point(10, 20),
      unproject: ([x, y]: [number, number]) => new LngLat(x, y),
    };

    const spider = layout.createSpider(map, { lng: 10, lat: 60 }, [leaf(1), leaf(2)]);

    expect(spider.features).toEqual([
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [10, 60],
            [-38, 20],
          ],
        },
        properties: leaf(1).properties,
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-38, 20] },
        properties: leaf(1).properties,
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [10, 60],
            [58, 20],
          ],
        },
        properties: leaf(2).properties,
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [58, 20] },
        properties: leaf(2).properties,
      },
    ]);
  });

  function radii(count: number): readonly number[] {
    return layout.legOffsets(count).map(([x, y]) => Math.round(Math.hypot(x, y)));
  }

  it('returns one offset per station', () => {
    expect(layout.legOffsets(0)).toEqual([]);
    expect(layout.legOffsets(5).length).toBe(5);
  });

  it('spreads two stations to opposite sides of the cluster', () => {
    const [[leftX, leftY], [rightX, rightY]] = layout.legOffsets(2);

    expect([leftX, rightX]).toEqual([-48, 48]);
    expect(Math.abs(leftY) + Math.abs(rightY)).toBe(0);
  });

  it('places every station on the same circle without overlaps', () => {
    const offsets = layout.legOffsets(6);

    expect(new Set(radii(6))).toEqual(new Set([48]));
    expect(new Set(offsets.map(([x, y]) => `${x},${y}`)).size).toBe(6);
  });

  it('grows the circle so many stations keep their spacing', () => {
    const [first, second] = layout.legOffsets(30);

    expect(radii(30)[0]).toBeGreaterThan(48);
    expect(Math.hypot(first[0] - second[0], first[1] - second[1])).toBeGreaterThanOrEqual(43);
  });
});
