import { TestBed } from '@angular/core/testing';
import type { MapGeoJSONFeature, MapLibreMap } from 'maplibre-gl';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { SpiderfyService } from './spiderfy.service';

describe('SpiderfyService', () => {
  const cluster = {
    properties: { cluster_id: 3 },
    geometry: { type: 'Point', coordinates: [10.6, 60.3] },
  } as unknown as MapGeoJSONFeature;

  let service: SpiderfyService;
  let source: Record<'getClusterExpansionZoom' | 'getClusterLeaves', jasmine.Spy>;
  let map: Record<'getSource' | 'getMaxZoom' | 'easeTo' | 'project' | 'unproject', jasmine.Spy>;

  function expand(): Promise<void> {
    return service.expandCluster(map as unknown as MapLibreMap, cluster);
  }

  beforeEach(() => {
    source = jasmine.createSpyObj('source', ['getClusterExpansionZoom', 'getClusterLeaves']);
    source.getClusterLeaves.and.resolveTo([
      { properties: { chargingStationId: 1 } },
      { properties: { chargingStationId: 2 } },
    ]);
    map = jasmine.createSpyObj('map', [
      'getSource',
      'getMaxZoom',
      'easeTo',
      'project',
      'unproject',
    ]);
    map.getSource.and.returnValue(source);
    map.getMaxZoom.and.returnValue(STATION_MAP_CONFIG.maxZoom);
    map.project.and.returnValue({ x: 0, y: 0 });
    map.unproject.and.returnValue({ lng: 10, lat: 60 });
    TestBed.configureTestingModule({ providers: [SpiderfyService] });
    service = TestBed.inject(SpiderfyService);
  });

  it('zooms into a cluster that splits within the max zoom', async () => {
    source.getClusterExpansionZoom.and.resolveTo(13);

    await expand();

    expect(map.easeTo).toHaveBeenCalledOnceWith({ center: { lng: 10.6, lat: 60.3 }, zoom: 13 });
    expect(service.features().features.length).toBe(0);
  });

  describe('a cluster that does not split by zooming', () => {
    beforeEach(() => {
      source.getClusterExpansionZoom.and.resolveTo(STATION_MAP_CONFIG.maxZoom + 1);
    });

    it('spreads its stations out with a leg and a point each', async () => {
      await expand();

      expect(map.easeTo).not.toHaveBeenCalled();
      expect(service.features().features.length).toBe(4);
    });

    it('closes on a second click on the same cluster', async () => {
      await expand();
      await expand();

      expect(service.features().features.length).toBe(0);
      expect(source.getClusterLeaves).toHaveBeenCalledTimes(1);
    });

    it('closes on request', async () => {
      await expand();

      service.close();

      expect(service.features().features.length).toBe(0);
    });
  });
});
