import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiEnvelope } from '@core/models/dto/api-envelope.dto';
import { StationDetailsDto } from '@features/details/models/dto/station-details.dto';
import { StationDetails } from '@features/details/models/ui/station-details.ui';
import { StationDetailsMapper } from './station-details.mapper';

@Service()
export class StationDetailsApiService {
  static readonly URL = `${environment.apiBaseUrl}/c/dc70-4ec5-44d3-9b41`;

  private readonly http = inject(HttpClient);
  private readonly mapper = inject(StationDetailsMapper);

  getStationDetails(chargingStationId: number): Observable<StationDetails> {
    return this.http
      .get<ApiEnvelope<StationDetailsDto>>(StationDetailsApiService.URL, {
        params: { id: chargingStationId },
      })
      .pipe(map((response) => this.mapper.stationDetailsDtoToUi(response.Result)));
  }
}
