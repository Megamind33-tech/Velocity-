/**
 * Vocal flight: high pitch = up, low = down. Horizontal is cruise-only (see AutoForwardSystem).
 */
export const VOICE_FLIGHT = {
    /** Pixels per second, world scroll / ship forward */
    CRUISE_SPEED_X: 220,
    /** Hz range mapped to full vertical steering (tune per vocal training UX) */
    PITCH_HZ_MIN: 120,
    PITCH_HZ_MAX: 520,
    /** Below this RMS (0..1), pitch steering is ignored (silence / room noise) */
    VOLUME_GATE: 0.06,
    /** Scale for pitch → vertical acceleration (pixels/s² order) */
    PITCH_VERTICAL_STRENGTH: 1400,
    /** Optional extra vertical from DEV touch strips (same units) */
    DEMO_TOUCH_STRENGTH: 1100,
};

/**
 * Core Physics and Engine Constants for Velocity.
 */
export const PHYSICS = {
    GRAVITY: 9.81 * 100, // Normalized for screen space
    THRUST_POWER: 450,
    DRAG_COEFF: 0.002,
    LIFT_COEFF: 0.8,
    STALL_ANGLE: Math.PI / 4, // 45 degrees
    FIXED_DELTA: 1 / 60
};

/**
 * Rendering and Parallax Configuration.
 */
export type ParallaxLayerConfig = { speed: number; depth: number; offset: number };

export const RENDERING = {
    LERP_ALPHA: 0.15, // Smoothing factor for visuals
    /**
     * Horizontal parallax = `scrollX * speed` (tilePosition.x). Speeds must stay high
     * enough to read on mobile next to gates (220 px/s scroll); 0.04–0.2 felt “frozen.”
     */
    PARALLAX_LAYERS: [
        { speed: 0.22, depth: 5, offset: 0 },
        { speed: 0.42, depth: 4, offset: 100 },
        { speed: 0.62, depth: 3, offset: 200 },
        { speed: 0.82, depth: 2, offset: 300 },
        { speed: 1.0, depth: 1, offset: 400 }
    ] as ParallaxLayerConfig[],
    /**
     * OGA City parallax (240×135 layers). Back → front; foreground ~1× scroll matches gate pass-by.
     * @see public/oga-parallax-city/SOURCES.md
     */
    LEVEL1_CITY_PARALLAX_LAYERS: [
        { speed: 0.32, depth: 5, offset: 0 },
        { speed: 0.52, depth: 4, offset: 0 },
        { speed: 0.72, depth: 3, offset: 0 },
        { speed: 0.95, depth: 2, offset: 0 },
    ] as ParallaxLayerConfig[],
    /** Native pixel height of OGA city strips */
    LEVEL1_CITY_TILE_HEIGHT_PX: 135,
};
