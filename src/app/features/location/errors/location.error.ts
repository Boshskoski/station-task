import { LocationErrorKind } from '@features/location/types/location-error-kind.type';

export class LocationError extends Error {
  constructor(readonly kind: LocationErrorKind) {
    super(kind);
    this.name = 'LocationError';
  }
}
