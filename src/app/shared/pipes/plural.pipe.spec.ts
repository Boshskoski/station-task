import { TestBed } from '@angular/core/testing';
import { PluralPipe } from './plural.pipe';

describe('PluralPipe', () => {
  let pipe: PluralPipe;

  beforeEach(() => {
    pipe = TestBed.runInInjectionContext(() => new PluralPipe());
  });

  it('uses the singular for one', () => {
    expect(pipe.transform(1, 'station')).toBe('1 station');
  });

  it('uses the plural for zero and several', () => {
    expect(pipe.transform(0, 'station')).toBe('0 stations');
    expect(pipe.transform(3, 'station')).toBe('3 stations');
  });

  it('groups thousands', () => {
    expect(pipe.transform(10000, 'station')).toBe('10,000 stations');
  });
});
