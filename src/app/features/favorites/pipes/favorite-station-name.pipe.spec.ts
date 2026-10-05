import { TestBed } from '@angular/core/testing';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { FavoriteStationNamePipe } from './favorite-station-name.pipe';

describe('FavoriteStationNamePipe', () => {
  const pipe = new FavoriteStationNamePipe();
  const group = { chargingStationId: 7, connectors: [] };

  it('uses the station name', () => {
    const station = TestBed.inject(StationMapper).stationDtoToUi(stationDto({ Name: 'Oslo S' }));

    expect(pipe.transform({ ...group, station })).toBe('Oslo S');
  });

  it('falls back to the id when the station is no longer in the list', () => {
    expect(pipe.transform({ ...group, station: undefined })).toBe('Station 7');
  });
});
