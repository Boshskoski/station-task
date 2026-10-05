import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mailtoHref' })
export class MailtoHrefPipe implements PipeTransform {
  transform(email: string): string {
    return `mailto:${email}`;
  }
}
