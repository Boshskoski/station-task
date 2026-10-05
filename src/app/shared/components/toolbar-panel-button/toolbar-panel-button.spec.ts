import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { funnel } from 'ionicons/icons';
import { ViewportService } from '@shared/services/viewport.service';
import { ToolbarPanelButton } from './toolbar-panel-button';

describe('ToolbarPanelButton', () => {
  const isWide = signal(true);
  let fixture: ComponentFixture<ToolbarPanelButton>;

  beforeEach(async () => {
    isWide.set(true);
    addIcons({ funnel });
    TestBed.configureTestingModule({
      providers: [provideIonicAngular({}), { provide: ViewportService, useValue: { isWide } }],
    });
    fixture = TestBed.createComponent(ToolbarPanelButton);
    fixture.componentRef.setInput('label', 'Filters');
    fixture.componentRef.setInput('icon', 'funnel');
    fixture.componentRef.setInput('triggerId', 'filters-trigger');
    fixture.componentRef.setInput('countLabel', 'active');
    fixture.componentRef.setInput('badgeColor', 'success');
    await fixture.whenStable();
  });

  function button(): HTMLElement {
    return fixture.nativeElement.querySelector('ion-button');
  }

  function badge(): HTMLIonBadgeElement | null {
    return fixture.nativeElement.querySelector('ion-badge');
  }

  function chevron(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.toolbar-panel-button__chevron');
  }

  async function setCount(count: number): Promise<void> {
    fixture.componentRef.setInput('count', count);
    await fixture.whenStable();
  }

  it('shows the icon, the label and a chevron without a badge while the count is 0', () => {
    expect(button().querySelector('ion-icon')?.getAttribute('name')).toBe('funnel');
    expect(button().textContent?.trim()).toBe('Filters');
    expect(button().getAttribute('aria-label')).toBe('Filters');
    expect(chevron()).not.toBeNull();
    expect(badge()).toBeNull();
  });

  it('is the collapsed trigger of its panel', async () => {
    await new Promise(requestAnimationFrame);

    expect(button().id).toBe('filters-trigger');
    expect(button().shadowRoot?.querySelector('button')?.getAttribute('aria-haspopup')).toBe(
      'dialog',
    );
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(chevron()?.classList).not.toContain('toolbar-panel-button__chevron--open');
  });

  it('marks the button as expanded while the panel is open', async () => {
    fixture.componentRef.setInput('expanded', true);
    await fixture.whenStable();

    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect(chevron()?.classList).toContain('toolbar-panel-button__chevron--open');
  });

  it('shows the count in a badge of the given colour and in the accessible name', async () => {
    await setCount(3);

    expect(badge()?.textContent?.trim()).toBe('3');
    expect(badge()?.color).toBe('success');
    expect(button().getAttribute('aria-label')).toBe('Filters, 3 active');
  });

  it('shows only the icon and the badge when the toolbar is narrow', async () => {
    isWide.set(false);
    await setCount(1);

    expect(button().querySelector('ion-icon')?.getAttribute('slot')).toBe('icon-only');
    expect(button().textContent?.trim()).toBe('1');
    expect(chevron()).toBeNull();
  });

  it('emits when pressed', () => {
    const pressed = jasmine.createSpy('pressed');
    fixture.componentInstance.pressed.subscribe(pressed);

    button().click();

    expect(pressed).toHaveBeenCalledTimes(1);
  });
});
