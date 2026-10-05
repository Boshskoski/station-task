import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { StationDetailsActions } from './station-details-actions';

describe('StationDetailsActions', () => {
  let fixture: ComponentFixture<StationDetailsActions>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular({})] });
    fixture = TestBed.createComponent(StationDetailsActions);
    fixture.componentRef.setInput('favorite', false);
    await fixture.whenStable();
  });

  function button(selector: string): HTMLElement {
    return fixture.nativeElement.querySelector(selector);
  }

  async function pressed(): Promise<string | null | undefined> {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return button('.panel-favorite')
      .shadowRoot?.querySelector('button')
      ?.getAttribute('aria-pressed');
  }

  it('shows whether the station is a favorite', async () => {
    expect(await pressed()).toBe('false');

    fixture.componentRef.setInput('favorite', true);
    await fixture.whenStable();

    expect(await pressed()).toBe('true');
  });

  it('asks to toggle the favorite', () => {
    const toggled = jasmine.createSpy('toggled');
    fixture.componentInstance.favoriteToggled.subscribe(toggled);

    button('.panel-favorite').click();

    expect(toggled).toHaveBeenCalledTimes(1);
  });

  it('asks to close when the close button is pressed', () => {
    const closed = jasmine.createSpy('closed');
    fixture.componentInstance.closed.subscribe(closed);

    button('.panel-close').click();

    expect(closed).toHaveBeenCalledTimes(1);
  });
});
