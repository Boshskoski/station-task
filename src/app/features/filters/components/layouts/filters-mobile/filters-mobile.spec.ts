import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { of } from 'rxjs';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { StationsApiService } from '@core/services/stations-api.service';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { FiltersStore } from '@features/filters/store/filters.store';
import { filterStationDtos, toggleCheckbox } from '@features/filters/testing/filters.fixtures';
import { FiltersMobile } from './filters-mobile';

describe('FiltersMobile', () => {
  let fixture: ComponentFixture<FiltersMobile>;
  let modal: HTMLIonModalElement;
  let store: FiltersStore;
  let stations: readonly Station[];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({ animated: false }),
        { provide: StationsApiService, useValue: { getStations: () => of(stations) } },
      ],
    });
    stations = TestBed.inject(StationMapper).stationsDtoToUi(filterStationDtos());
    store = TestBed.inject(FiltersStore);
    fixture = TestBed.createComponent(FiltersMobile);
    await fixture.whenStable();
    fixture.componentRef.setInput('matchCount', 3);
    modal = fixture.nativeElement.querySelector('ion-modal');
    const presented = new Promise((resolve) =>
      modal.addEventListener('didPresent', resolve, { once: true }),
    );
    fixture.componentRef.setInput('open', true);
    await presented;
    await fixture.whenStable();
  });

  afterEach(() => {
    modal.remove();
    localStorage.removeItem('stations.filters.v1');
  });

  function text(selector: string): string {
    return modal.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  async function showMatches(count: number): Promise<void> {
    fixture.componentRef.setInput('matchCount', count);
    await fixture.whenStable();
  }

  async function toggle(label: string, checked: boolean): Promise<void> {
    toggleCheckbox(modal, label, checked);
    await fixture.whenStable();
  }

  it('opens as a sheet that fits its content', () => {
    expect(modal.breakpoints).toEqual([0, 1]);
    expect(modal.initialBreakpoint).toBe(1);
    expect(
      modal.querySelectorAll('.auto-height-sheet__body app-filters-content ion-list').length,
    ).toBe(3);
    expect(text('.filters-show')).toBe('Show 3 stations');
  });

  it('shows how many stations match', async () => {
    await showMatches(1);

    expect(text('.filters-show')).toBe('Show 1 station');
  });

  it('tells when no station matches', async () => {
    await showMatches(0);

    expect(text('.filters-show')).toBe('No matching stations');
  });

  it('changes the filters when an option is checked', async () => {
    await toggle('No free chargers', true);

    expect(store.filters().availability).toEqual([AvailabilityFilter.Unavailable]);
  });

  it('clears all filters', async () => {
    const clear = modal.querySelector('.filters-clear') as HTMLIonButtonElement;
    expect(clear.disabled).toBeTrue();

    await toggle('Open', true);
    expect(clear.disabled).toBeFalse();

    clear.click();
    await fixture.whenStable();

    expect(store.activeFilterCount()).toBe(0);
  });

  it('reports the closed state when the sheet is dismissed', async () => {
    await modal.dismiss();
    await fixture.whenStable();

    expect(fixture.componentInstance.open()).toBeFalse();
  });
});
