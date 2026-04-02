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
export const RENDERING = {
    LERP_ALPHA: 0.15, // Smoothing factor for visuals
    PARALLAX_LAYERS: [
        { speed: 0.05, depth: 5, offset: 0 },
        { speed: 0.10, depth: 4, offset: 100 },
        { speed: 0.20, depth: 3, offset: 200 },
        { speed: 0.40, depth: 2, offset: 300 },
        { speed: 0.60, depth: 1, offset: 400 }
    ]
};
