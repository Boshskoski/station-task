import { Service } from '@angular/core';
import type {
  CircleLayerSpecification,
  ExpressionSpecification,
  FilterSpecification,
  RasterLayerSpecification,
  SymbolLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { MapPalette } from '@features/map/models/ui/map-palette.ui';
import { StationMapIcon } from '@features/map/models/ui/station-map-icon.ui';
import { StationMapLayer } from '@features/map/types/station-map-layers.type';

@Service()
export class StationMapStyleService {
  private static readonly IS_CLUSTER: FilterSpecification = ['has', 'point_count'];
  private static readonly IS_STATION: FilterSpecification = ['!', ['has', 'point_count']];
  private static readonly IS_LEG: FilterSpecification = ['==', ['geometry-type'], 'LineString'];
  private static readonly IS_LEAF: FilterSpecification = ['==', ['geometry-type'], 'Point'];
  private static readonly IS_AVAILABLE: ExpressionSpecification = [
    '>',
    ['get', 'availableBoxes'],
    0,
  ];
  private static readonly OPEN_OPACITY: ExpressionSpecification = [
    'case',
    ['==', ['get', 'isOpen'], true],
    1,
    0.55,
  ];
  private static readonly ICON_LAYOUT: SymbolLayerSpecification['layout'] = {
    'icon-image': [
      'case',
      StationMapStyleService.IS_AVAILABLE,
      STATION_MAP_CONFIG.availableIconId,
      STATION_MAP_CONFIG.unavailableIconId,
    ],
    'icon-allow-overlap': true,
    'icon-ignore-placement': true,
  };
  private static readonly ICON_PAINT: SymbolLayerSpecification['paint'] = {
    'icon-opacity': StationMapStyleService.OPEN_OPACITY,
  };
  private static readonly LIGHT_TILES: RasterLayerSpecification['paint'] = {
    'raster-hue-rotate': 0,
    'raster-saturation': -0.55,
    'raster-contrast': -0.08,
    'raster-brightness-min': 0.04,
    'raster-brightness-max': 1,
  };
  private static readonly DARK_TILES: RasterLayerSpecification['paint'] = {
    'raster-hue-rotate': 180,
    'raster-saturation': -0.75,
    'raster-contrast': -0.15,
    'raster-brightness-min': 0.9,
    'raster-brightness-max': 0.1,
  };

  create(palette: MapPalette): readonly StationMapLayer[] {
    const {
      tilesSourceId,
      stationsSourceId,
      spiderSourceId,
      searchSourceId,
      userLocationSourceId,
      accuracyReferenceZoom,
      clusterLayerId,
      stationLayerId,
      spiderStationLayerId,
    } = STATION_MAP_CONFIG;
    const stationPaint = this.stationPaint(palette);
    return [
      {
        id: 'tiles',
        type: 'raster',
        source: tilesSourceId,
        paint: palette.dark
          ? StationMapStyleService.DARK_TILES
          : StationMapStyleService.LIGHT_TILES,
      },
      {
        id: 'spider-legs',
        type: 'line',
        source: spiderSourceId,
        filter: StationMapStyleService.IS_LEG,
        paint: { 'line-color': palette.medium, 'line-width': 2 },
      },
      {
        id: 'user-location-accuracy',
        type: 'circle',
        source: userLocationSourceId,
        paint: {
          'circle-color': `rgba(${palette.tertiaryRgb}, 0.15)`,
          'circle-stroke-color': `rgba(${palette.tertiaryRgb}, 0.45)`,
          'circle-stroke-width': 1,
          'circle-radius': [
            'interpolate',
            ['exponential', 2],
            ['zoom'],
            0,
            0,
            accuracyReferenceZoom,
            ['get', 'accuracyPixelsAtReferenceZoom'],
          ],
        },
      },
      {
        id: 'user-location',
        type: 'circle',
        source: userLocationSourceId,
        paint: this.dotPaint(palette.tertiary),
      },
      {
        id: 'search-result-halo',
        type: 'circle',
        source: searchSourceId,
        paint: { 'circle-color': `rgba(${palette.dangerRgb}, 0.25)`, 'circle-radius': 22 },
      },
      {
        id: 'search-result',
        type: 'circle',
        source: searchSourceId,
        paint: this.dotPaint(palette.danger),
      },
      {
        id: clusterLayerId,
        type: 'circle',
        source: stationsSourceId,
        filter: StationMapStyleService.IS_CLUSTER,
        paint: {
          'circle-color': palette.primary,
          'circle-radius': ['step', ['get', 'point_count'], 17, 10, 21, 100, 25],
          'circle-stroke-color': `rgba(${palette.primaryRgb}, 0.25)`,
          'circle-stroke-width': ['step', ['get', 'point_count'], 5, 100, 7],
        },
      },
      {
        id: 'station-cluster-labels',
        type: 'symbol',
        source: stationsSourceId,
        filter: StationMapStyleService.IS_CLUSTER,
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 13,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: { 'text-color': palette.primaryContrast },
      },
      {
        id: stationLayerId,
        type: 'circle',
        source: stationsSourceId,
        filter: StationMapStyleService.IS_STATION,
        paint: stationPaint,
      },
      {
        id: 'station-icons',
        type: 'symbol',
        source: stationsSourceId,
        filter: StationMapStyleService.IS_STATION,
        layout: StationMapStyleService.ICON_LAYOUT,
        paint: StationMapStyleService.ICON_PAINT,
      },
      {
        id: spiderStationLayerId,
        type: 'circle',
        source: spiderSourceId,
        filter: StationMapStyleService.IS_LEAF,
        paint: stationPaint,
      },
      {
        id: 'spider-station-icons',
        type: 'symbol',
        source: spiderSourceId,
        filter: StationMapStyleService.IS_LEAF,
        layout: StationMapStyleService.ICON_LAYOUT,
        paint: StationMapStyleService.ICON_PAINT,
      },
    ];
  }

  icons(palette: MapPalette): readonly StationMapIcon[] {
    return [
      { id: STATION_MAP_CONFIG.availableIconId, color: palette.successContrast },
      { id: STATION_MAP_CONFIG.unavailableIconId, color: palette.mediumContrast },
    ];
  }

  private stationPaint(palette: MapPalette): CircleLayerSpecification['paint'] {
    return {
      'circle-color': [
        'case',
        StationMapStyleService.IS_AVAILABLE,
        palette.success,
        palette.medium,
      ],
      'circle-radius': 14,
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 2,
      'circle-opacity': StationMapStyleService.OPEN_OPACITY,
      'circle-stroke-opacity': StationMapStyleService.OPEN_OPACITY,
    };
  }

  private dotPaint(color: string): CircleLayerSpecification['paint'] {
    return {
      'circle-color': color,
      'circle-radius': 8,
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 3,
    };
  }
}
