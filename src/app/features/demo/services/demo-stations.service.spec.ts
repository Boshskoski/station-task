import { TestBed } from '@angular/core/testing';
import { stationDto } from '@core/testing/station.fixtures';
import { DEMO_STATIONS_CONFIG } from '@features/demo/constants/demo-stations-config.const';
import { DemoStationsService } from './demo-stations.service';

describe('DemoStationsService', () => {
  const real = [
    stationDto({ PK_ChargingStationID: 7, Name: 'First' }),
    stationDto({ PK_ChargingStationID: 40, Name: 'Second' }),
  ];
  let service: DemoStationsService;

  beforeEach(() => {
    service = TestBed.inject(DemoStationsService);
  });

  it('keeps the real stations first and fills up to the requested count with copies', () => {
    const stations = service.generate(real, 6);

    expect(stations.length).toBe(6);
    expect(stations.slice(0, 2)).toEqual(real);
    expect(stations.slice(2).map((station) => station.Name)).toEqual([
      'First (demo 1)',
      'Second (demo 2)',
      'First (demo 3)',
      'Second (demo 4)',
    ]);
  });

  it('gives the copies unique ids above the highest real id', () => {
    const ids = service.generate(real, 1000).map((station) => station.PK_ChargingStationID);

    expect(new Set(ids).size).toBe(1000);
    expect(ids.slice(2, 4)).toEqual([41, 42]);
  });

  it('places the copies around the configured cities', () => {
    const { cities, latitudeSpread, longitudeSpread } = DEMO_STATIONS_CONFIG;
    const copies = service.generate(real, 2 + cities.length * 3).slice(2);

    copies.forEach((station, index) => {
      const city = cities[index % cities.length];
      expect(Math.abs(station.Latitude - city.latitude)).toBeLessThanOrEqual(latitudeSpread / 2);
      expect(Math.abs(station.Longitude - city.longitude)).toBeLessThanOrEqual(longitudeSpread / 2);
    });
  });

  it('generates the same stations every time, so ids in links and favorites stay valid', () => {
    expect(service.generate(real, 500)).toEqual(service.generate(real, 500));
  });

  it('returns only the first real stations when the count is smaller than the list', () => {
    expect(service.generate(real, 1)).toEqual([real[0]]);
  });

  it('returns an empty list when there is nothing to copy', () => {
    expect(service.generate([], 100)).toEqual([]);
  });
});
