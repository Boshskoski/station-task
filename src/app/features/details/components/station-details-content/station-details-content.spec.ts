import { ResourceStatus } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { StationDetails } from '@features/details/models/ui/station-details.ui';
import { StationDetailsMapper } from '@features/details/services/station-details.mapper';
import { stationDetailsDto } from '@features/details/testing/station-details.fixtures';
import { StationDetailsContent } from './station-details-content';

describe('StationDetailsContent', () => {
  let fixture: ComponentFixture<StationDetailsContent>;
  let station: Station;
  let details: StationDetails;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular({})] });
    station = TestBed.inject(StationMapper).stationDtoToUi(stationDto());
    details = TestBed.inject(StationDetailsMapper).stationDetailsDtoToUi(stationDetailsDto());
    fixture = TestBed.createComponent(StationDetailsContent);
    await render('resolved');
  });

  async function render(status: ResourceStatus, value?: StationDetails): Promise<void> {
    fixture.componentRef.setInput('view', { station, details: value, status });
    await fixture.whenStable();
  }

  function element(): HTMLElement {
    return fixture.nativeElement;
  }

  function has(selector: string): boolean {
    return element().querySelector(selector) !== null;
  }

  async function pressedStates(selector: string): Promise<(string | null | undefined)[]> {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return Array.from(element().querySelectorAll(selector), (button) =>
      button.shadowRoot?.querySelector('button')?.getAttribute('aria-pressed'),
    );
  }

  it('shows the station from the list together with the details', async () => {
    await render('resolved', details);

    expect(has('app-station-details-actions')).toBeTrue();
    expect(has('app-station-details-header')).toBeTrue();
    expect(has('app-station-details-availability')).toBeTrue();
    expect(has('app-station-details-pricing')).toBeTrue();
    expect(has('app-station-details-charge-points')).toBeTrue();
    expect(has('app-station-details-support')).toBeTrue();
    expect(has('app-station-details-notice')).toBeFalse();
  });

  it('shows the basic station data and a retry notice when the details fail', async () => {
    const retry = jasmine.createSpy('retry');
    fixture.componentInstance.retry.subscribe(retry);
    await render('error');

    expect(has('app-station-details-header')).toBeTrue();
    expect(has('app-station-details-availability')).toBeTrue();
    expect(has('app-station-details-pricing')).toBeFalse();
    expect(has('app-station-details-charge-points')).toBeFalse();
    expect(has('app-station-details-support')).toBeFalse();
    element().querySelector<HTMLElement>('[role="alert"] ion-button')?.click();
    expect(retry).toHaveBeenCalled();
  });

  it('offers directions and the station favorite even when the details fail', async () => {
    await render('error');

    expect(has('.panel-directions')).toBeTrue();
    expect(has('.panel-favorite')).toBeTrue();
    expect(has('.charge-point__favorite')).toBeFalse();
  });

  it('shows whether the station is a favorite and asks to toggle it', async () => {
    const toggled = jasmine.createSpy('toggled');
    fixture.componentInstance.stationFavoriteToggled.subscribe(toggled);

    expect(await pressedStates('.panel-favorite')).toEqual(['false']);

    fixture.componentRef.setInput('favoriteStationIdSet', new Set([station.chargingStationId + 1]));
    await fixture.whenStable();
    expect(await pressedStates('.panel-favorite')).toEqual(['false']);

    fixture.componentRef.setInput('favoriteStationIdSet', new Set([station.chargingStationId]));
    await fixture.whenStable();
    expect(await pressedStates('.panel-favorite')).toEqual(['true']);

    element().querySelector<HTMLElement>('.panel-favorite')?.click();
    expect(toggled).toHaveBeenCalledOnceWith(station.chargingStationId);
  });

  it('marks the favorite charge points of this station only', async () => {
    fixture.componentRef.setInput('favoriteChargePoints', [
      { chargingStationId: station.chargingStationId, chargePointId: 1, name: 'x' },
      { chargingStationId: station.chargingStationId + 1, chargePointId: 2, name: 'y' },
    ]);
    await render('resolved', {
      ...details,
      chargingPoints: [
        { ...details.chargingPoints[0], chargePointId: 1 },
        { ...details.chargingPoints[1], chargePointId: 2 },
      ],
    });

    expect(await pressedStates('.charge-point__favorite')).toEqual(['true', 'false']);
  });

  it('asks to toggle a charge point with its station and name', async () => {
    const toggled = jasmine.createSpy('toggled');
    fixture.componentInstance.chargePointFavoriteToggled.subscribe(toggled);
    await render('resolved', details);

    element().querySelector<HTMLElement>('.charge-point__favorite')?.click();

    expect(toggled).toHaveBeenCalledOnceWith({
      chargingStationId: station.chargingStationId,
      chargePointId: details.chargingPoints[0].chargePointId,
      name: details.chargingPoints[0].name,
    });
  });

  it('asks to close when the close button is pressed', () => {
    const closed = jasmine.createSpy('closed');
    fixture.componentInstance.closed.subscribe(closed);
    element().querySelector<HTMLElement>('.panel-close')?.click();

    expect(closed).toHaveBeenCalled();
  });
});
