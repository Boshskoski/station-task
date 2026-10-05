import { computed, DOCUMENT, inject, Service } from '@angular/core';
import { MapPalette } from '@features/map/models/ui/map-palette.ui';
import { ThemeService } from '@shared/services/theme.service';

@Service()
export class MapThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly theme = inject(ThemeService);

  readonly palette = computed(() => this.readPalette(this.theme.isDark()));

  private readPalette(dark: boolean): MapPalette {
    const styles = getComputedStyle(this.document.documentElement);
    const color = (name: string): string => styles.getPropertyValue(`--ion-color-${name}`).trim();
    return {
      dark,
      primary: color('primary'),
      primaryRgb: color('primary-rgb'),
      primaryContrast: color('primary-contrast'),
      success: color('success'),
      successContrast: color('success-contrast'),
      medium: color('medium'),
      mediumContrast: color('medium-contrast'),
      danger: color('danger'),
      dangerRgb: color('danger-rgb'),
      tertiary: color('tertiary'),
      tertiaryRgb: color('tertiary-rgb'),
    };
  }
}
