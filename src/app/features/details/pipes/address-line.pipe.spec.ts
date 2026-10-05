import { TestBed } from '@angular/core/testing';
import { StationDto } from '@core/models/dto/station/station.dto';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { AddressLinePipe } from './address-line.pipe';

describe('AddressLinePipe', () => {
  const pipe = new AddressLinePipe();
  const station = (overrides: Partial<StationDto>) =>
    TestBed.inject(StationMapper).stationDtoToUi(stationDto(overrides));

  it('joins street, post code with town, state and country', () => {
    expect(
      pipe.transform(
        station({
          Address: 'Street 1',
          PostCode: '0150',
          Town: 'Oslo',
          StateOrProvince: 'Oslo County',
          Country: 'Norway',
        }),
      ),
    ).toBe('Street 1, 0150 Oslo, Oslo County, Norway');
  });

  it('skips the state when it repeats the town', () => {
    expect(
      pipe.transform(
        station({
          Address: 'Street 1',
          PostCode: '0150',
          Town: 'Oslo',
          StateOrProvince: 'Oslo',
          Country: 'Norway',
        }),
      ),
    ).toBe('Street 1, 0150 Oslo, Norway');
  });

  it('skips a missing state', () => {
    expect(
      pipe.transform(
        station({
          Address: 'Street 1',
          PostCode: '0150',
          Town: 'Oslo',
          StateOrProvince: null,
          Country: 'Norway',
        }),
      ),
    ).toBe('Street 1, 0150 Oslo, Norway');
  });
});
