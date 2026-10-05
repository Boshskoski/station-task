import { Service, signal } from '@angular/core';
import { MapFocus } from '@features/map/models/ui/map-focus.ui';
import { MapPane } from '@pages/map/types/map-pane.type';

@Service()
export class MapPageStore {
  private readonly pane = signal<MapPane | undefined>(undefined);
  private readonly focusTarget = signal<MapFocus | undefined>(undefined);

  readonly activePane = this.pane.asReadonly();
  readonly focus = this.focusTarget.asReadonly();

  isPaneOpen(pane: MapPane): boolean {
    return this.pane() === pane;
  }

  openPane(pane: MapPane): void {
    this.pane.set(pane);
  }

  closePane(): void {
    this.pane.set(undefined);
  }

  setPaneOpen(pane: MapPane, open: boolean): void {
    if (open) {
      this.openPane(pane);
    } else if (this.isPaneOpen(pane)) {
      this.closePane();
    }
  }

  focusOn({ latitude, longitude }: MapFocus): void {
    this.focusTarget.set({ latitude, longitude });
  }
}
