import { LocationErrorKind } from '@features/location/types/location-error-kind.type';

export const LOCATION_ERROR_MESSAGES: Readonly<Record<LocationErrorKind, string>> = {
  unsupported: 'Your browser cannot share your location.',
  insecure: 'Your location is only available on secure (HTTPS) pages.',
  denied:
    'Location access is blocked. Allow it for this site in your browser settings, then try again.',
  unavailable: 'Your location could not be determined. Check your connection or GPS and try again.',
  timeout: 'Finding your location took too long. Try again.',
};
