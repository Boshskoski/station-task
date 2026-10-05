export const LOCATION_CONFIG = {
  positionOptions: { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
  toastDurationMs: 6000,
} as const satisfies {
  readonly positionOptions: PositionOptions;
  readonly toastDurationMs: number;
};
