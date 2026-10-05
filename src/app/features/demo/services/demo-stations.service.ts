import { Service } from '@angular/core';
import { StationDto } from '@core/models/dto/station/station.dto';
import { DEMO_STATIONS_CONFIG } from '@features/demo/constants/demo-stations-config.const';

@Service()
export class DemoStationsService {
  private static readonly RANDOM_MODULUS = 2147483647;
  private static readonly RANDOM_MULTIPLIER = 16807;

  generate(stations: readonly StationDto[], count: number): readonly StationDto[] {
    if (stations.length === 0 || count <= stations.length) {
      return stations.slice(0, count);
    }
    const { cities, seed, latitudeSpread, longitudeSpread } = DEMO_STATIONS_CONFIG;
    const firstId = Math.max(...stations.map((station) => station.PK_ChargingStationID)) + 1;
    let state = seed;
    const random = (): number => {
      state = (state * DemoStationsService.RANDOM_MULTIPLIER) % DemoStationsService.RANDOM_MODULUS;
      return state / DemoStationsService.RANDOM_MODULUS - 0.5;
    };
    const copies = Array.from({ length: count - stations.length }, (_, index): StationDto => {
      const source = stations[index % stations.length];
      const city = cities[index % cities.length];
      return {
        ...source,
        PK_ChargingStationID: firstId + index,
        Name: `${source.Name} (demo ${index + 1})`,
        Latitude: city.latitude + random() * latitudeSpread,
        Longitude: city.longitude + random() * longitudeSpread,
      };
    });
    return [...stations, ...copies];
  }
}
