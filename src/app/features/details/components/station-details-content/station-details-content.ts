import { Component, computed, input, output } from '@angular/core';
import { ChargePoint } from '@features/details/models/ui/charge-point.ui';
import { FavoriteChargePoint } from '@features/details/models/ui/favorite-charge-point.ui';
import { StationDetailsView } from '@features/details/models/ui/station-details-view.ui';
import { StationDetailsActions } from './station-details-actions/station-details-actions';
import { StationDetailsAvailability } from './station-details-availability/station-details-availability';
import { StationDetailsChargePoints } from './station-details-charge-points/station-details-charge-points';
import { StationDetailsHeader } from './station-details-header/station-details-header';
import { StationDetailsNotice } from './station-details-notice/station-details-notice';
import { StationDetailsPricing } from './station-details-pricing/station-details-pricing';
import { StationDetailsSupport } from './station-details-support/station-details-support';

@Component({
  selector: 'app-station-details-content',
  imports: [
    StationDetailsActions,
    StationDetailsAvailability,
    StationDetailsChargePoints,
    StationDetailsHeader,
    StationDetailsNotice,
    StationDetailsPricing,
    StationDetailsSupport,
  ],
  templateUrl: './station-details-content.html',
  styleUrl: './station-details-content.scss',
})
export class StationDetailsContent {
  readonly view = input.required<StationDetailsView>();
  readonly favoriteStationIdSet = input<ReadonlySet<number>>(new Set());
  readonly favoriteChargePoints = input<readonly FavoriteChargePoint[]>([]);
  readonly retry = output<void>();
  readonly closed = output<void>();
  readonly stationFavoriteToggled = output<number>();
  readonly chargePointFavoriteToggled = output<FavoriteChargePoint>();

  protected readonly stationFavorite = computed(() =>
    this.favoriteStationIdSet().has(this.view().station.chargingStationId),
  );
  protected readonly favoriteChargePointIds = computed<ReadonlySet<number>>(() => {
    const { chargingStationId } = this.view().station;
    return new Set(
      this.favoriteChargePoints()
        .filter((chargePoint) => chargePoint.chargingStationId === chargingStationId)
        .map((chargePoint) => chargePoint.chargePointId),
    );
  });

  protected toggleStation(): void {
    this.stationFavoriteToggled.emit(this.view().station.chargingStationId);
  }

  protected toggleChargePoint({ chargePointId, name }: ChargePoint): void {
    this.chargePointFavoriteToggled.emit({
      chargingStationId: this.view().station.chargingStationId,
      chargePointId,
      name,
    });
  }
}
