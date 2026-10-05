import { Service } from '@angular/core';
import { LocationError } from '@features/location/errors/location.error';
import { UserPosition } from '@features/location/models/ui/user-position.ui';

@Service()
export class UserPositionMapper {
  geolocationPositionToUi({ coords }: GeolocationPosition): UserPosition {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
    };
  }

  geolocationErrorToUi(error: GeolocationPositionError, secureContext: boolean): LocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return new LocationError(secureContext ? 'denied' : 'insecure');
      case error.TIMEOUT:
        return new LocationError('timeout');
      default:
        return new LocationError('unavailable');
    }
  }
}
