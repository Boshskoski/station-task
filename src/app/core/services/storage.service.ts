import { Service } from '@angular/core';
import { StorageKey } from '@core/types/storage-key.type';

@Service()
export class StorageService {
  read(key: StorageKey): unknown {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? undefined : JSON.parse(stored);
    } catch (error) {
      console.error(`Could not read ${key} from storage`, error);
      return undefined;
    }
  }

  write(key: StorageKey, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Could not write ${key} to storage`, error);
    }
  }
}
