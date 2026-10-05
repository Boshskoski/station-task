import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ADDRESS_SEARCH_CONFIG } from '@features/search/constants/address-search-config.const';
import { NominatimPlaceDto } from '@features/search/models/dto/nominatim-place.dto';
import { GeocodedPlace } from '@features/search/models/ui/geocoded-place.ui';
import { GeocodingMapper } from './geocoding.mapper';

@Service()
export class GeocodingApiService {
  static readonly URL = `${environment.geocodingBaseUrl}/search`;

  private readonly http = inject(HttpClient);
  private readonly mapper = inject(GeocodingMapper);

  search(query: string): Observable<readonly GeocodedPlace[]> {
    return this.http
      .get<readonly NominatimPlaceDto[]>(GeocodingApiService.URL, {
        params: { q: query, format: 'jsonv2', limit: ADDRESS_SEARCH_CONFIG.maxResults },
      })
      .pipe(map((places) => this.mapper.placesDtoToUi(places)));
  }
}
