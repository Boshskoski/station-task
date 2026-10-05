import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonToolbar, provideIonicAngular } from '@ionic/angular';
import { ThemeService } from '@shared/services/theme.service';
import { PageHeader } from './page-header';

@Component({
  imports: [PageHeader, IonToolbar],
  template: `
    <app-page-header heading="Stations">
      <span headerContent class="test-content">content</span>
      <button headerActions class="test-action">action</button>
      <ion-toolbar class="test-row">row</ion-toolbar>
    </app-page-header>
  `,
})
class TestHost {}

describe('PageHeader', () => {
  const isDark = signal(true);
  const toggle = jasmine.createSpy('toggle');
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    isDark.set(true);
    toggle.calls.reset();
    TestBed.configureTestingModule({
      providers: [provideIonicAngular({}), { provide: ThemeService, useValue: { isDark, toggle } }],
    });
    fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
  });

  function element(): HTMLElement {
    return fixture.nativeElement;
  }

  function themeButton(): HTMLElement {
    return element().querySelector('.page-header__theme') as HTMLElement;
  }

  it('shows the heading as the toolbar title', () => {
    expect(element().querySelector('ion-title')?.textContent?.trim()).toBe('Stations');
  });

  it('puts the page content next to the title', () => {
    const content = element().querySelector('.page-header__content');

    expect(content?.querySelector('.test-content')).not.toBeNull();
  });

  it('puts the page actions before the theme button', () => {
    const buttons = element().querySelector('ion-buttons');
    const children = Array.from(buttons?.children ?? []);

    expect(children.map((child) => child.classList[0])).toEqual([
      'test-action',
      'page-header__theme',
    ]);
  });

  it('adds extra page rows below the main toolbar', () => {
    const toolbars = element().querySelectorAll('ion-header > ion-toolbar');

    expect(toolbars.length).toBe(2);
    expect(toolbars[1].classList).toContain('test-row');
  });

  it('toggles the theme and names the theme it switches to', async () => {
    expect(themeButton().getAttribute('aria-label')).toBe('Switch to light theme');
    expect(themeButton().querySelector<HTMLIonIconElement>('ion-icon')?.name).toBe('sunny');

    themeButton().click();
    isDark.set(false);
    await fixture.whenStable();

    expect(toggle).toHaveBeenCalledTimes(1);
    expect(themeButton().getAttribute('aria-label')).toBe('Switch to dark theme');
    expect(themeButton().querySelector<HTMLIonIconElement>('ion-icon')?.name).toBe('moon');
  });
});
