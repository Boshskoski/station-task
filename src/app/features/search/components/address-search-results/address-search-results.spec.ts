import { ResourceStatus, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { ADDRESS_SEARCH_CONFIG } from '@features/search/constants/address-search-config.const';
import { GeocodedPlace } from '@features/search/models/ui/geocoded-place.ui';
import { AddressSearchStore } from '@features/search/store/address-search.store';
import { geocodedPlace } from '@features/search/testing/search.fixtures';
import { ViewportService } from '@shared/services/viewport.service';
import { AddressSearchResults } from './address-search-results';

describe('AddressSearchResults', () => {
  const status = signal<ResourceStatus>('loading');
  const results = signal<readonly GeocodedPlace[]>([]);
  const panelOpen = signal(false);
  const visibleBottom = signal(900);
  const select = jasmine.createSpy('select');
  const retry = jasmine.createSpy('retry');
  const closePanel = jasmine.createSpy('closePanel');
  let fixture: ComponentFixture<AddressSearchResults>;
  let popover: HTMLIonPopoverElement;
  let searchbar: HTMLElement;
  let trigger: HTMLElement;
  let searchInput: HTMLInputElement;

  beforeEach(async () => {
    status.set('loading');
    results.set([]);
    panelOpen.set(false);
    visibleBottom.set(900);
    [select, retry, closePanel].forEach((spy) => spy.calls.reset());
    searchbar = document.createElement('div');
    searchbar.id = ADDRESS_SEARCH_CONFIG.searchbarId;
    searchbar.style.cssText = 'position: fixed; top: 0; left: 0; width: 300px; height: 50px';
    searchInput = document.createElement('input');
    searchbar.appendChild(searchInput);
    trigger = document.createElement('div');
    trigger.id = ADDRESS_SEARCH_CONFIG.triggerId;
    trigger.style.cssText = 'position: fixed; top: 50px; left: 0; width: 300px; height: 0';
    document.body.append(searchbar, trigger);
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({ animated: false }),
        { provide: ViewportService, useValue: { visibleBottom } },
        {
          provide: AddressSearchStore,
          useValue: { status, results, panelOpen, select, retry, closePanel },
        },
      ],
    });
    fixture = TestBed.createComponent(AddressSearchResults);
    await fixture.whenStable();
    popover = fixture.nativeElement.querySelector('ion-popover');
    searchInput.focus();
    const presented = new Promise((resolve) =>
      popover.addEventListener('didPresent', resolve, { once: true }),
    );
    panelOpen.set(true);
    await presented;
    await fixture.whenStable();
  });

  afterEach(() => {
    popover.remove();
    searchbar.remove();
    trigger.remove();
  });

  function text(): string {
    return popover.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  async function show(next: ResourceStatus): Promise<void> {
    status.set(next);
    await fixture.whenStable();
  }

  it('opens under the searchbar without dimming the map', () => {
    expect(popover.trigger).toBe(ADDRESS_SEARCH_CONFIG.triggerId);
    expect(popover.side).toBe('bottom');
    expect(popover.showBackdrop).toBeFalse();
    expect(popover.focusTrap).toBeFalse();
  });

  it('tells assistive technology that the page behind it is still usable', () => {
    expect(popover.getAttribute('aria-modal')).toBe('false');
  });

  it('uses at most 360px of height', () => {
    expect(popover.style.getPropertyValue('--max-height')).toBe('360px');
  });

  it('fits in the room the on-screen keyboard leaves under the searchbar', async () => {
    visibleBottom.set(300);
    await fixture.whenStable();

    expect(popover.style.getPropertyValue('--max-height')).toBe('242px');
  });

  it('keeps room for a few results when the keyboard leaves almost none', async () => {
    visibleBottom.set(100);
    await fixture.whenStable();

    expect(popover.style.getPropertyValue('--max-height')).toBe('120px');
  });

  it('keeps the cursor in the searchbar when it opens', () => {
    expect(document.activeElement).toBe(searchInput);
  });

  it('shows a searching message while the request runs', () => {
    expect(text()).toContain('Searching…');
  });

  it('shows an empty message when no address matches', async () => {
    await show('resolved');

    expect(text()).toContain('No address found.');
  });

  it('shows an error with a retry action', async () => {
    await show('error');

    expect(text()).toContain('Could not search addresses.');
    popover.querySelector<HTMLElement>('ion-button')?.click();
    expect(retry).toHaveBeenCalled();
  });

  it('lists the addresses and selects the one that is clicked', async () => {
    results.set([
      geocodedPlace(),
      geocodedPlace({ placeId: 2, name: 'Storgata', displayName: 'Storgata, Oslo' }),
    ]);
    await show('resolved');

    const items = popover.querySelectorAll<HTMLElement>('ion-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Karl Johans gate');

    items[1].click();
    expect(select).toHaveBeenCalledOnceWith(results()[1]);
  });

  it('does not open on a click on the searchbar while the store keeps it closed', async () => {
    const dismissed = new Promise((resolve) =>
      popover.addEventListener('didDismiss', resolve, { once: true }),
    );
    panelOpen.set(false);
    await dismissed;

    searchbar.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(popover.classList).toContain('overlay-hidden');
  });

  it('reports the closed state when the popover is dismissed', async () => {
    await popover.dismiss();

    expect(closePanel).toHaveBeenCalled();
  });

  it('closes when the window is resized', async () => {
    const dismissed = new Promise((resolve) =>
      popover.addEventListener('didDismiss', resolve, { once: true }),
    );

    window.dispatchEvent(new Event('resize'));
    await dismissed;

    expect(closePanel).toHaveBeenCalled();
  });
});
