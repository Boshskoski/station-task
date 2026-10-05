import { Component, computed, effect, ElementRef, inject, input, output, untracked, viewChild } from '@angular/core';
import { StationDetailsContent } from '@features/details/components/station-details-content/station-details-content';
import { DETAILS_LAYOUT } from '@features/details/constants/details-layout.const';
import { FavoriteChargePoint } from '@features/details/models/ui/favorite-charge-point.ui';
import { StationDetailsView } from '@features/details/models/ui/station-details-view.ui';
import { StationDetailsStore } from '@features/details/store/station-details.store';

@Component({
  selector: 'app-station-details-desktop',
  imports: [StationDetailsContent],
  templateUrl: './station-details-desktop.html',
  styleUrl: './station-details-desktop.scss',
  host: {
    '[style.--side-panel-width.px]': 'layout.sidePanelWidth',
    '[style.--side-panel-margin.px]': 'layout.sidePanelMargin',
  },
})
export class StationDetailsDesktop {
  readonly view = input<StationDetailsView>();
  readonly favoriteStationIdSet = input<ReadonlySet<number>>(new Set());
  readonly favoriteChargePoints = input<readonly FavoriteChargePoint[]>([]);
  readonly stationFavoriteToggled = output<number>();
  readonly chargePointFavoriteToggled = output<FavoriteChargePoint>();

  protected readonly detailsStore = inject(StationDetailsStore);
  protected readonly layout = DETAILS_LAYOUT;

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly stationId = computed(() => this.view()?.station.chargingStationId);

  constructor() {
    effect(() => {
      if (this.stationId() !== undefined) {
        untracked(() => this.scroller()?.nativeElement.scrollTo({ top: 0 }));
      }
    });
  }
}
