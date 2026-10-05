import { TestBed } from '@angular/core/testing';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { FavoriteGroupsService } from './favorite-groups.service';

describe('FavoriteGroupsService', () => {
  let service: FavoriteGroupsService;
  let stations: readonly Station[];

  beforeEach(() => {
    service = TestBed.inject(FavoriteGroupsService);
    stations = TestBed.inject(StationMapper).stationsDtoToUi([
      stationDto({ PK_ChargingStationID: 1 }),
      stationDto({ PK_ChargingStationID: 2 }),
      stationDto({ PK_ChargingStationID: 3 }),
    ]);
  });

  it('returns no groups without favorites', () => {
    expect(service.groupFavorites(stations, { stations: [] })).toEqual([]);
  });

  it('pairs each favorite station with its station and connectors, in the saved order', () => {
    const connectors = [
      { id: 10, name: 'Point 10' },
      { id: 11, name: 'Point 11' },
    ];

    const groups = service.groupFavorites(stations, {
      stations: [
        { stationId: 3, connectors: [] },
        { stationId: 2, connectors },
      ],
    });

    expect(groups).toEqual([
      { chargingStationId: 3, station: stations[2], connectors: [] },
      { chargingStationId: 2, station: stations[1], connectors },
    ]);
  });

  it('keeps a favorite whose station is not in the list, without a station', () => {
    const groups = service.groupFavorites(stations, {
      stations: [{ stationId: 99, connectors: [] }],
    });

    expect(groups).toEqual([{ chargingStationId: 99, station: undefined, connectors: [] }]);
  });
});
