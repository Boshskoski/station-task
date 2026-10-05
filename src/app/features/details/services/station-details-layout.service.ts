import { computed, inject, Service } from '@angular/core';
import { DETAILS_LAYOUT } from '@features/details/constants/details-layout.const';
import { OverlayInsets } from '@shared/models/ui/overlay-insets.ui';
import { ViewportService } from '@shared/services/viewport.service';

@Service()
export class StationDetailsLayoutService {
  private readonly viewport = inject(ViewportService);

  readonly insets = computed<OverlayInsets>(() =>
    this.viewport.isDesktop()
      ? { left: DETAILS_LAYOUT.sidePanelWidth + 2 * DETAILS_LAYOUT.sidePanelMargin, bottom: 0 }
      : {
          left: 0,
          bottom: Math.round(DETAILS_LAYOUT.sheetInitialBreakpoint * this.viewport.height()),
        },
  );
}
