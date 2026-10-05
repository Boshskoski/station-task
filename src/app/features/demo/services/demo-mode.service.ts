import { DOCUMENT, inject, Service } from '@angular/core';
import { Params } from '@angular/router';
import { DEMO_STATIONS_CONFIG } from '@features/demo/constants/demo-stations-config.const';

@Service()
export class DemoModeService {
  private static readonly COUNT_PATTERN = /^[1-9]\d*$/;

  readonly stationCount = this.parseCount(
    new URLSearchParams(inject(DOCUMENT).location.search).get(DEMO_STATIONS_CONFIG.queryParam),
  );
  readonly queryParams: Params =
    this.stationCount === undefined ? {} : { [DEMO_STATIONS_CONFIG.queryParam]: this.stationCount };

  private parseCount(value: string | null): number | undefined {
    if (value === null || !DemoModeService.COUNT_PATTERN.test(value)) {
      return undefined;
    }
    return Math.min(Number(value), DEMO_STATIONS_CONFIG.maxCount);
  }
}
