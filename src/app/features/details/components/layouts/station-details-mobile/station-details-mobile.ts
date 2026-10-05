import { Component, computed, effect, inject, input, output, untracked, viewChild } from '@angular/core';
import { IonContent, IonModal } from '@ionic/angular';
import { StationDetailsContent } from '@features/details/components/station-details-content/station-details-content';
import { DETAILS_LAYOUT } from '@features/details/constants/details-layout.const';
import { FavoriteChargePoint } from '@features/details/models/ui/favorite-charge-point.ui';
import { StationDetailsView } from '@features/details/models/ui/station-details-view.ui';
import { StationDetailsStore } from '@features/details/store/station-details.store';

@Component({
  selector: 'app-station-details-mobile',
  imports: [IonModal, IonContent, StationDetailsContent],
  templateUrl: './station-details-mobile.html',
  styleUrl: './station-details-mobile.scss',
})
export class StationDetailsMobile {
  readonly view = input<StationDetailsView>();
  readonly favoriteStationIdSet = input<ReadonlySet<number>>(new Set());
  readonly favoriteChargePoints = input<readonly FavoriteChargePoint[]>([]);
  readonly stationFavoriteToggled = output<number>();
  readonly chargePointFavoriteToggled = output<FavoriteChargePoint>();

  protected readonly detailsStore = inject(StationDetailsStore);

  private readonly content = viewChild(IonContent);
  private readonly stationId = computed(() => this.view()?.station.chargingStationId);

  protected readonly breakpoints = [
    DETAILS_LAYOUT.sheetClosedBreakpoint,
    DETAILS_LAYOUT.sheetInitialBreakpoint,
    DETAILS_LAYOUT.sheetBackdropBreakpoint,
    DETAILS_LAYOUT.sheetFullBreakpoint,
  ];
  protected readonly initialBreakpoint = DETAILS_LAYOUT.sheetInitialBreakpoint;
  protected readonly backdropBreakpoint = DETAILS_LAYOUT.sheetBackdropBreakpoint;

  constructor() {
    effect(() => {
      if (this.stationId() !== undefined) {
        untracked(() => this.content()?.scrollToTop());
      }
    });
  }
}
