import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideIonicAngular } from '@ionic/angular';
import { ADDRESS_SEARCH_CONFIG } from '@features/search/constants/address-search-config.const';
import { AddressSearchStore } from '@features/search/store/address-search.store';
import { AddressSearch } from './address-search';

describe('AddressSearch', () => {
  const store = {
    query: signal(''),
    search: jasmine.createSpy('search'),
    submit: jasmine.createSpy('submit'),
    clear: jasmine.createSpy('clear'),
    reopen: jasmine.createSpy('reopen'),
    closePanel: jasmine.createSpy('closePanel'),
  };
  let fixture: ComponentFixture<AddressSearch>;

  beforeEach(async () => {
    [store.search, store.submit, store.clear, store.reopen, store.closePanel].forEach((spy) =>
      spy.calls.reset(),
    );
    TestBed.configureTestingModule({
      providers: [provideIonicAngular({}), { provide: AddressSearchStore, useValue: store }],
    });
    fixture = TestBed.createComponent(AddressSearch);
    await fixture.whenStable();
  });

  function searchbar() {
    return fixture.debugElement.query(By.css('ion-searchbar'));
  }

  function input(value: string | null, event?: Event): void {
    (searchbar().nativeElement as HTMLElement).dispatchEvent(
      new CustomEvent('ionInput', { detail: { value, event } }),
    );
  }

  function at<T extends Event>(event: T, timeStamp: number): T {
    Object.defineProperty(event, 'timeStamp', { value: timeStamp });
    return event;
  }

  function pressEnter(text: string, timeStamp = 100): void {
    const element: HTMLIonSearchbarElement = searchbar().nativeElement;
    element.value = text;
    element.dispatchEvent(at(new KeyboardEvent('keydown', { key: 'Enter' }), timeStamp));
  }

  it('keeps the padding of its own toolbar row by default', () => {
    expect(fixture.nativeElement.classList).not.toContain('address-search--compact');
  });

  it('drops the toolbar row padding when it is compact', async () => {
    fixture.componentRef.setInput('compact', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).toContain('address-search--compact');
  });

  it('sends the typed text to the store', () => {
    input('oslo');

    expect(store.search).toHaveBeenCalledOnceWith('oslo');
  });

  it('treats a cleared value as an empty query', () => {
    input(null);

    expect(store.search).toHaveBeenCalledOnceWith('');
  });

  it('clears the search with the searchbar clear button', () => {
    searchbar().triggerEventHandler('ionClear');

    expect(store.clear).toHaveBeenCalled();
  });

  it('submits the current text on Enter, without waiting for the debounce', () => {
    pressEnter('bergen');

    expect(store.submit).toHaveBeenCalledOnceWith('bergen');
  });

  it('ignores the debounced input of text that Enter already submitted', () => {
    pressEnter('bergen', 100);

    input('bergen', at(new Event('input'), 50));
    expect(store.search).not.toHaveBeenCalled();

    input('bergen 5', at(new Event('input'), 150));
    expect(store.search).toHaveBeenCalledOnceWith('bergen 5');
  });

  it('asks to reopen the results when the field is clicked', () => {
    searchbar().triggerEventHandler('click');

    expect(store.reopen).toHaveBeenCalled();
  });

  it('triggers the results popover from an element under the searchbar, not from the searchbar', () => {
    const trigger = fixture.nativeElement.querySelector(`#${ADDRESS_SEARCH_CONFIG.triggerId}`);

    expect(trigger).not.toBeNull();
    expect(trigger.previousElementSibling).toBe(searchbar().nativeElement);
    expect(searchbar().nativeElement.id).toBe(ADDRESS_SEARCH_CONFIG.searchbarId);
  });

  it('closes the results on Escape', () => {
    searchbar().triggerEventHandler('keydown.escape');

    expect(store.closePanel).toHaveBeenCalled();
  });
});
