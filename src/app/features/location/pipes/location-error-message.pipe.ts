import { Pipe, PipeTransform } from '@angular/core';
import { LOCATION_ERROR_MESSAGES } from '@features/location/constants/location-error-messages.const';
import { LocationErrorKind } from '@features/location/types/location-error-kind.type';

@Pipe({ name: 'locationErrorMessage' })
export class LocationErrorMessagePipe implements PipeTransform {
  transform(kind: LocationErrorKind | undefined): string {
    return kind ? LOCATION_ERROR_MESSAGES[kind] : '';
  }
}
