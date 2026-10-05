import { DOCUMENT, inject, Service, signal } from '@angular/core';
import { StorageService } from '@core/services/storage.service';
import { StorageKey } from '@core/types/storage-key.type';

@Service()
export class ThemeService {
  private static readonly STORAGE_KEY: StorageKey = 'stations.theme.v1';
  private static readonly DARK_CLASS = 'ion-palette-dark';

  private readonly root = inject(DOCUMENT).documentElement;
  private readonly storage = inject(StorageService);
  private readonly dark = signal(this.root.classList.contains(ThemeService.DARK_CLASS));

  readonly isDark = this.dark.asReadonly();

  toggle(): void {
    const dark = !this.dark();
    this.root.classList.toggle(ThemeService.DARK_CLASS, dark);
    this.root.style.colorScheme = dark ? 'dark' : 'light';
    this.dark.set(dark);
    this.storage.write(ThemeService.STORAGE_KEY, dark ? 'dark' : 'light');
  }
}
