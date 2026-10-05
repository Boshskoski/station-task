import { ResourceStatus } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { MapStatus } from './map-status';

describe('MapStatus', () => {
  let fixture: ComponentFixture<MapStatus>;

  async function show(
    stationsStatus: ResourceStatus,
    { stationCount = 0, matchCount = undefined as number | undefined, detailsLoading = false } = {},
  ): Promise<void> {
    fixture.componentRef.setInput('stationsStatus', stationsStatus);
    fixture.componentRef.setInput('stationCount', stationCount);
    fixture.componentRef.setInput('matchCount', matchCount ?? stationCount);
    fixture.componentRef.setInput('detailsLoading', detailsLoading);
    await fixture.whenStable();
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent?.trim() ?? '';
  }

  function clickButton(): void {
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('ion-button')?.click();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular({})] });
    fixture = TestBed.createComponent(MapStatus);
  });

  it('shows a loading status while stations load', async () => {
    await show('loading');

    expect(text()).toBe('Loading stations…');
  });

  it('shows the loading status again during a retry', async () => {
    await show('reloading');

    expect(text()).toBe('Loading stations…');
  });

  it('shows an error with a retry action', async () => {
    const retry = jasmine.createSpy('retry');
    fixture.componentInstance.retry.subscribe(retry);
    await show('error');

    expect(text()).toContain('Could not load stations.');
    clickButton();
    expect(retry).toHaveBeenCalled();
  });

  it('shows an empty state when no stations are loaded', async () => {
    await show('resolved');

    expect(text()).toBe('No stations to show.');
  });

  it('tells when the filters match no station and clears them on request', async () => {
    const clearFilters = jasmine.createSpy('clearFilters');
    fixture.componentInstance.clearFilters.subscribe(clearFilters);
    await show('resolved', { stationCount: 3, matchCount: 0 });

    expect(text()).toContain('No stations match the filters.');
    clickButton();
    expect(clearFilters).toHaveBeenCalled();
  });

  it('shows a loading status while the details of a clicked station load', async () => {
    await show('resolved', { stationCount: 3, detailsLoading: true });

    expect(text()).toBe('Loading station details…');
  });

  it('shows nothing once stations are loaded and match', async () => {
    await show('resolved', { stationCount: 3 });

    expect(text()).toBe('');
  });
});
