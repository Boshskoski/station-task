import { TestBed } from '@angular/core/testing';
import { MapPalette } from '@features/map/models/ui/map-palette.ui';
import { StationMapLayer } from '@features/map/types/station-map-layers.type';
import { StationMapStyleService } from './station-map-style.service';

describe('StationMapStyleService', () => {
  let style: StationMapStyleService;
  const palette: MapPalette = {
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

  beforeEach(() => {
    style = TestBed.inject(StationMapStyleService);
  });

  function layer(id: string, from: MapPalette = palette): StationMapLayer {
    const found = style.create(from).find((candidate) => candidate.id === id);
    if (!found) {
      throw new Error(`Missing layer ${id}`);
    }
    return found;
  }

  function paint(id: string, property: string, from?: MapPalette): unknown {
    return (layer(id, from).paint as Record<string, unknown> | undefined)?.[property];
  }

  it('draws the tiles first and the spider stations on top', () => {
    expect(style.create(palette).map(({ id }) => id)).toEqual([
      'tiles',
      'spider-legs',
      'user-location-accuracy',
      'user-location',
      'search-result-halo',
      'search-result',
      'station-clusters',
      'station-cluster-labels',
      'station-points',
      'station-icons',
      'spider-stations',
      'spider-station-icons',
    ]);
  });

  it('colours clusters with the theme primary colour', () => {
    expect(paint('station-clusters', 'circle-color')).toBe('#0054e9');
    expect(paint('station-clusters', 'circle-stroke-color')).toBe('rgba(0, 84, 233, 0.25)');
  });

  it('marks the searched address with the theme danger colour', () => {
    expect(paint('search-result', 'circle-color')).toBe('#c5000f');
    expect(paint('search-result-halo', 'circle-color')).toBe('rgba(197, 0, 15, 0.25)');
  });

  it('marks the user location with the theme tertiary colour and an accuracy ring that scales with the zoom', () => {
    expect(paint('user-location', 'circle-color')).toBe('#6030ff');
    expect(paint('user-location-accuracy', 'circle-color')).toBe('rgba(96, 48, 255, 0.15)');
    expect(paint('user-location-accuracy', 'circle-radius')).toEqual([
      'interpolate',
      ['exponential', 2],
      ['zoom'],
      0,
      0,
      22,
      ['get', 'accuracyPixelsAtReferenceZoom'],
    ]);
  });

  it('colours stations by available boxes and fades closed ones', () => {
    expect(paint('station-points', 'circle-color')).toEqual([
      'case',
      ['>', ['get', 'availableBoxes'], 0],
      '#2dd55b',
      '#636469',
    ]);
    expect(paint('station-points', 'circle-opacity')).toEqual([
      'case',
      ['==', ['get', 'isOpen'], true],
      1,
      0.55,
    ]);
  });

  it('marks stations with a bolt icon and only clusters with a number, so a number always means stations', () => {
    expect<unknown>(layer('station-icons').layout?.['icon-image']).toEqual([
      'case',
      ['>', ['get', 'availableBoxes'], 0],
      'station-icon-available',
      'station-icon-unavailable',
    ]);
    expect<unknown>(layer('station-icons').layout?.['text-field']).toBeUndefined();
    expect(paint('station-icons', 'icon-opacity')).toEqual(
      paint('station-points', 'circle-opacity'),
    );
    expect<unknown>(layer('station-cluster-labels').layout?.['text-field']).toEqual([
      'get',
      'point_count_abbreviated',
    ]);
  });

  it('draws the bolt in the contrast colour of the station circle', () => {
    expect(style.icons(palette)).toEqual([
      { id: 'station-icon-available', color: '#000' },
      { id: 'station-icon-unavailable', color: '#fff' },
    ]);
  });

  it('draws spider stations exactly like map stations', () => {
    expect<unknown>(layer('spider-stations').paint).toEqual(layer('station-points').paint);
    expect<unknown>(layer('spider-station-icons').layout).toEqual(layer('station-icons').layout);
  });

  it('inverts the tiles in dark mode', () => {
    const dark = { ...palette, dark: true };

    expect(paint('tiles', 'raster-brightness-max')).toBe(1);
    expect(paint('tiles', 'raster-brightness-min', dark)).toBe(0.9);
    expect(paint('tiles', 'raster-brightness-max', dark)).toBe(0.1);
  });
});
