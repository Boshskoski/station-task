import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { StationDetailsMapper } from '@features/details/services/station-details.mapper';
import { stationDetailsDto } from '@features/details/testing/station-details.fixtures';
import { StationDetailsSupport } from './station-details-support';

describe('StationDetailsSupport', () => {
  let fixture: ComponentFixture<StationDetailsSupport>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular({})] });
    const details = TestBed.inject(StationDetailsMapper).stationDetailsDtoToUi(stationDetailsDto());
    fixture = TestBed.createComponent(StationDetailsSupport);
    fixture.componentRef.setInput('support', details.support);
    fixture.componentRef.setInput('ownerName', details.ownedByCompanyName);
    await fixture.whenStable();
  });

  it('shows who owns the station', () => {
    expect(fixture.nativeElement.textContent).toContain('Owned by Current Eco AS');
  });

  it('links to the phone, the email, the website and the customer service', () => {
    const hrefs = Array.from(
      fixture.nativeElement.querySelectorAll('.support-links ion-button') as NodeListOf<
        HTMLElement & { href?: string }
      >,
      (button) => button.href,
    );

    expect(hrefs).toEqual([
      'tel:+4700000000',
      'mailto:support@current.eco',
      'https://current.eco',
      'https://support.current.eco',
    ]);
  });
});
