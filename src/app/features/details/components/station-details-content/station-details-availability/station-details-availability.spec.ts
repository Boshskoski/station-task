import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { StationDetailsAvailability } from './station-details-availability';

describe('StationDetailsAvailability', () => {
  let fixture: ComponentFixture<StationDetailsAvailability>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(StationDetailsAvailability);
    fixture.componentRef.setInput(
      'station',
      TestBed.inject(StationMapper).stationDtoToUi(stationDto()),
    );
    await fixture.whenStable();
  });

  it('shows the counters of the station', () => {
    const values = Array.from(fixture.nativeElement.querySelectorAll('.counter'), (counter) => {
      const element = counter as HTMLElement;
      return [element.querySelector('dt')?.textContent, element.querySelector('dd')?.textContent];
    });

    expect(values[0]).toEqual(['Available', '29']);
    expect(values.map(([label]) => label)).toEqual(['Available', 'Occupied', 'Offline', 'Total']);
  });

  it('lists every connector with its available count', () => {
    const connector = fixture.nativeElement.querySelector('.connectors li');

    expect(connector.textContent).toContain('29 / 32 available');
  });
});
