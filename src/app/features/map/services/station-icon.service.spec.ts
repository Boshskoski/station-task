import { TestBed } from '@angular/core/testing';
import { STATION_MAP_CONFIG } from '@features/map/constants/station-map-config.const';
import { StationIconService } from './station-icon.service';

describe('StationIconService', () => {
  it('draws a bolt in the given colour at the device pixel size of the icon', () => {
    const image = TestBed.inject(StationIconService).create('#ff0000');
    const size = STATION_MAP_CONFIG.iconSize * STATION_MAP_CONFIG.iconPixelRatio;
    const centre = (size / 2) * size * 4 + (size / 2) * 4;

    expect(image.width).toBe(size);
    expect(image.height).toBe(size);
    expect(Array.from(image.data.slice(centre, centre + 4))).toEqual([255, 0, 0, 255]);
    expect(image.data[3]).toBe(0);
  });
});
