import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { StationDetails } from '@features/details/models/ui/station-details.ui';
import { StationDetailsMapper } from '@features/details/services/station-details.mapper';
import { StationDetailsStore } from '@features/details/store/station-details.store';
import { stationDetailsDto } from '@features/details/testing/station-details.fixtures';
import { StationDetailsDesktop } from './station-details-desktop';

describe('StationDetailsDesktop', () => {
  let fixture: ComponentFixture<StationDetailsDesktop>;
  let first: Station;
  let second: Station;
  let details: StationDetails;
  let reload: jasmine.Spy;
  let clearSelection: jasmine.Spy;

  beforeEach(async () => {
    reload = jasmine.createSpy('reload');
    clearSelection = jasmine.createSpy('clearSelection');
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({}),
        { provide: StationDetailsStore, useValue: { reload, clearSelection } },
      ],
    });
    const mapper = TestBed.inject(StationMapper);
    first = mapper.stationDtoToUi(stationDto({ PK_ChargingStationID: 1, Name: 'First' }));
    second = mapper.stationDtoToUi(stationDto({ PK_ChargingStationID: 2, Name: 'Second' }));
    details = TestBed.inject(StationDetailsMapper).stationDetailsDtoToUi(stationDetailsDto());
    fixture = TestBed.createComponent(StationDetailsDesktop);
    await fixture.whenStable();
  });

  function element(): HTMLElement {
    return fixture.nativeElement;
  }

  async function show(station: Station, status: 'resolved' | 'error' = 'resolved'): Promise<void> {
    fixture.componentRef.setInput('view', {
      station,
      details: status === 'resolved' ? { ...details } : undefined,
      status,
    });
    await fixture.whenStable();
  }

  function scroller(): HTMLElement {
    const aside = element().querySelector('aside') as HTMLElement;
    aside.style.maxHeight = '100px';
    return aside;
  }

  async function pressedStates(selector: string): Promise<(string | null | undefined)[]> {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return Array.from(element().querySelectorAll(selector), (button) =>
      button.shadowRoot?.querySelector('button')?.getAttribute('aria-pressed'),
    );
  }

  it('takes its size from the shared details layout', () => {
    expect(element().style.getPropertyValue('--side-panel-width')).toBe('400px');
    expect(element().style.getPropertyValue('--side-panel-margin')).toBe('16px');
  });

  it('renders nothing while there is no station to show', () => {
    expect(element().querySelector('aside')).toBeNull();
  });

  it('shows the station with its loaded details', async () => {
    await show(first);

    expect(element().querySelector('aside')?.getAttribute('aria-label')).toBe('Station details');
    expect(element().textContent).toContain('First');
    expect(element().textContent).toContain('Charge points (2)');
  });

  it('clears the selection when the close button is pressed', async () => {
    await show(first);

    element().querySelector<HTMLElement>('.panel-close')?.click();

    expect(clearSelection).toHaveBeenCalledTimes(1);
  });

  it('retries the details request from the error notice', async () => {
    await show(first, 'error');

    element().querySelector<HTMLElement>('.notice ion-button')?.click();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('shows the favorites it is given and passes the toggles on', async () => {
    const stationToggled = jasmine.createSpy('stationToggled');
    const chargePointToggled = jasmine.createSpy('chargePointToggled');
    fixture.componentInstance.stationFavoriteToggled.subscribe(stationToggled);
    fixture.componentInstance.chargePointFavoriteToggled.subscribe(chargePointToggled);
    const [point] = details.chargingPoints;
    fixture.componentRef.setInput('favoriteStationIdSet', new Set([1]));
    fixture.componentRef.setInput('favoriteChargePoints', [
      { chargingStationId: 1, chargePointId: point.chargePointId, name: point.name },
    ]);
    await show(first);

    expect(await pressedStates('.panel-favorite')).toEqual(['true']);
    expect((await pressedStates('.charge-point__favorite'))[0]).toBe('true');

    element().querySelector<HTMLElement>('.panel-favorite')?.click();
    element().querySelector<HTMLElement>('.charge-point__favorite')?.click();

    expect(stationToggled).toHaveBeenCalledOnceWith(1);
    expect(chargePointToggled).toHaveBeenCalledOnceWith({
      chargingStationId: 1,
      chargePointId: point.chargePointId,
      name: point.name,
    });
  });

  it('scrolls back to the top when another station is shown', async () => {
    await show(first);
    scroller().scrollTop = 100;

    await show(second);

    expect(scroller().scrollTop).toBe(0);
  });

  it('keeps the scroll position when the shown station gets fresh details', async () => {
    await show(first);
    scroller().scrollTop = 100;

    await show(first);

    expect(scroller().scrollTop).toBe(100);
  });
});
