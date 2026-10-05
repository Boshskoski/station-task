import { TestBed } from '@angular/core/testing';
import { ThemeService } from '@shared/services/theme.service';
import { MapThemeService } from './map-theme.service';

describe('MapThemeService', () => {
  const root = document.documentElement;

  afterEach(() => {
    root.style.removeProperty('--ion-color-primary');
    root.style.removeProperty('--ion-color-success');
    root.classList.remove('ion-palette-dark');
    root.style.removeProperty('color-scheme');
    localStorage.removeItem('stations.theme');
  });

  it('reads the map colours from the Ionic theme variables', () => {
    root.style.setProperty('--ion-color-primary', '#123456');
    root.style.setProperty('--ion-color-success', ' #00ff00 ');

    const palette = TestBed.inject(MapThemeService).palette();

    expect(palette.primary).toBe('#123456');
    expect(palette.success).toBe('#00ff00');
    expect(palette.dark).toBe(TestBed.inject(ThemeService).isDark());
  });

  it('re-reads the palette when the theme is toggled', () => {
    const theme = TestBed.inject(ThemeService);
    const map = TestBed.inject(MapThemeService);
    const before = map.palette().dark;

    theme.toggle();

    expect(map.palette().dark).toBe(!before);
  });
});
