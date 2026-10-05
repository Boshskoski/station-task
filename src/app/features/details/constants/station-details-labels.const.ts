import { ChargingStationType } from '@core/enums/station/charging-station-type.enum';
import { ChargePointStatus } from '@features/details/enums/charge-point-status.enum';
import { TypeCostCharging } from '@features/details/enums/type-cost-charging.enum';

export const CHARGING_STATION_TYPE_LABELS: Readonly<Record<ChargingStationType, string>> = {
  [ChargingStationType.ApartmentBuilding]: 'Apartment building',
  [ChargingStationType.PrivateParking]: 'Private parking',
  [ChargingStationType.HomeCharger]: 'Home charger',
  [ChargingStationType.Public]: 'Public',
};

export const CHARGE_POINT_STATUS_COLORS: Readonly<Record<ChargePointStatus, string>> = {
  [ChargePointStatus.Available]: 'success',
  [ChargePointStatus.Preparing]: 'warning',
};

export const TYPE_COST_CHARGING_LABELS: Readonly<Record<TypeCostCharging, string>> = {
  [TypeCostCharging.PerkWh]: 'per kWh',
};
