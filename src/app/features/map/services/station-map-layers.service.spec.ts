import { TestBed } from '@angular/core/testing';
import type { MapLibreMap } from 'maplibre-gl';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { MapPalette } from '@features/map/models/ui/map-palette.ui';
import { StationIconService } from '@features/map/services/station-icon.service';
import { StationMapStyleService } from '@features/map/services/station-map-style.service';
import { StationMapLayersService } from './station-map-layers.service';

describe('StationMapLayersService', () => {
  const palette = { success: '#2dd55b', successContrast: '#000' } as MapPalette;
  const layers = [
    { id: 'clusters', type: 'circle', source: 'stations', paint: { 'circle-color': '#00f' } },
    { id: 'labels', type: 'symbol', source: 'stations' },
  ];
  const icons = [{ id: STATION_MAP_CONFIG.availableIconId, color: '#000' }];
  const image = new ImageData(1, 1);

  let service: StationMapLayersService;
  let layerIds: Set<string>;
  let imageIds: Set<string>;
  let map: Record<
    'hasImage' | 'addImage' | 'updateImage' | 'getLayer' | 'addLayer' | 'setPaintProperty',
    jasmine.Spy
  >;

  beforeEach(() => {
    layerIds = new Set();
    imageIds = new Set();
    map = jasmine.createSpyObj('map', [
      'hasImage',
      'addImage',
      'updateImage',
      'getLayer',
      'addLayer',
      'setPaintProperty',
    ]);
    map.hasImage.and.callFake((id: string) => imageIds.has(id));
    map.addImage.and.callFake((id: string) => imageIds.add(id));
    map.getLayer.and.callFake((id: string) => layerIds.has(id));
    map.addLayer.and.callFake(({ id }: { id: string }) => layerIds.add(id));
    TestBed.configureTestingModule({
      providers: [
        { provide: StationMapStyleService, useValue: { create: () => layers, icons: () => icons } },
        { provide: StationIconService, useValue: { create: () => image } },
      ],
    });
    service = TestBed.inject(StationMapLayersService);
  });

  it('adds the icons and the layers the first time', () => {
    service.show(map as unknown as MapLibreMap, palette);

    expect(map.addImage).toHaveBeenCalledOnceWith(STATION_MAP_CONFIG.availableIconId, image, {
      pixelRatio: STATION_MAP_CONFIG.iconPixelRatio,
    });
    expect(map.addLayer).toHaveBeenCalledTimes(2);
    expect(map.setPaintProperty).not.toHaveBeenCalled();
  });

  it('redraws the icons and repaints the layers after that instead of adding them again', () => {
    service.show(map as unknown as MapLibreMap, palette);
    map.addImage.calls.reset();
    map.addLayer.calls.reset();

    service.show(map as unknown as MapLibreMap, palette);

    expect(map.addImage).not.toHaveBeenCalled();
    expect(map.updateImage).toHaveBeenCalledOnceWith(STATION_MAP_CONFIG.availableIconId, image);
    expect(map.addLayer).not.toHaveBeenCalled();
    expect(map.setPaintProperty).toHaveBeenCalledOnceWith('clusters', 'circle-color', '#00f');
  });
});
