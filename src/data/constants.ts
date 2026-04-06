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
/**
 * `worldLock`: 1 = layer moves with gates (full forward motion); lower = slightly more
 * “depth” drift via tile UV only. Parallax container is parented to `worldScrollRoot` (-scrollX).
 */
export type ParallaxLayerConfig = { worldLock: number; depth: number; offset: number };

export const RENDERING = {
    LERP_ALPHA: 0.15, // Smoothing factor for visuals
    PARALLAX_LAYERS: [
        { worldLock: 0.82, depth: 5, offset: 0 },
        { worldLock: 0.88, depth: 4, offset: 100 },
        { worldLock: 0.92, depth: 3, offset: 200 },
        { worldLock: 0.96, depth: 2, offset: 300 },
        { worldLock: 1.0, depth: 1, offset: 400 }
    ] as ParallaxLayerConfig[],
    /**
     * OGA City parallax — all layers strongly world-locked so bridge/buildings clearly stream past.
     * @see public/oga-parallax-city/SOURCES.md
     */
    LEVEL1_CITY_PARALLAX_LAYERS: [
        { worldLock: 0.9, depth: 5, offset: 0 },
        { worldLock: 0.93, depth: 4, offset: 0 },
        { worldLock: 0.96, depth: 3, offset: 0 },
        { worldLock: 1.0, depth: 2, offset: 0 },
    ] as ParallaxLayerConfig[],
    /** Native pixel height of OGA city strips */
    LEVEL1_CITY_TILE_HEIGHT_PX: 135,
};
