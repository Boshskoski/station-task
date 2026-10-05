import { inject, Service, signal } from '@angular/core';
import { LocationError } from '@features/location/errors/location.error';
import { UserPosition } from '@features/location/models/ui/user-position.ui';
import { GeolocationService } from '@features/location/services/geolocation.service';
import { LocationErrorKind } from '@features/location/types/location-error-kind.type';

@Service()
export class UserLocationStore {
  private readonly geolocation = inject(GeolocationService);

  private readonly lastPosition = signal<UserPosition | undefined>(undefined);
  private readonly requesting = signal(false);
  private readonly lastError = signal<LocationErrorKind | undefined>(undefined);

  readonly position = this.lastPosition.asReadonly();
  readonly locating = this.requesting.asReadonly();
  readonly error = this.lastError.asReadonly();

  async locate(): Promise<void> {
    if (this.locating()) {
      return;
    }
    this.requesting.set(true);
    this.lastError.set(undefined);
    try {
      this.lastPosition.set(await this.geolocation.getCurrentPosition());
    } catch (error) {
      this.lastError.set(error instanceof LocationError ? error.kind : 'unavailable');
    } finally {
      this.requesting.set(false);
    }
  }

  dismissError(): void {
    this.lastError.set(undefined);
  }
}
