import { DOCUMENT, inject, Service } from '@angular/core';
import { LOCATION_CONFIG } from '@features/location/constants/location-config.const';
import { LocationError } from '@features/location/errors/location.error';
import { UserPosition } from '@features/location/models/ui/user-position.ui';
import { GEOLOCATION } from '@features/location/tokens/geolocation.token';
import { UserPositionMapper } from './user-position.mapper';

@Service()
export class GeolocationService {
  private readonly geolocation = inject(GEOLOCATION);
  private readonly document = inject(DOCUMENT);
  private readonly mapper = inject(UserPositionMapper);

  getCurrentPosition(): Promise<UserPosition> {
    const geolocation = this.geolocation;
    if (!geolocation) {
      return Promise.reject(new LocationError('unsupported'));
    }
    return new Promise((resolve, reject) =>
      geolocation.getCurrentPosition(
        (position) => resolve(this.mapper.geolocationPositionToUi(position)),
        (error) =>
          reject(
            this.mapper.geolocationErrorToUi(
              error,
              this.document.defaultView?.isSecureContext ?? true,
            ),
          ),
        LOCATION_CONFIG.positionOptions,
      ),
    );
  }
}
