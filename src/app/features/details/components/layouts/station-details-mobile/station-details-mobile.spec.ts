import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { stationDto } from '@core/testing/station.fixtures';
import { StationDetails } from '@features/details/models/ui/station-details.ui';
import { StationDetailsMapper } from '@features/details/services/station-details.mapper';
import { StationDetailsStore } from '@features/details/store/station-details.store';
import { stationDetailsDto } from '@features/details/testing/station-details.fixtures';
import { StationDetailsMobile } from './station-details-mobile';

describe('StationDetailsMobile', () => {
  let fixture: ComponentFixture<StationDetailsMobile>;
  let modal: HTMLIonModalElement;
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
        provideIonicAngular({ animated: false }),
        { provide: StationDetailsStore, useValue: { reload, clearSelection } },
      ],
    });
    const mapper = TestBed.inject(StationMapper);
    first = mapper.stationDtoToUi(stationDto({ PK_ChargingStationID: 1, Name: 'First' }));
    second = mapper.stationDtoToUi(stationDto({ PK_ChargingStationID: 2, Name: 'Second' }));
    details = TestBed.inject(StationDetailsMapper).stationDetailsDtoToUi(stationDetailsDto());
    fixture = TestBed.createComponent(StationDetailsMobile);
    await fixture.whenStable();
    modal = fixture.nativeElement.querySelector('ion-modal');
  });

  afterEach(() => modal.remove());

  function show(station: Station, status: 'resolved' | 'error' = 'resolved'): void {
    fixture.componentRef.setInput('view', {
      station,
      details: status === 'resolved' ? { ...details } : undefined,
      status,
    });
  }

  async function present(station: Station, status: 'resolved' | 'error' = 'resolved') {
    const presented = new Promise((resolve) =>
      modal.addEventListener('didPresent', resolve, { once: true }),
    );
    show(station, status);
    await presented;
    await fixture.whenStable();
  }

  function panelText(): string | null | undefined {
    return modal.querySelector('app-station-details-content')?.textContent;
  }

  function contentElement(): HTMLIonContentElement {
    return modal.querySelector('ion-content') as HTMLIonContentElement;
  }

  it('stays closed while there is no station to show', () => {
    expect(modal.isOpen).toBeFalse();
    expect(modal.querySelector('app-station-details-content')).toBeNull();
  });

  it('opens at the shared initial breakpoint and lets the map stay usable behind it', async () => {
    await present(first);

    expect(modal.isOpen).toBeTrue();
    expect(modal.breakpoints).toEqual([0, 0.4, 0.7, 1]);
    expect(modal.initialBreakpoint).toBe(0.4);
    expect(modal.backdropBreakpoint).toBe(0.7);
  });

  it('shows the station with its loaded details', async () => {
    await present(first);

    expect(panelText()).toContain('First');
    expect(panelText()).toContain('Charge points (2)');
  });

  it('shows the station with a notice and retries when the details cannot be loaded', async () => {
    await present(second, 'error');

    expect(panelText()).toContain('Second');
    expect(panelText()).toContain('Could not load the full details.');

    modal.querySelector<HTMLElement>('.notice ion-button')?.click();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('clears the selection when the sheet is dismissed', async () => {
    await present(first);

    await modal.dismiss();
    await fixture.whenStable();

    expect(clearSelection).toHaveBeenCalledTimes(1);
  });

  it('dismisses the sheet with the close button of the panel', async () => {
    await present(first);

    const dismissed = new Promise((resolve) =>
      modal.addEventListener('didDismiss', resolve, { once: true }),
    );
    modal.querySelector<HTMLElement>('.panel-close')?.click();
    await dismissed;

    expect(clearSelection).toHaveBeenCalledTimes(1);
  });

  it('passes the favorite toggles on', async () => {
    const stationToggled = jasmine.createSpy('stationToggled');
    const chargePointToggled = jasmine.createSpy('chargePointToggled');
    fixture.componentInstance.stationFavoriteToggled.subscribe(stationToggled);
    fixture.componentInstance.chargePointFavoriteToggled.subscribe(chargePointToggled);
    await present(first);

    modal.querySelector<HTMLElement>('.panel-favorite')?.click();
    modal.querySelector<HTMLElement>('.charge-point__favorite')?.click();

    const [point] = details.chargingPoints;
    expect(stationToggled).toHaveBeenCalledOnceWith(1);
    expect(chargePointToggled).toHaveBeenCalledOnceWith({
      chargingStationId: 1,
      chargePointId: point.chargePointId,
      name: point.name,
    });
  });

  it('scrolls back to the top when another station is shown', async () => {
    await present(first);
    const scrollToTop = spyOn(contentElement(), 'scrollToTop').and.resolveTo();

    show(second);
    await fixture.whenStable();

    expect(scrollToTop).toHaveBeenCalledTimes(1);
  });

  it('keeps the scroll position when the shown station gets fresh details', async () => {
    await present(first);
    const scrollToTop = spyOn(contentElement(), 'scrollToTop').and.resolveTo();

    show(first);
    await fixture.whenStable();

    expect(scrollToTop).not.toHaveBeenCalled();
  });
});
