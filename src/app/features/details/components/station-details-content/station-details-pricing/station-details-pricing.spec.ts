import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StationDetailsMapper } from '@features/details/services/station-details.mapper';
import { stationDetailsDto } from '@features/details/testing/station-details.fixtures';
import { StationDetailsPricing } from './station-details-pricing';

describe('StationDetailsPricing', () => {
  it('shows the price per kWh, the startup fee and the VAT', async () => {
    const { pricing } =
      TestBed.inject(StationDetailsMapper).stationDetailsDtoToUi(stationDetailsDto());
    const fixture: ComponentFixture<StationDetailsPricing> =
      TestBed.createComponent(StationDetailsPricing);
    fixture.componentRef.setInput('pricing', pricing);
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('NOK0.50 per kWh');
    expect(text).toContain('Startup fee NOK0.50 · VAT 25%');
  });
});
