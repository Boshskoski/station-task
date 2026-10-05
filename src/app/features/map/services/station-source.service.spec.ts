import { TestBed } from '@angular/core/testing';
import type { MapLibreMap } from 'maplibre-gl';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { StationSourceService } from './station-source.service';

describe('StationSourceService', () => {
  let service: StationSourceService;
  let stations: readonly Station[];
  let source: { updateData: jasmine.Spy } | undefined;
  let map: MapLibreMap;

  function lastDiff(): { remove: readonly number[]; add: readonly unknown[] } {
    return source!.updateData.calls.mostRecent().args[0];
  }

  beforeEach(() => {
    source = jasmine.createSpyObj('source', ['updateData']);
    source!.updateData.and.resolveTo();
    map = { getSource: () => source } as unknown as MapLibreMap;
    TestBed.configureTestingModule({ providers: [StationSourceService] });
    service = TestBed.inject(StationSourceService);
    stations = TestBed.inject(StationMapper).stationsDtoToUi([
      stationDto({ PK_ChargingStationID: 1 }),
      stationDto({ PK_ChargingStationID: 2 }),
    ]);
  });

  it('adds every station the first time', () => {
    service.update(map, stations);

    expect(lastDiff().remove).toEqual([]);
    expect(lastDiff().add.length).toBe(2);
  });

  it('sends only the removed and added stations after that', () => {
    service.update(map, stations);

    service.update(map, [stations[1]]);

    expect(lastDiff().remove).toEqual([1]);
    expect(lastDiff().add).toEqual([]);
  });

  it('removes the stations that left the list and adds only the new ones', () => {
    const [added] = TestBed.inject(StationMapper).stationsDtoToUi([
      stationDto({ PK_ChargingStationID: 3 }),
    ]);
    service.update(map, stations);

    service.update(map, [stations[0], added]);

    expect(lastDiff().remove).toEqual([2]);
    expect(lastDiff().add).toEqual([jasmine.objectContaining({ id: 3 })]);
  });

  it('replaces a station whose object changed, since MapLibre applies removals before additions', () => {
    service.update(map, stations);

    service.update(map, [stations[0], { ...stations[1], availableBoxes: 0 }]);

    expect(lastDiff().remove).toEqual([2]);
    expect(lastDiff().add).toEqual([
      jasmine.objectContaining({ properties: jasmine.objectContaining({ availableBoxes: 0 }) }),
    ]);
  });

  it('removes every station when the list becomes empty', () => {
    service.update(map, stations);

    service.update(map, []);

    expect(lastDiff().remove).toEqual([1, 2]);
    expect(lastDiff().add).toEqual([]);
  });

  it('sends nothing when the list holds the same stations', () => {
    service.update(map, stations);
    source!.updateData.calls.reset();

    service.update(map, [...stations]);

    expect(source!.updateData).not.toHaveBeenCalled();
  });

  it('does nothing while the source does not exist', () => {
    const missing = source;
    source = undefined;

    service.update(map, stations);

    expect(missing!.updateData).not.toHaveBeenCalled();
  });
});
