/**
 * Nine-slice insets for SunGraphica PNGs (pause strips + level panel layers).
 * Tune if corners stretch oddly at extreme aspect ratios.
 */

export const VELOCITY_UI_SLICE = {
    button: { L: 140, R: 140, T: 72, B: 72 },
    panel: { L: 96, R: 96, T: 96, B: 96 },
} as const;
