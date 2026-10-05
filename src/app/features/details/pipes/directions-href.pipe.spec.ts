import { TestBed } from '@angular/core/testing';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { DirectionsHrefPipe } from './directions-href.pipe';

describe('DirectionsHrefPipe', () => {
  it('links to directions to the station coordinates', () => {
    const station = TestBed.inject(StationMapper).stationDtoToUi(
      stationDto({ Latitude: 59.9, Longitude: 10.7 }),
    );
    const url = new URL(new DirectionsHrefPipe().transform(station));

    expect(url.origin + url.pathname).toBe('https://www.google.com/maps/dir/');
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('destination')).toBe('59.9,10.7');
  });
});
