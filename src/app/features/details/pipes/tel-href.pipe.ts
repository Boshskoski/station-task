import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'telHref' })
export class TelHrefPipe implements PipeTransform {
  transform(phoneNumber: string): string {
    return `tel:${phoneNumber.replaceAll(/\s/g, '')}`;
  }
}
