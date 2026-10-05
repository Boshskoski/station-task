import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { OPENING_FILTER_OPTIONS } from '@features/filters/constants/station-filter-options.const';
import { OpeningFilter } from '@features/filters/enums/opening-filter.enum';
import { FilterGroup } from './filter-group';

describe('FilterGroup', () => {
  let fixture: ComponentFixture<FilterGroup<OpeningFilter>>;
  let changes: (readonly OpeningFilter[])[];

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular({})] });
    fixture = TestBed.createComponent<FilterGroup<OpeningFilter>>(FilterGroup);
    fixture.componentRef.setInput('heading', 'Opening');
    fixture.componentRef.setInput('options', OPENING_FILTER_OPTIONS);
    fixture.componentRef.setInput('selected', [OpeningFilter.Closed]);
    changes = [];
    fixture.componentInstance.selected.subscribe((selected) => changes.push(selected));
    await fixture.whenStable();
  });

  function checkboxes(): HTMLIonCheckboxElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('ion-checkbox'));
  }

  function toggle(index: number, checked: boolean): void {
    const checkbox = checkboxes()[index];
    checkbox.checked = checked;
    checkbox.dispatchEvent(new CustomEvent('ionChange', { detail: { checked } }));
  }

  it('renders a labelled list with one checkbox per option', () => {
    const list: HTMLElement = fixture.nativeElement.querySelector('ion-list');

    expect(list.getAttribute('aria-label')).toBe('Opening');
    expect(list.querySelector('ion-list-header')?.textContent?.trim()).toBe('Opening');
    expect(checkboxes().map((checkbox) => checkbox.textContent?.trim())).toEqual([
      'Open',
      'Closed',
    ]);
  });

  it('checks the selected options', () => {
    expect(checkboxes().map((checkbox) => checkbox.checked)).toEqual([false, true]);
  });

  it('adds a checked option to the selection', () => {
    toggle(0, true);

    expect(changes).toEqual([[OpeningFilter.Closed, OpeningFilter.Open]]);
  });

  it('removes an unchecked option from the selection', () => {
    toggle(1, false);

    expect(changes).toEqual([[]]);
  });
});
