import { TelHrefPipe } from './tel-href.pipe';

describe('TelHrefPipe', () => {
  const pipe = new TelHrefPipe();

  it('builds a tel link without whitespace', () => {
    expect(pipe.transform('+47 000 00 000')).toBe('tel:+4700000000');
  });

  it('keeps a number that has no whitespace unchanged', () => {
    expect(pipe.transform('+4700000000')).toBe('tel:+4700000000');
  });
});
