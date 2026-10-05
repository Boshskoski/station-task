import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEMO_STATIONS_CONFIG } from '@features/demo/constants/demo-stations-config.const';
import { DemoModeService } from './demo-mode.service';

describe('DemoModeService', () => {
  function create(search: string): DemoModeService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { location: { search } } }],
    });
    return TestBed.inject(DemoModeService);
  }

  it('reads the number of demo stations from the URL', () => {
    const demoMode = create('?station=3&demo=10000');

    expect(demoMode.stationCount).toBe(10000);
    expect(demoMode.queryParams).toEqual({ demo: 10000 });
  });

  it('is off without the param', () => {
    const demoMode = create('?station=3');

    expect(demoMode.stationCount).toBeUndefined();
    expect(demoMode.queryParams).toEqual({});
  });

  it('is off for a value that is not a positive whole number', () => {
    for (const value of ['0', '-5', '1.5', '1e4', 'abc', '']) {
      expect(create(`?demo=${value}`).stationCount)
        .withContext(value)
        .toBeUndefined();
    }
  });

  it('caps the number of stations so a typo cannot freeze the tab', () => {
    expect(create('?demo=99999999').stationCount).toBe(DEMO_STATIONS_CONFIG.maxCount);
  });
});
