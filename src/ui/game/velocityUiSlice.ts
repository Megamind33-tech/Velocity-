/**
 * Nine-slice insets for SunGraphica PNGs (see `public/sungraphica-ui/Sci Fi Game UI FREE/LEVELS/`).
 * Sized from actual dimensions: Layer-5 ≈241², Layer-8 ≈364², Layer-3/2 strips ≈350×202.
 */

export const VELOCITY_UI_SLICE = {
    /** Neutral square/rounded plate (e.g. LEVELS_0000s_0004_Layer-5.png) */
    button: { L: 56, R: 56, T: 56, B: 56 },
    /** Panel frame + fill (364×363, 297×297) */
    panel: { L: 72, R: 72, T: 72, B: 72 },
    /** Horizontal strip for progress tiling (~350×202) */
    slide: { L: 44, R: 44, T: 28, B: 28 },
} as const;
