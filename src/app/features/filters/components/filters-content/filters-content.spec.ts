import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { of } from 'rxjs';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { Station } from '@core/models/ui/station/station.ui';
import { StationMapper } from '@core/services/station.mapper';
import { StationsApiService } from '@core/services/stations-api.service';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { FiltersStore } from '@features/filters/store/filters.store';
import { filterStationDtos, toggleCheckbox } from '@features/filters/testing/filters.fixtures';
import { FiltersContent } from './filters-content';

describe('FiltersContent', () => {
  let fixture: ComponentFixture<FiltersContent>;
  let store: FiltersStore;
  let stations: readonly Station[];

  async function setup(dtos = filterStationDtos()): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({}),
        { provide: StationsApiService, useValue: { getStations: () => of(stations) } },
      ],
    });
    stations = TestBed.inject(StationMapper).stationsDtoToUi(dtos);
    store = TestBed.inject(FiltersStore);
    fixture = TestBed.createComponent(FiltersContent);
    await fixture.whenStable();
  }

  afterEach(() => localStorage.removeItem('stations.filters.v1'));

  function element(): HTMLElement {
    return fixture.nativeElement;
  }

  async function toggle(label: string, checked: boolean): Promise<void> {
    toggleCheckbox(element(), label, checked);
    await fixture.whenStable();
  }

  it('lists the filter groups with the connector types of the loaded stations', async () => {
    await setup();

    expect(
      Array.from(element().querySelectorAll('ion-list-header')).map((header) =>
        header.textContent?.trim(),
      ),
    ).toEqual(['Availability', 'Opening', 'Connector type']);
    expect(
      Array.from(element().querySelectorAll('ion-checkbox')).map((checkbox) =>
        checkbox.textContent?.trim(),
      ),
    ).toEqual(['Has free chargers', 'No free chargers', 'Open', 'Closed', 'Type - 2', 'CCS2']);
  });

  it('applies every checked option to the store at once', async () => {
    await setup();

    await toggle('No free chargers', true);

    expect(store.filters().availability).toEqual([AvailabilityFilter.Unavailable]);

    await toggle('CCS2', true);

    expect(store.filters().connectorTypes).toEqual([CPConnectorTypeID.CCS2]);

    await toggle('No free chargers', false);

    expect(store.filters().availability).toEqual([]);
    expect(store.filters().connectorTypes).toEqual([CPConnectorTypeID.CCS2]);
  });

  it('checks the options of the current filters', async () => {
    await setup();
    store.setFilters({ availability: [], opening: [], connectorTypes: [CPConnectorTypeID.CCS2] });
    await fixture.whenStable();

    expect(
      Array.from(element().querySelectorAll('ion-checkbox')).map((checkbox) => checkbox.checked),
    ).toEqual([false, false, false, false, false, true]);
  });

  it('hides the connector type group while no stations are loaded', async () => {
    await setup([]);

    expect(
      Array.from(element().querySelectorAll('ion-list-header')).map((header) =>
        header.textContent?.trim(),
      ),
    ).toEqual(['Availability', 'Opening']);
  });
});
