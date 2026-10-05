import { DOCUMENT, inject, Service } from '@angular/core';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';

@Service()
export class StationIconService {
  private static readonly BOLT_PATH =
    'M194.82 496a18.36 18.36 0 0 1-18.1-21.53v-.11L204.83 320H96a16 16 0 0 1-12.44-26.06L302.73 23a18.45 18.45 0 0 1 32.8 13.71c0 .3-.08.59-.13.89L307.19 192H416a16 16 0 0 1 12.44 26.06L209.24 489a18.45 18.45 0 0 1-14.42 7';
  private static readonly BOLT_VIEWBOX = 512;

  private readonly document = inject(DOCUMENT);

  create(color: string): ImageData {
    const size = STATION_MAP_CONFIG.iconSize * STATION_MAP_CONFIG.iconPixelRatio;
    const canvas = this.document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D is not available');
    }
    const scale = size / StationIconService.BOLT_VIEWBOX;
    context.scale(scale, scale);
    context.fillStyle = color;
    context.fill(new Path2D(StationIconService.BOLT_PATH));
    return context.getImageData(0, 0, size, size);
  }
}
