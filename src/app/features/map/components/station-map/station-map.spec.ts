import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { LngLatBounds } from 'maplibre-gl';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { MapPalette } from '@features/map/models/ui/map-palette.ui';
import { MapThemeService } from '@features/map/services/map-theme.service';
import { SpiderfyService } from '@features/map/services/spiderfy.service';
import { StationSourceService } from '@features/map/services/station-source.service';
import { mapPlace, mapPosition } from '@features/map/testing/map.fixtures';
import { StationMap } from './station-map';

describe('StationMap', () => {
  const lightPalette: MapPalette = {
    dark: false,
    primary: '#0054e9',
    primaryRgb: '0, 84, 233',
    primaryContrast: '#fff',
    success: '#2dd55b',
    successContrast: '#000',
    medium: '#636469',
    mediumContrast: '#fff',
    danger: '#c5000f',
    dangerRgb: '197, 0, 15',
    tertiary: '#6030ff',
    tertiaryRgb: '96, 48, 255',
  };
  const palette = signal(lightPalette);

  const MAP_METHODS = [
    'on',
    'hasImage',
    'addImage',
    'updateImage',
    'getLayer',
    'addLayer',
    'setPaintProperty',
    'getSource',
    'queryRenderedFeatures',
    'easeTo',
    'fitBounds',
    'getZoom',
    'getMaxZoom',
    'getContainer',
    'getCanvas',
    'project',
    'unproject',
  ] as const;

  interface RenderedFeatures {
    station?: object;
    cluster?: object;
  }

  let fixture: ComponentFixture<StationMap>;
  let stations: readonly Station[];
  let rendered: RenderedFeatures;
  let zoom: number;
  let layerIds: Set<string>;
  let imageIds: Set<string>;
  let canvas: { style: { cursor: string } };
  let source: Record<'updateData' | 'getClusterExpansionZoom' | 'getClusterLeaves', jasmine.Spy>;
  let map: Record<(typeof MAP_METHODS)[number], jasmine.Spy> & {
    touchZoomRotate: { disableRotation: jasmine.Spy };
    keyboard: { disableRotation: jasmine.Spy };
  };

  function createMap(): typeof map {
    const fake: typeof map = jasmine.createSpyObj('map', MAP_METHODS);
    fake.touchZoomRotate = { disableRotation: jasmine.createSpy('disableRotation') };
    fake.keyboard = { disableRotation: jasmine.createSpy('disableRotation') };
    fake.hasImage.and.callFake((id: string) => imageIds.has(id));
    fake.addImage.and.callFake((id: string) => imageIds.add(id));
    fake.getLayer.and.callFake((id: string) => layerIds.has(id));
    fake.addLayer.and.callFake(({ id }: { id: string }) => layerIds.add(id));
    fake.getSource.and.returnValue(source);
    fake.queryRenderedFeatures.and.callFake(
      (_point: unknown, { layers }: { layers: readonly string[] }) => {
        const found = layers.includes(STATION_MAP_CONFIG.clusterLayerId)
          ? rendered.cluster
          : rendered.station;
        return found ? [found] : [];
      },
    );
    fake.getZoom.and.callFake(() => zoom);
    fake.getMaxZoom.and.returnValue(STATION_MAP_CONFIG.maxZoom);
    fake.getContainer.and.returnValue({ clientHeight: 800 });
    fake.getCanvas.and.callFake(() => canvas);
    fake.project.and.callFake(({ lng, lat }: { lng: number; lat: number }) => ({
      x: lng * 10,
      y: lat * 10,
    }));
    fake.unproject.and.callFake(([x, y]: [number, number]) => ({ lng: x / 10, lat: y / 10 }));
    return fake;
  }

  function stationFeature(chargingStationId: number, spider = false): object {
    return {
      source: spider ? STATION_MAP_CONFIG.spiderSourceId : STATION_MAP_CONFIG.stationsSourceId,
      properties: { chargingStationId },
      geometry: { type: 'Point', coordinates: [10.5, 60.2] },
    };
  }

  function clusterFeature(clusterId: number): object {
    return {
      source: STATION_MAP_CONFIG.stationsSourceId,
      properties: { cluster_id: clusterId },
      geometry: { type: 'Point', coordinates: [10.6, 60.3] },
    };
  }

  function mapElement() {
    return fixture.debugElement.query(By.css('mgl-map'));
  }

  function sourceData(id: string): { features: readonly unknown[] } {
    const element = fixture.debugElement
      .queryAll(By.css('mgl-geojson-source'))
      .find((candidate) => candidate.properties['id'] === id);
    return element?.properties['data'];
  }

  async function settle(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  }

  async function loadMap(): Promise<void> {
    mapElement().triggerEventHandler('mapLoad', map);
    await settle();
  }

  async function click(x = 100, y = 100): Promise<void> {
    mapElement().triggerEventHandler('mapClick', { target: map, point: { x, y } });
    await settle();
  }

  beforeEach(async () => {
    palette.set(lightPalette);
    rendered = {};
    zoom = 11;
    layerIds = new Set();
    imageIds = new Set();
    canvas = { style: { cursor: '' } };
    source = jasmine.createSpyObj('source', [
      'updateData',
      'getClusterExpansionZoom',
      'getClusterLeaves',
    ]);
    source.updateData.and.resolveTo();
    map = createMap();
    TestBed.configureTestingModule({
      providers: [{ provide: MapThemeService, useValue: { palette } }],
    });
    TestBed.overrideComponent(StationMap, {
      set: {
        imports: [],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [SpiderfyService, StationSourceService],
      },
    });
    stations = TestBed.inject(StationMapper).stationsDtoToUi([
      stationDto({ PK_ChargingStationID: 1, Latitude: 59.9, Longitude: 10.7 }),
      stationDto({ PK_ChargingStationID: 2, Latitude: 60.4, Longitude: 11.1 }),
    ]);
    fixture = TestBed.createComponent(StationMap);
    fixture.componentRef.setInput('stations', stations);
    await fixture.whenStable();
  });

  describe('loading the map', () => {
    it('locks rotation and watches the pointer for the cursor', async () => {
      await loadMap();

      expect(map.touchZoomRotate.disableRotation).toHaveBeenCalled();
      expect(map.keyboard.disableRotation).toHaveBeenCalled();
      expect(map.on).toHaveBeenCalledOnceWith('mousemove', jasmine.any(Function));
    });

    it('registers the icons and every layer once', async () => {
      await loadMap();

      expect(imageIds).toEqual(
        new Set([STATION_MAP_CONFIG.availableIconId, STATION_MAP_CONFIG.unavailableIconId]),
      );
      expect(layerIds.has(STATION_MAP_CONFIG.stationLayerId)).toBeTrue();
      expect(layerIds.has(STATION_MAP_CONFIG.clusterLayerId)).toBeTrue();
      expect(layerIds.has(STATION_MAP_CONFIG.spiderStationLayerId)).toBeTrue();
      expect(map.addLayer).toHaveBeenCalledTimes(layerIds.size);
    });

    it('sends the stations to the source as one diff', async () => {
      await loadMap();

      expect(source.updateData).toHaveBeenCalledTimes(1);
      const [diff] = source.updateData.calls.mostRecent().args as [
        { remove: readonly number[]; add: readonly unknown[] },
      ];
      expect(diff.remove).toEqual([]);
      expect(diff.add.length).toBe(2);
    });

    it('does not touch the source until the map has loaded', () => {
      expect(source.updateData).not.toHaveBeenCalled();
    });

    it('sends only the changes when the stations change', async () => {
      await loadMap();
      source.updateData.calls.reset();

      fixture.componentRef.setInput('stations', [stations[1]]);
      await settle();

      const [diff] = source.updateData.calls.mostRecent().args as [
        { remove: readonly number[]; add: readonly unknown[] },
      ];
      expect(diff.remove).toEqual([1]);
      expect(diff.add).toEqual([]);
    });

    it('sends nothing when the new list is the same', async () => {
      await loadMap();
      source.updateData.calls.reset();

      fixture.componentRef.setInput('stations', [...stations]);
      await settle();

      expect(source.updateData).not.toHaveBeenCalled();
    });

    it('repaints the layers and redraws the icons on a theme change instead of adding them again', async () => {
      await loadMap();
      map.addLayer.calls.reset();

      palette.set({ ...lightPalette, dark: true, success: '#2fdf75' });
      await settle();

      expect(map.addLayer).not.toHaveBeenCalled();
      expect(map.setPaintProperty).toHaveBeenCalled();
      expect(map.updateImage).toHaveBeenCalledTimes(2);
    });
  });

  describe('first view', () => {
    it('fits the first non-empty list once', async () => {
      const empty = TestBed.createComponent(StationMap);
      empty.componentRef.setInput('stations', []);
      await empty.whenStable();
      const fitBounds = (): unknown =>
        empty.debugElement.query(By.css('mgl-map')).properties['fitBounds'];
      expect(fitBounds()).toBeUndefined();

      empty.componentRef.setInput('stations', stations);
      await empty.whenStable();
      const bounds = fitBounds() as LngLatBounds;
      expect(bounds.getSouth()).toBeCloseTo(59.9);
      expect(bounds.getNorth()).toBeCloseTo(60.4);

      empty.componentRef.setInput('stations', [stations[0]]);
      await empty.whenStable();
      expect(fitBounds()).toBe(bounds);
    });

    it('does not fit all stations when a station from a link is already in focus', async () => {
      const second = TestBed.createComponent(StationMap);
      second.componentRef.setInput('focus', { latitude: 60, longitude: 11 });
      second.componentRef.setInput('stations', stations);
      await second.whenStable();

      expect(second.debugElement.query(By.css('mgl-map')).properties['fitBounds']).toBeUndefined();
    });
  });

  describe('clicking the map', () => {
    beforeEach(loadMap);

    it('selects the station that was clicked', async () => {
      const selected = jasmine.createSpy('selected');
      fixture.componentInstance.stationSelected.subscribe(selected);
      rendered.station = stationFeature(7);

      await click();

      expect(selected).toHaveBeenCalledOnceWith(7);
    });

    it('does not report a click on a station as a click on the background', async () => {
      const background = jasmine.createSpy('background');
      fixture.componentInstance.backgroundClicked.subscribe(background);
      rendered.station = stationFeature(7);

      await click();

      expect(background).not.toHaveBeenCalled();
    });

    it('reports a click on the empty map', async () => {
      const background = jasmine.createSpy('background');
      fixture.componentInstance.backgroundClicked.subscribe(background);

      await click();

      expect(background).toHaveBeenCalledTimes(1);
    });

    it('does not report a click on a cluster as a click on the background', async () => {
      const background = jasmine.createSpy('background');
      fixture.componentInstance.backgroundClicked.subscribe(background);
      rendered.cluster = clusterFeature(3);
      source.getClusterExpansionZoom.and.resolveTo(13);

      await click();

      expect(background).not.toHaveBeenCalled();
    });

    it('zooms into a cluster to the zoom that splits it', async () => {
      rendered.cluster = clusterFeature(3);
      source.getClusterExpansionZoom.and.resolveTo(13);

      await click();

      expect(source.getClusterExpansionZoom).toHaveBeenCalledOnceWith(3);
      expect(map.easeTo).toHaveBeenCalledOnceWith({
        center: { lng: 10.6, lat: 60.3 },
        zoom: 13,
      });
      expect(sourceData(STATION_MAP_CONFIG.spiderSourceId).features.length).toBe(0);
    });

    describe('a cluster that cannot be split by zooming', () => {
      beforeEach(() => {
        rendered.cluster = clusterFeature(3);
        source.getClusterExpansionZoom.and.resolveTo(STATION_MAP_CONFIG.maxZoom + 1);
        source.getClusterLeaves.and.resolveTo([
          { properties: { chargingStationId: 1 } },
          { properties: { chargingStationId: 2 } },
          { properties: { chargingStationId: 3 } },
        ]);
      });

      it('spreads its stations out with a leg and a point each', async () => {
        await click();

        expect(map.easeTo).not.toHaveBeenCalled();
        expect(source.getClusterLeaves).toHaveBeenCalledOnceWith(3, Infinity, 0);
        expect(sourceData(STATION_MAP_CONFIG.spiderSourceId).features.length).toBe(6);
      });

      it('closes the spread on a second click on the same cluster', async () => {
        await click();
        await click();

        expect(sourceData(STATION_MAP_CONFIG.spiderSourceId).features.length).toBe(0);
        expect(source.getClusterLeaves).toHaveBeenCalledTimes(1);
      });

      it('closes the spread when the zoom starts', async () => {
        await click();

        mapElement().triggerEventHandler('zoomStart');
        await settle();

        expect(sourceData(STATION_MAP_CONFIG.spiderSourceId).features.length).toBe(0);
      });

      it('closes the spread when the stations change', async () => {
        await click();

        fixture.componentRef.setInput('stations', [stations[0]]);
        await settle();

        expect(sourceData(STATION_MAP_CONFIG.spiderSourceId).features.length).toBe(0);
      });

      it('keeps the spread open when one of its stations is selected, and closes it for any other', async () => {
        await click();
        rendered = { station: stationFeature(2, true) };
        await click();
        expect(sourceData(STATION_MAP_CONFIG.spiderSourceId).features.length).toBe(6);

        rendered = { station: stationFeature(1) };
        await click();
        expect(sourceData(STATION_MAP_CONFIG.spiderSourceId).features.length).toBe(0);
      });
    });
  });

  describe('keeping the clicked station visible next to the details overlay', () => {
    beforeEach(loadMap);

    it('pans a station under the side panel to the middle of the visible area', async () => {
      fixture.componentRef.setInput('overlayInsets', { left: 432, bottom: 0 });
      rendered.station = stationFeature(7);

      await click(200, 300);

      const [options] = map.easeTo.calls.mostRecent().args as unknown as [
        { center: unknown; offset: [number, number] },
      ];
      expect(options.center).toEqual({ lng: 10.5, lat: 60.2 });
      expect(options.offset[0]).toBe(216);
    });

    it('pans a station under the bottom sheet up into the visible area', async () => {
      fixture.componentRef.setInput('overlayInsets', { left: 0, bottom: 320 });
      rendered.station = stationFeature(7);

      await click(200, 700);

      const [options] = map.easeTo.calls.mostRecent().args as unknown as [
        { offset: [number, number] },
      ];
      expect(options.offset).toEqual([0, -160]);
    });

    it('does not move the camera for a station that is already visible', async () => {
      fixture.componentRef.setInput('overlayInsets', { left: 432, bottom: 0 });
      rendered.station = stationFeature(7);

      await click(900, 300);

      expect(map.easeTo).not.toHaveBeenCalled();
    });

    it('does not move the camera when no overlay is open', async () => {
      rendered.station = stationFeature(7);

      await click(10, 790);

      expect(map.easeTo).not.toHaveBeenCalled();
    });
  });

  describe('moving the camera on request', () => {
    beforeEach(loadMap);

    it('flies to a focused station at the focus zoom, away from the details overlay', async () => {
      fixture.componentRef.setInput('overlayInsets', { left: 432, bottom: 0 });
      fixture.componentRef.setInput('focus', { latitude: 60.1, longitude: 11.2 });
      await settle();

      const [options] = map.easeTo.calls.mostRecent().args as unknown as [
        { center: unknown; zoom: number; offset: [number, number] },
      ];
      expect(options.center).toEqual({ lng: 11.2, lat: 60.1 });
      expect(options.zoom).toBe(STATION_MAP_CONFIG.focusZoom);
      expect(options.offset[0]).toBe(216);
    });

    it('keeps a closer zoom when the map is already zoomed in further', async () => {
      zoom = 17;
      fixture.componentRef.setInput('focus', { latitude: 60.1, longitude: 11.2 });
      await settle();

      const [options] = map.easeTo.calls.mostRecent().args as unknown as [{ zoom: number }];
      expect(options.zoom).toBe(17);
    });

    it('focuses the same place again when a new request object arrives', async () => {
      fixture.componentRef.setInput('focus', { latitude: 60.1, longitude: 11.2 });
      await settle();
      fixture.componentRef.setInput('focus', { latitude: 60.1, longitude: 11.2 });
      await settle();

      expect(map.easeTo).toHaveBeenCalledTimes(2);
    });

    it('fits the map to the bounding box of a searched address', async () => {
      fixture.componentRef.setInput('searchPlace', mapPlace());
      await settle();

      expect(map.fitBounds).toHaveBeenCalledOnceWith(
        jasmine.anything(),
        jasmine.objectContaining({ maxZoom: STATION_MAP_CONFIG.searchMaxZoom }),
      );
      expect(sourceData(STATION_MAP_CONFIG.searchSourceId).features.length).toBe(1);
    });

    it('centres on the user position and draws it', async () => {
      fixture.componentRef.setInput('userPosition', mapPosition());
      await settle();

      const { latitude, longitude } = mapPosition();
      expect(map.easeTo).toHaveBeenCalledOnceWith({
        center: { lng: longitude, lat: latitude },
        zoom: STATION_MAP_CONFIG.locateZoom,
      });
      expect(sourceData(STATION_MAP_CONFIG.userLocationSourceId).features.length).toBe(1);
    });
  });

  describe('zoom snapping', () => {
    it('rounds a fractional zoom to the nearest whole level', () => {
      zoom = 10.6;

      mapElement().triggerEventHandler('zoomEnd', { target: map });

      expect(map.easeTo).toHaveBeenCalledOnceWith({ zoom: 11 });
    });

    it('leaves a whole zoom alone', () => {
      zoom = 12;

      mapElement().triggerEventHandler('zoomEnd', { target: map });

      expect(map.easeTo).not.toHaveBeenCalled();
    });
  });

  describe('the cursor', () => {
    beforeEach(loadMap);

    function move(): void {
      const [, listener] = map.on.calls.mostRecent().args as unknown as [
        string,
        (event: unknown) => void,
      ];
      listener({ target: map, point: { x: 1, y: 1 } });
    }

    it('is a pointer over a station', () => {
      rendered.station = stationFeature(7);

      move();

      expect(canvas.style.cursor).toBe('pointer');
    });

    it('is a pointer over a cluster', () => {
      rendered.cluster = clusterFeature(3);

      move();

      expect(canvas.style.cursor).toBe('pointer');
    });

    it('goes back to the default over empty map', () => {
      rendered.station = stationFeature(7);
      move();
      rendered = {};

      move();

      expect(canvas.style.cursor).toBe('');
    });
  });
});
