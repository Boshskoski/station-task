import { TestBed } from '@angular/core/testing';
import { EMPTY_STATION_FILTERS } from '@features/filters/constants/empty-station-filters.const';
import { AvailabilityFilter } from '@features/filters/enums/availability-filter.enum';
import { OpeningFilter } from '@features/filters/enums/opening-filter.enum';
import { FiltersStore } from './filters.store';

describe('FiltersStore', () => {
  const filtersKey = 'stations.filters.v1';

  afterEach(() => localStorage.removeItem(filtersKey));

  function setup(): FiltersStore {
    return TestBed.inject(FiltersStore);
  }

  it('starts with no filter selected', () => {
    const store = setup();

    expect(store.filters()).toEqual(EMPTY_STATION_FILTERS);
    expect(store.activeFilterCount()).toBe(0);
  });

  it('counts and saves every filter change', () => {
    const store = setup();

    store.setFilters({ ...EMPTY_STATION_FILTERS, availability: [AvailabilityFilter.Unavailable] });

    expect(store.activeFilterCount()).toBe(1);
    expect(JSON.parse(localStorage.getItem(filtersKey) ?? 'null')).toEqual(store.filters());

    store.clearFilters();

    expect(store.filters()).toEqual(EMPTY_STATION_FILTERS);
    expect(JSON.parse(localStorage.getItem(filtersKey) ?? 'null')).toEqual(EMPTY_STATION_FILTERS);
  });

  it('changes one filter group and keeps the others', () => {
    const store = setup();
    store.setFilters({ ...EMPTY_STATION_FILTERS, opening: [OpeningFilter.Open] });

    store.setFilter('availability', [AvailabilityFilter.Available]);

    expect(store.filters()).toEqual({
      ...EMPTY_STATION_FILTERS,
      availability: [AvailabilityFilter.Available],
      opening: [OpeningFilter.Open],
    });
    expect(JSON.parse(localStorage.getItem(filtersKey) ?? 'null')).toEqual(store.filters());
  });

  it('shows filters without saving them', () => {
    localStorage.setItem(filtersKey, JSON.stringify({ opening: ['open'] }));
    const store = setup();

    store.showFilters({ ...EMPTY_STATION_FILTERS, availability: [AvailabilityFilter.Available] });

    expect(store.filters()).toEqual({
      ...EMPTY_STATION_FILTERS,
      availability: [AvailabilityFilter.Available],
    });
    expect(JSON.parse(localStorage.getItem(filtersKey) ?? 'null')).toEqual({ opening: ['open'] });
  });

  it('starts with the filters saved in an earlier session', () => {
    localStorage.setItem(
      filtersKey,
      JSON.stringify({ availability: ['available'], opening: ['open', 'unknown'] }),
    );
    const store = setup();

    expect(store.filters()).toEqual({
      availability: [AvailabilityFilter.Available],
      opening: [OpeningFilter.Open],
      connectorTypes: [],
    });
    expect(store.activeFilterCount()).toBe(2);
  });
});
