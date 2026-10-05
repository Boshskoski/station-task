import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiEnvelope } from '@core/models/dto/api-envelope.dto';
import { StationDto } from '@core/models/dto/station/station.dto';
import { StationsApiService } from '@core/services/stations-api.service';
import { DemoModeService } from '@features/demo/services/demo-mode.service';
import { DemoStationsService } from '@features/demo/services/demo-stations.service';

export const demoStationsInterceptor: HttpInterceptorFn = (request, next) => {
  const count = inject(DemoModeService).stationCount;
  if (count === undefined || request.url !== StationsApiService.URL) {
    return next(request);
  }
  const demoStations = inject(DemoStationsService);
  return next(request).pipe(
    map((event) => {
      if (!(event instanceof HttpResponse)) {
        return event;
      }
      const body = event.body as ApiEnvelope<readonly StationDto[]>;
      return event.clone({ body: { ...body, Result: demoStations.generate(body.Result, count) } });
    }),
  );
};
