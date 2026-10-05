import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlComponent,
  GeoJSONSourceComponent,
  MapComponent,
  NavigationControlDirective,
} from '@maplibre/ngx-maplibre-gl';
import { provideMaplibreWorker } from '@maplibre/ngx-maplibre-gl/config';
import type {
  FitBoundsOptions,
  LngLatBounds,
  MapGeoJSONFeature,
  MapLibreEvent,
  MapLibreMap,
  MapMouseEvent,
} from 'maplibre-gl';
import { Station } from '@core/models/ui/station/station.ui';
import { BASE_MAP_STYLE } from '@features/map/constants/base-map-style.const';
import { EMPTY_FEATURE_COLLECTION } from '@features/map/constants/empty-feature-collection.const';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { MapFocus } from '@features/map/models/ui/map-focus.ui';
import { MapPlace } from '@features/map/models/ui/map-place.ui';
import { MapPosition } from '@features/map/models/ui/map-position.ui';
import { MapHitTestService } from '@features/map/services/map-hit-test.service';
import { MapThemeService } from '@features/map/services/map-theme.service';
import { SpiderfyService } from '@features/map/services/spiderfy.service';
import { StationFeatureMapper } from '@features/map/services/station-feature.mapper';
import { StationMapCameraService } from '@features/map/services/station-map-camera.service';
import { StationMapLayersService } from '@features/map/services/station-map-layers.service';
import { StationSourceService } from '@features/map/services/station-source.service';
import { OverlayInsets } from '@shared/models/ui/overlay-insets.ui';

@Component({
  selector: 'app-station-map',
  imports: [MapComponent, GeoJSONSourceComponent, ControlComponent, NavigationControlDirective],
  templateUrl: './station-map.html',
  styleUrl: './station-map.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    provideMaplibreWorker('maplibre-gl-worker.mjs'),
    SpiderfyService,
    StationSourceService,
  ],
})
export class StationMap {
  readonly stations = input.required<readonly Station[]>();
  readonly searchPlace = input<MapPlace>();
  readonly userPosition = input<MapPosition>();
  readonly focus = input<MapFocus>();
  readonly overlayInsets = input<OverlayInsets>(STATION_MAP_CONFIG.noInsets);
  readonly stationSelected = output<number>();
  readonly backgroundClicked = output<void>();

  private readonly featureMapper = inject(StationFeatureMapper);
  private readonly theme = inject(MapThemeService);
  private readonly layers = inject(StationMapLayersService);
  private readonly stationSource = inject(StationSourceService);
  private readonly camera = inject(StationMapCameraService);
  private readonly spiderfy = inject(SpiderfyService);
  private readonly hitTest = inject(MapHitTestService);
  private readonly map = signal<MapLibreMap | undefined>(undefined);

  protected readonly config = STATION_MAP_CONFIG;
  protected readonly mapStyle = BASE_MAP_STYLE;
  protected readonly fitBoundsOptions: FitBoundsOptions = {
    padding: STATION_MAP_CONFIG.fitPadding,
    maxZoom: STATION_MAP_CONFIG.fitMaxZoom,
    animate: false,
  };
  protected readonly noFeatures = EMPTY_FEATURE_COLLECTION;
  protected readonly spider = this.spiderfy.features;
  protected readonly searchFeatures = computed(() =>
    this.featureMapper.placeUiToFeatureCollection(this.searchPlace()),
  );
  protected readonly userLocationFeatures = computed(() =>
    this.featureMapper.positionUiToFeatureCollection(this.userPosition()),
  );
  private readonly hasCameraTarget = computed(
    () =>
      this.focus() !== undefined ||
      this.searchPlace() !== undefined ||
      this.userPosition() !== undefined,
  );
  // Fit all stations once, unless a focus, a search or the location already set the camera.
  protected readonly initialBounds = linkedSignal<readonly Station[], LngLatBounds | undefined>({
    source: this.stations,
    computation: (stations, previous) => {
      if (previous && previous.source.length > 0) {
        return previous.value;
      }
      return stations.length > 0 && !untracked(this.hasCameraTarget)
        ? this.featureMapper.stationsUiToBounds(stations)
        : undefined;
    },
  });

  constructor() {
    this.whenMapReady(this.theme.palette, (map, palette) => this.layers.show(map, palette));
    this.whenMapReady(this.stations, (map, stations) => this.showStations(map, stations));
    this.whenMapReady(this.searchPlace, (map, place) => this.camera.fitPlace(map, place));
    this.whenMapReady(this.userPosition, (map, position) => this.camera.centerOn(map, position));
    this.whenMapReady(this.focus, (map, focus) => this.showFocus(map, focus));
  }

  protected onMapLoad(map: MapLibreMap): void {
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    // A MapLibre listener, not the (mapMouseMove) output, so hovering runs no change detection.
    map.on('mousemove', (event) => this.hitTest.updateCursor(event));
    this.map.set(map);
  }

  protected snapZoom({ target: map }: MapLibreEvent): void {
    this.camera.snapZoom(map);
  }

  protected closeSpider(): void {
    this.spiderfy.close();
  }

  protected async onMapClick({ target: map, point }: MapMouseEvent): Promise<void> {
    const station = this.hitTest.stationAt(map, point);
    if (station) {
      this.selectStation(map, station, point);
      return;
    }
    const cluster = this.hitTest.clusterAt(map, point);
    if (cluster) {
      await this.spiderfy.expandCluster(map, cluster);
      return;
    }
    this.spiderfy.close();
    this.backgroundClicked.emit();
  }

  private whenMapReady<T>(source: () => T | undefined, show: (map: MapLibreMap, value: T) => void): void {
    effect(() => {
      const map = this.map();
      const value = source();
      if (map && value !== undefined) {
        untracked(() => show(map, value));
      }
    });
  }

  private selectStation(map: MapLibreMap, station: MapGeoJSONFeature, point: MapMouseEvent['point']): void {
    if (station.source !== STATION_MAP_CONFIG.spiderSourceId) {
      this.spiderfy.close();
    }
    this.stationSelected.emit(station.properties['chargingStationId']);
    this.camera.reveal(map, station, point, this.overlayInsets());
  }

  private showStations(map: MapLibreMap, stations: readonly Station[]): void {
    this.spiderfy.close();
    this.stationSource.update(map, stations);
  }

  private showFocus(map: MapLibreMap, focus: MapFocus): void {
    this.spiderfy.close();
    this.camera.focus(map, focus, this.overlayInsets());
  }
}
