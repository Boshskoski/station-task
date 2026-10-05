import { DOCUMENT, inject, InjectionToken } from '@angular/core';

export const GEOLOCATION = new InjectionToken<Geolocation | undefined>('GEOLOCATION', {
  providedIn: 'root',
  factory: () => inject(DOCUMENT).defaultView?.navigator.geolocation,
});
