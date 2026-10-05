import { TestBed } from '@angular/core/testing';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { PowerRangePipe } from './power-range.pipe';

describe('PowerRangePipe', () => {
  let pipe: PowerRangePipe;
  const station = (kWhMin: number, kWhMax: number) =>
    TestBed.inject(StationMapper).stationDtoToUi(stationDto({ kWhMin, kWhMax }));

  beforeEach(() => {
    pipe = TestBed.runInInjectionContext(() => new PowerRangePipe());
  });

  it('shows one value when min and max are equal', () => {
    expect(pipe.transform(station(22.2, 22.2))).toBe('22.2 kW');
  });

  it('shows a range when they differ', () => {
    expect(pipe.transform(station(22, 50))).toBe('22 – 50 kW');
  });
});
