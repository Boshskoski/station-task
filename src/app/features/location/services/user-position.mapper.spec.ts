import { TestBed } from '@angular/core/testing';
import { geolocationError, geolocationPosition, userPosition } from '@features/location/testing/location.fixtures';
import { UserPositionMapper } from './user-position.mapper';

describe('UserPositionMapper', () => {
  let mapper: UserPositionMapper;

  beforeEach(() => {
    mapper = TestBed.inject(UserPositionMapper);
  });

  it('keeps the coordinates and the accuracy of a browser position', () => {
    expect(mapper.geolocationPositionToUi(geolocationPosition())).toEqual(userPosition());
  });

  it('maps a refused permission to denied', () => {
    expect(mapper.geolocationErrorToUi(geolocationError(1), true).kind).toBe('denied');
  });

  it('maps a refusal on an insecure page to insecure', () => {
    expect(mapper.geolocationErrorToUi(geolocationError(1), false).kind).toBe('insecure');
  });

  it('maps a timeout to timeout', () => {
    expect(mapper.geolocationErrorToUi(geolocationError(3), true).kind).toBe('timeout');
  });

  it('maps an unavailable position to unavailable', () => {
    expect(mapper.geolocationErrorToUi(geolocationError(2), true).kind).toBe('unavailable');
  });
});
