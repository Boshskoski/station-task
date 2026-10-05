import { formatNumber } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'plural' })
export class PluralPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(count: number, noun: string): string {
    return `${formatNumber(count, this.locale, '1.0-0')} ${count === 1 ? noun : `${noun}s`}`;
  }
}
