import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { FiltersStore } from '@features/filters/store/filters.store';
import { FiltersHeader } from './filters-header';

describe('FiltersHeader', () => {
  let fixture: ComponentFixture<FiltersHeader>;
  let store: FiltersStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular({ animated: false })] });
    store = TestBed.inject(FiltersStore);
    fixture = TestBed.createComponent(FiltersHeader);
    await fixture.whenStable();
  });

  afterEach(() => localStorage.removeItem('stations.filters.v1'));

  function clearButton(): HTMLIonButtonElement {
    return fixture.nativeElement.querySelector('.filters-clear');
  }

  it('names the dialog with the title id', () => {
    expect(fixture.nativeElement.querySelector('#filters-title').textContent.trim()).toBe(
      'Filters',
    );
  });

  it('disables Clear all while no filter is active', () => {
    expect(clearButton().disabled).toBeTrue();
  });

  it('clears the filters', async () => {
    store.setFilter('connectorTypes', [4]);
    await fixture.whenStable();
    expect(clearButton().disabled).toBeFalse();

    clearButton().click();

    expect(store.activeFilterCount()).toBe(0);
  });
});
