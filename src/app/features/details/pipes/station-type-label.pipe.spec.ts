import { ChargingStationType } from '@core/enums/station/charging-station-type.enum';
import { StationTypeLabelPipe } from './station-type-label.pipe';

describe('StationTypeLabelPipe', () => {
  const pipe = new StationTypeLabelPipe();

  it('labels every station type', () => {
    expect(pipe.transform(ChargingStationType.ApartmentBuilding)).toBe('Apartment building');
    expect(pipe.transform(ChargingStationType.PrivateParking)).toBe('Private parking');
    expect(pipe.transform(ChargingStationType.HomeCharger)).toBe('Home charger');
    expect(pipe.transform(ChargingStationType.Public)).toBe('Public');
  });
});
