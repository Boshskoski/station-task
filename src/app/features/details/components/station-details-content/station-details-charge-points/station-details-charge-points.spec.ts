import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { ChargePoint } from '@features/details/models/ui/charge-point.ui';
import { StationDetailsMapper } from '@features/details/services/station-details.mapper';
import { stationDetailsDto } from '@features/details/testing/station-details.fixtures';
import { StationDetailsChargePoints } from './station-details-charge-points';

describe('StationDetailsChargePoints', () => {
  let fixture: ComponentFixture<StationDetailsChargePoints>;
  let chargePoints: readonly ChargePoint[];

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular({})] });
    chargePoints =
      TestBed.inject(StationDetailsMapper).stationDetailsDtoToUi(
        stationDetailsDto(),
      ).chargingPoints;
    fixture = TestBed.createComponent(StationDetailsChargePoints);
    await render(chargePoints);
  });

  async function render(value: readonly ChargePoint[]): Promise<void> {
    fixture.componentRef.setInput('chargePoints', value);
    await fixture.whenStable();
  }

  function element(): HTMLElement {
    return fixture.nativeElement;
  }

  function text(): string {
    return element().textContent?.replace(/\s+/g, ' ') ?? '';
  }

  async function pressedStates(): Promise<(string | null | undefined)[]> {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return Array.from(element().querySelectorAll('.charge-point__favorite'), (button) =>
      button.shadowRoot?.querySelector('button')?.getAttribute('aria-pressed'),
    );
  }

  it('shows every charge point with its status and details', () => {
    expect(text()).toContain('Charge points (2)');
    expect(text()).toContain('Zaptec Go');
    expect(text()).toContain('Preparing');
    expect(text()).toContain('Aura 1');
    expect(text()).toContain('Code V10D');
  });

  it('shows an empty state when the station has no charge points', async () => {
    await render([]);

    expect(text()).toContain('Charge points (0)');
    expect(text()).toContain('No charge points are reported for this station.');
    expect(element().querySelector('.charge-point')).toBeNull();
  });

  it('flags charge points that are inactive or closed', async () => {
    await render([{ ...chargePoints[0], isActive: false, isOpen: false }]);

    const flags = element().querySelector('.charge-point__flags')?.textContent;

    expect(flags).toContain('Inactive');
    expect(flags).toContain('Closed');
  });

  it('marks the favorite charge points', async () => {
    fixture.componentRef.setInput('favoriteIds', new Set([chargePoints[0].chargePointId]));

    expect(await pressedStates()).toEqual(['true', 'false']);
  });

  it('asks to toggle the charge point that was pressed', () => {
    const toggled = jasmine.createSpy('toggled');
    fixture.componentInstance.favoriteToggled.subscribe(toggled);

    element().querySelectorAll<HTMLElement>('.charge-point__favorite')[1].click();

    expect(toggled).toHaveBeenCalledOnceWith(chargePoints[1]);
  });
});
