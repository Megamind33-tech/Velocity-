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
