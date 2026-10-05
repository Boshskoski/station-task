import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { of } from 'rxjs';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { StationsApiService } from '@core/services/stations-api.service';
import { FILTERS_TRIGGER_ID } from '@features/filters/constants/filters-trigger-id.const';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { FiltersStore } from '@features/filters/store/filters.store';
import { filterStationDtos, toggleCheckbox } from '@features/filters/testing/filters.fixtures';
import { FiltersDesktop } from './filters-desktop';

describe('FiltersDesktop', () => {
  let fixture: ComponentFixture<FiltersDesktop>;
  let popover: HTMLIonPopoverElement;
  let trigger: HTMLButtonElement;
  let store: FiltersStore;
  let stations: readonly Station[];

  beforeEach(async () => {
    trigger = document.createElement('button');
    trigger.id = FILTERS_TRIGGER_ID;
    document.body.appendChild(trigger);
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({ animated: false }),
        { provide: StationsApiService, useValue: { getStations: () => of(stations) } },
      ],
    });
    stations = TestBed.inject(StationMapper).stationsDtoToUi(filterStationDtos());
    store = TestBed.inject(FiltersStore);
    fixture = TestBed.createComponent(FiltersDesktop);
    await fixture.whenStable();
    fixture.componentRef.setInput('matchCount', 3);
    popover = fixture.nativeElement.querySelector('ion-popover');
    const presented = new Promise((resolve) =>
      popover.addEventListener('didPresent', resolve, { once: true }),
    );
    fixture.componentRef.setInput('open', true);
    await presented;
    await fixture.whenStable();
  });

  afterEach(() => {
    popover.remove();
    trigger.remove();
    localStorage.removeItem('stations.filters.v1');
  });

  function text(selector: string): string {
    return popover.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  async function showMatches(count: number): Promise<void> {
    fixture.componentRef.setInput('matchCount', count);
    await fixture.whenStable();
  }

  async function toggle(label: string, checked: boolean): Promise<void> {
    toggleCheckbox(popover, label, checked);
    await fixture.whenStable();
  }

  it('opens under the filters button without dimming the map', () => {
    expect(popover.trigger).toBe(FILTERS_TRIGGER_ID);
    expect(popover.side).toBe('bottom');
    expect(popover.alignment).toBe('end');
    expect(popover.showBackdrop).toBeFalse();
    expect(popover.querySelectorAll('app-filters-content ion-list').length).toBe(3);
  });

  it('keeps the map usable while it is open', () => {
    const content = popover.shadowRoot?.querySelector('[part~="content"]');
    const backdrop = popover.shadowRoot?.querySelector('[part~="backdrop"]');

    expect(popover.focusTrap).toBeFalse();
    expect(getComputedStyle(popover).pointerEvents).toBe('none');
    expect(backdrop && getComputedStyle(backdrop).pointerEvents).toBe('none');
    expect(content && getComputedStyle(content).pointerEvents).toBe('auto');
  });

  it('closes with its close button', async () => {
    const dismissed = new Promise((resolve) =>
      popover.addEventListener('didDismiss', resolve, { once: true }),
    );

    popover.querySelector<HTMLElement>('.filters-close')?.click();
    await dismissed;
    await fixture.whenStable();

    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('shows how many of the loaded stations the filters leave on the map', async () => {
    expect(text('.filters-count')).toBe('3 of 3 stations shown');

    await showMatches(1);

    expect(text('.filters-count')).toBe('1 of 3 stations shown');
  });

  it('tells when no station matches', async () => {
    await showMatches(0);

    expect(text('.filters-count')).toBe('No stations match');
  });

  it('changes the filters when an option is checked', async () => {
    await toggle('No free chargers', true);
    await toggle('CCS2', true);

    expect(store.filters().availability).toEqual([AvailabilityFilter.Unavailable]);
    expect(store.filters().connectorTypes).toEqual([CPConnectorTypeID.CCS2]);
  });

  it('clears all filters', async () => {
    const clear = popover.querySelector('.filters-clear') as HTMLIonButtonElement;
    expect(clear.disabled).toBeTrue();

    await toggle('Closed', true);
    expect(clear.disabled).toBeFalse();

    clear.click();
    await fixture.whenStable();

    expect(store.activeFilterCount()).toBe(0);
  });

  it('closes when the window is resized', async () => {
    const dismissed = new Promise((resolve) =>
      popover.addEventListener('didDismiss', resolve, { once: true }),
    );

    window.dispatchEvent(new Event('resize'));
    await dismissed;
    await fixture.whenStable();

    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('reports the closed state when the popover is dismissed', async () => {
    await popover.dismiss();
    await fixture.whenStable();

    expect(fixture.componentInstance.open()).toBeFalse();
  });
});
