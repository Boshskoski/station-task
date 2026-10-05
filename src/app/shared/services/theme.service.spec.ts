import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const root = document.documentElement;

  afterEach(() => {
    root.classList.remove('ion-palette-dark');
    root.style.removeProperty('color-scheme');
    localStorage.removeItem('stations.theme.v1');
  });

  it('starts from the palette class already set on the document', () => {
    root.classList.add('ion-palette-dark');

    expect(TestBed.inject(ThemeService).isDark()).toBeTrue();
  });

  it('toggles the palette class, the color scheme and the stored choice', () => {
    root.classList.add('ion-palette-dark');
    const theme = TestBed.inject(ThemeService);

    theme.toggle();

    expect(theme.isDark()).toBeFalse();
    expect(root.classList.contains('ion-palette-dark')).toBeFalse();
    expect(root.style.colorScheme).toBe('light');
    expect(localStorage.getItem('stations.theme.v1')).toBe('"light"');

    theme.toggle();

    expect(theme.isDark()).toBeTrue();
    expect(root.classList.contains('ion-palette-dark')).toBeTrue();
    expect(localStorage.getItem('stations.theme.v1')).toBe('"dark"');
  });
});
