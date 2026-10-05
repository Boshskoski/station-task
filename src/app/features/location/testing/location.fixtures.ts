import { UserPosition } from '@features/location/models/ui/user-position.ui';

export function userPosition(overrides: Partial<UserPosition> = {}): UserPosition {
  return { latitude: 59.9139, longitude: 10.7522, accuracy: 35, ...overrides };
}

export function geolocationPosition(overrides: Partial<GeolocationCoordinates> = {}): GeolocationPosition {
  const { latitude, longitude, accuracy } = userPosition();
  return {
    coords: { latitude, longitude, accuracy, ...overrides },
    timestamp: 0,
  } as GeolocationPosition;
}

export function geolocationError(code: number): GeolocationPositionError {
  return {
    code,
    message: '',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  };
}
