import { ChargePointStatus } from '@features/details/enums/charge-point-status.enum';
import { ChargePointStatusColorPipe } from './charge-point-status-color.pipe';

describe('ChargePointStatusColorPipe', () => {
  const pipe = new ChargePointStatusColorPipe();

  it('colors every status', () => {
    expect(pipe.transform(ChargePointStatus.Available)).toBe('success');
    expect(pipe.transform(ChargePointStatus.Preparing)).toBe('warning');
  });
});
