import { LOCATION_ERROR_MESSAGES } from '@features/location/constants/location-error-messages.const';
import { LocationErrorMessagePipe } from './location-error-message.pipe';

describe('LocationErrorMessagePipe', () => {
  const pipe = new LocationErrorMessagePipe();

  it('returns the message of the error', () => {
    expect(pipe.transform('timeout')).toBe(LOCATION_ERROR_MESSAGES.timeout);
  });

  it('returns an empty message without an error', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
