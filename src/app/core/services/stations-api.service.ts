import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiEnvelope } from '@core/models/dto/api-envelope.dto';
import { StationDto } from '@core/models/dto/station/station.dto';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from './station.mapper';

@Service()
export class StationsApiService {
  static readonly URL = `${environment.apiBaseUrl}/c/a8f2-a16e-4e37-a9d6`;

  private readonly http = inject(HttpClient);
  private readonly mapper = inject(StationMapper);

  getStations(): Observable<readonly Station[]> {
    return this.http
      .get<ApiEnvelope<readonly StationDto[]>>(StationsApiService.URL)
      .pipe(map((response) => this.mapper.stationsDtoToUi(response.Result)));
  }
}
