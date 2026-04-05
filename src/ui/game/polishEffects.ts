/**
 * Polish Effects — Glow pulses, shimmer, and visual feedback for AAA quality.
 *
 * DESIGN RULES:
 *   - Glow pulse: 1500ms sine wave, alpha 0.3 → 0.6 → 0.3
 *   - Shimmer: 2000ms, subtle scan effect
 *   - Success flash: 400ms, bright flash then fade
 *   - Error shake: 200ms, subtle vibration
 *   - All effects are non-blocking and can run continuously
 */

import { DisplayObject, Graphics, Container } from 'pixi.js';
import {
    sine,
    linear,
    animateAlpha,
    animateValue,
} from './animationHelpers';
import { AnimationManager } from './AnimationManager';

interface PolishEffectOptions {
    onComplete?: () => void;
    loop?: boolean;
}

/**
 * Create a pulsing glow effect (continuous).
 * @param glowObj Graphics or display object with glow
 * @param minAlpha Minimum glow alpha (default 0.2)
 * @param maxAlpha Maximum glow alpha (default 0.5)
 * @param options Effect options
 * @returns Cancel function
 */
export function createGlowPulse(
    glowObj: DisplayObject,
    minAlpha: number = 0.2,
    maxAlpha: number = 0.5,
    options: PolishEffectOptions = {},
): () => void {
    const { loop = true } = options;
    const animManager = AnimationManager.getInstance();

    let isCancelled = false;

    const pulse = () => {
        if (isCancelled) return;

        const cancel = animateValue(minAlpha, maxAlpha, 750, (value) => {
            glowObj.alpha = value;
        }, sine, () => {
            if (isCancelled) return;

            const cancel2 = animateValue(maxAlpha, minAlpha, 750, (value) => {
                glowObj.alpha = value;
            }, sine, () => {
                if (loop && !isCancelled) {
                    pulse();
                }
            });
        });
    };

    pulse();

    const cancel = () => {
        isCancelled = true;
    };

    return animManager.register(cancel, {
        priority: 'low',
        group: 'polish-glow',
    });
}

/**
 * Create shimmer/scan effect on text or icon.
 * @param targetObj Container or display object to shimmer
 * @param options Effect options
 * @returns Cancel function
 */
export function createShimmer(
    targetObj: DisplayObject,
    options: PolishEffectOptions = {},
): () => void {
    const { loop = true } = options;
    const animManager = AnimationManager.getInstance();

    let isCancelled = false;
    const originalAlpha = targetObj.alpha;

    const shimmer = () => {
        if (isCancelled) return;

        // Shimmer: slightly brighten then return to normal
        const cancel = animateValue(0, 1, 1200, (t) => {
            // Sine wave: 0 → 1 → 0 over duration
            const wave = Math.sin(t * Math.PI);
            // Brighten by 10%
            targetObj.alpha = originalAlpha + wave * 0.1;
        }, linear, () => {
            if (isCancelled) return;
            targetObj.alpha = originalAlpha;

            if (loop && !isCancelled) {
                setTimeout(shimmer, 300);
            }
        });
    };

    shimmer();

    const cancel = () => {
        isCancelled = true;
        targetObj.alpha = originalAlpha;
    };

    return animManager.register(cancel, {
        priority: 'low',
        group: 'polish-shimmer',
    });
}

/**
 * Success flash: bright white flash that fades.
 * @param targetObj Object to flash
 * @param duration Flash duration (ms)
 * @param options Effect options
 * @returns Cancel function
 */
export function createSuccessFlash(
    targetObj: DisplayObject,
    duration: number = 400,
    options: PolishEffectOptions = {},
): () => void {
    const { onComplete } = options;
    const animManager = AnimationManager.getInstance();

    const originalAlpha = targetObj.alpha;

    // Quick bright flash then fade
    const cancel = animateAlpha(targetObj, 1.0, originalAlpha, {
        duration,
        easing: (t) => {
            // Fast fade with easing
            return 1 - (t * t);
        },
        onComplete,
    });

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'polish-flash',
        onComplete,
    });
}

/**
 * Error shake: subtle vibration for error feedback.
 * @param targetObj Object to shake
 * @param intensity Shake distance in pixels (default 2)
 * @param duration Shake duration (ms, default 200)
 * @param options Effect options
 * @returns Cancel function
 */
export function createErrorShake(
    targetObj: DisplayObject,
    intensity: number = 2,
    duration: number = 200,
    options: PolishEffectOptions = {},
): () => void {
    const { onComplete } = options;
    const animManager = AnimationManager.getInstance();

    const startX = targetObj.position.x;
    const startY = targetObj.position.y;

    let cancelled = false;
    const shakes = 4; // Number of shake cycles
    const shakeDuration = duration / shakes;
    let shakeCount = 0;

    const doShake = () => {
        if (cancelled || shakeCount >= shakes) {
            targetObj.position.set(startX, startY);
            onComplete?.();
            return;
        }

        const offsetX = (shakeCount % 2 === 0 ? 1 : -1) * intensity;
        const offsetY = (shakeCount % 2 === 0 ? -1 : 1) * intensity;

        const cancel = animateValue(0, 1, shakeDuration, (t) => {
            targetObj.position.x = startX + offsetX * (1 - t);
            targetObj.position.y = startY + offsetY * (1 - t);
        }, (t) => t, () => {
            shakeCount++;
            doShake();
        });
    };

    doShake();

    const cancel = () => {
        cancelled = true;
        targetObj.position.set(startX, startY);
    };

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'polish-shake',
        onComplete,
    });
}

/**
 * Bounce effect: pop down then spring back up.
 * @param targetObj Object to bounce
 * @param bounceDistance Distance to bounce (pixels)
 * @param duration Total bounce duration (ms)
 * @param options Effect options
 * @returns Cancel function
 */
export function createBounce(
    targetObj: DisplayObject,
    bounceDistance: number = 8,
    duration: number = 300,
    options: PolishEffectOptions = {},
): () => void {
    const { onComplete } = options;
    const animManager = AnimationManager.getInstance();

    const startY = targetObj.position.y;

    // Down phase: 40% of duration
    const downDuration = duration * 0.4;
    let downCancel: (() => void) | null = null;

    downCancel = animateValue(0, bounceDistance, downDuration, (value) => {
        targetObj.position.y = startY + value;
    }, (t) => t * t, () => {
        // Up phase: 60% of duration with bounce
        const upCancel = animateValue(
            bounceDistance,
            0,
            duration * 0.6,
            (value) => {
                targetObj.position.y = startY + value;
            },
            (t) => {
                // Elastic easing
                return 1 - Math.pow(1 - t, 3);
            },
            onComplete
        );
    });

    const cancel = () => {
        downCancel?.();
        targetObj.position.y = startY;
    };

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'polish-bounce',
        onComplete,
    });
}

/**
 * Pulse scale effect: slight scale oscillation.
 * Used for breathing/attention effects.
 * @param targetObj Object to pulse
 * @param minScale Minimum scale (default 0.95)
 * @param maxScale Maximum scale (default 1.05)
 * @param duration Pulse duration (ms)
 * @param options Effect options
 * @returns Cancel function
 */
export function createPulseScale(
    targetObj: DisplayObject,
    minScale: number = 0.95,
    maxScale: number = 1.05,
    duration: number = 1200,
    options: PolishEffectOptions = {},
): () => void {
    const { loop = true } = options;
    const animManager = AnimationManager.getInstance();

    let isCancelled = false;

    const pulse = () => {
        if (isCancelled) return;

        const cancel = animateValue(minScale, maxScale, duration / 2, (value) => {
            targetObj.scale.set(value, value);
        }, sine, () => {
            if (isCancelled) return;

            const cancel2 = animateValue(maxScale, minScale, duration / 2, (value) => {
                targetObj.scale.set(value, value);
            }, sine, () => {
                if (loop && !isCancelled) {
                    pulse();
                }
            });
        });
    };

    pulse();

    const cancel = () => {
        isCancelled = true;
        targetObj.scale.set(1, 1);
    };

    return animManager.register(cancel, {
        priority: 'low',
        group: 'polish-pulse-scale',
    });
}

/**
 * Rotation effect: slow continuous rotation.
 * Used for loading spinners or decorative elements.
 * @param targetObj Object to rotate
 * @param duration Full rotation time (ms)
 * @param options Effect options
 * @returns Cancel function
 */
export function createRotation(
    targetObj: DisplayObject,
    duration: number = 2000,
    options: PolishEffectOptions = {},
): () => void {
    const { loop = true } = options;
    const animManager = AnimationManager.getInstance();

    let isCancelled = false;
    const startRotation = targetObj.rotation;

    const rotate = () => {
        if (isCancelled) return;

        const cancel = animateValue(0, Math.PI * 2, duration, (value) => {
            targetObj.rotation = startRotation + value;
        }, linear, () => {
            if (loop && !isCancelled) {
                rotate();
            }
        });
    };

    rotate();

    const cancel = () => {
        isCancelled = true;
        targetObj.rotation = startRotation;
    };

    return animManager.register(cancel, {
        priority: 'low',
        group: 'polish-rotation',
    });
}
