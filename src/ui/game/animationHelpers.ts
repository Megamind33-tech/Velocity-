/**
 * Animation Helpers — Professional easing functions and animation utilities for AAA-quality UI.
 *
 * STANDARDS:
 *   - All animations run at 60fps
 *   - Easing functions use standard mathematical curves for smooth motion
 *   - Durations: 100-300ms for interactions, 1500ms for continuous effects
 *   - No animation exceeds 3px blur or 0.4 alpha for visual clarity
 *
 * EASING FUNCTIONS:
 *   - easeOut: Quick start, decelerate (entrance, scale-in)
 *   - easeIn: Accelerate, quick end (exit, scale-out)
 *   - easeInOut: Accelerate then decelerate (transitions)
 *   - sine: Smooth wave motion (pulse, glow)
 *   - linear: Constant speed (progress bars, continuous motion)
 */

/**
 * easeOut: Quadratic ease-out function.
 * Fast start, rapid deceleration for entrance animations.
 * Formula: 1 - (1-t)²
 */
export function easeOut(t: number): number {
    return 1 - (1 - t) * (1 - t);
}

/**
 * easeIn: Quadratic ease-in function.
 * Slow start with rapid acceleration, quick end for exit animations.
 * Formula: t²
 */
export function easeIn(t: number): number {
    return t * t;
}

/**
 * easeInOut: Quadratic ease-in-out function.
 * Slow start, accelerate, decelerate, slow end for smooth transitions.
 * Formula: t < 0.5 ? 2t² : 1 - (-2t+2)²/2
 */
export function easeInOut(t: number): number {
    // Clamp t to 0-1 range for safety
    const clampedT = Math.max(0, Math.min(1, t));
    return clampedT < 0.5 ? 2 * clampedT * clampedT : 1 - Math.pow(-2 * clampedT + 2, 2) / 2;
}

/**
 * sine: Sine wave easing for pulse and glow effects.
 * Smooth oscillation for continuous animations.
 * Formula: (sin(πt) - π/2)/2 + 0.5
 */
export function sine(t: number): number {
    return (Math.sin((t - 0.5) * Math.PI) + 1) / 2;
}

/**
 * linear: Linear interpolation.
 * Constant speed for progress indicators and simple transitions.
 */
export function linear(t: number): number {
    return t;
}

// ─── Animation Value Interpolation ────────────────────────────────────────────

/**
 * Interpolate between two numbers with easing.
 * @param start Starting value
 * @param end Ending value
 * @param t Progress (0-1)
 * @param easing Easing function
 * @returns Interpolated value
 */
export function interpolateNumber(
    start: number,
    end: number,
    t: number,
    easing: (t: number) => number = linear,
): number {
    return start + (end - start) * easing(Math.min(1, Math.max(0, t)));
}

/**
 * Animate a numeric property with callbacks.
 * @param startValue Starting value
 * @param endValue Target value
 * @param duration Duration in milliseconds
 * @param onUpdate Callback called each frame with current value
 * @param easing Easing function
 * @param onComplete Optional completion callback
 * @returns Cancel function to stop animation
 */
export function animateValue(
    startValue: number,
    endValue: number,
    duration: number,
    onUpdate: (value: number) => void,
    easing: (t: number) => number = linear,
    onComplete?: () => void,
): () => void {
    // Input validation
    const safeDuration = Math.max(1, duration); // Minimum 1ms to avoid division issues
    let startTime: number | null = null;
    let animationId: number | null = null;
    let isCancelled = false;

    const animate = (currentTime: number) => {
        if (isCancelled) return;

        if (startTime === null) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / safeDuration, 1);
        const value = interpolateNumber(startValue, endValue, progress, easing);

        try {
            onUpdate(value);
        } catch (error) {
            console.error('Animation update error:', error);
            // Continue animation despite callback error
        }

        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        } else {
            if (!isCancelled) {
                try {
                    onUpdate(endValue);
                } catch (error) {
                    console.error('Animation final update error:', error);
                }
                try {
                    onComplete?.();
                } catch (error) {
                    console.error('Animation completion error:', error);
                }
            }
            animationId = null;
        }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
        isCancelled = true;
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    };
}

// ─── Pixi-Specific Animation Helpers ──────────────────────────────────────────

import { DisplayObject, Container } from 'pixi.js';

interface AnimationOptions {
    duration?: number;
    easing?: (t: number) => number;
    onComplete?: () => void;
}

/**
 * Animate object opacity (alpha).
 * @param obj Pixi DisplayObject to animate
 * @param from Starting alpha (0-1)
 * @param to Target alpha (0-1)
 * @param options Animation options
 * @returns Cancel function
 */
export function animateAlpha(
    obj: DisplayObject,
    from: number,
    to: number,
    options: AnimationOptions = {},
): () => void {
    const { duration = 300, easing = linear, onComplete } = options;
    obj.alpha = from;

    return animateValue(from, to, duration, (value) => {
        obj.alpha = value;
    }, easing, onComplete);
}

/**
 * Animate object scale with separate X/Y support.
 * @param obj Pixi DisplayObject to animate
 * @param from Starting scale (scalar or {x, y})
 * @param to Target scale (scalar or {x, y})
 * @param options Animation options
 * @returns Cancel function
 */
export function animateScale(
    obj: DisplayObject,
    from: number | { x: number; y: number },
    to: number | { x: number; y: number },
    options: AnimationOptions = {},
): () => void {
    const { duration = 300, easing = linear, onComplete } = options;
    const startX = typeof from === 'number' ? from : from.x;
    const startY = typeof from === 'number' ? from : from.y;
    const endX = typeof to === 'number' ? to : to.x;
    const endY = typeof to === 'number' ? to : to.y;

    obj.scale.set(startX, startY);

    let cancelAlpha: (() => void) | null = null;
    let cancelBeta: (() => void) | null = null;
    let isCompleted = false;

    cancelAlpha = animateValue(startX, endX, duration, (value) => {
        obj.scale.x = value;
    }, easing);

    cancelBeta = animateValue(startY, endY, duration, (value) => {
        obj.scale.y = value;
    }, easing, () => {
        if (!isCompleted) {
            isCompleted = true;
            onComplete?.();
        }
    });

    return () => {
        isCompleted = true;
        cancelAlpha?.();
        cancelBeta?.();
    };
}

/**
 * Animate object position (X, Y, or both).
 * @param obj Pixi DisplayObject to animate
 * @param from Starting position {x?, y?}
 * @param to Target position {x?, y?}
 * @param options Animation options
 * @returns Cancel function
 */
export function animatePosition(
    obj: DisplayObject,
    from: { x?: number; y?: number },
    to: { x?: number; y?: number },
    options: AnimationOptions = {},
): () => void {
    const { duration = 300, easing = linear, onComplete } = options;
    const startX = from.x ?? obj.position.x;
    const startY = from.y ?? obj.position.y;
    const endX = to.x ?? obj.position.x;
    const endY = to.y ?? obj.position.y;

    obj.position.set(startX, startY);

    let cancelX: (() => void) | null = null;
    let cancelY: (() => void) | null = null;
    let isCompleted = false;

    cancelX = animateValue(startX, endX, duration, (value) => {
        obj.position.x = value;
    }, easing);

    cancelY = animateValue(startY, endY, duration, (value) => {
        obj.position.y = value;
    }, easing, () => {
        if (!isCompleted) {
            isCompleted = true;
            onComplete?.();
        }
    });

    return () => {
        isCompleted = true;
        cancelX?.();
        cancelY?.();
    };
}

/**
 * Animate multiple properties together with sequence support.
 * Useful for complex animations like fade-in + scale-up simultaneously.
 */
export interface SequenceStep {
    delay?: number;
    duration?: number;
    easing?: (t: number) => number;
    onUpdate?: (progress: number) => void;
    onComplete?: () => void;
}

/**
 * Execute animation steps in sequence.
 * @param steps Array of animation steps
 * @returns Cancel function to stop entire sequence
 */
export function animateSequence(steps: SequenceStep[]): () => void {
    const cancels: Array<() => void> = [];
    let currentIndex = 0;

    const runStep = (step: SequenceStep) => {
        const delay = step.delay ?? 0;
        const duration = step.duration ?? 300;
        const easing = step.easing ?? linear;

        if (delay > 0) {
            const timeoutId = setTimeout(() => {
                const cancel = animateValue(0, 1, duration, (t) => {
                    step.onUpdate?.(t);
                }, easing, () => {
                    step.onComplete?.();
                    currentIndex++;
                    if (currentIndex < steps.length) {
                        runStep(steps[currentIndex]);
                    }
                });
                cancels.push(cancel);
            }, delay);

            const cancel = () => clearTimeout(timeoutId);
            cancels.push(cancel);
        } else {
            const cancel = animateValue(0, 1, duration, (t) => {
                step.onUpdate?.(t);
            }, easing, () => {
                step.onComplete?.();
                currentIndex++;
                if (currentIndex < steps.length) {
                    runStep(steps[currentIndex]);
                }
            });
            cancels.push(cancel);
        }
    };

    if (steps.length > 0) {
        runStep(steps[0]);
    }

    return () => {
        cancels.forEach((cancel) => cancel?.());
        cancels.length = 0;
    };
}

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Create a staggered animation for multiple objects.
 * @param objects Array of objects to animate
 * @param animateObject Function to animate each object
 * @param staggerDelay Delay between animations (ms)
 * @returns Cancel function for all animations
 */
export function animateStaggered(
    objects: DisplayObject[],
    animateObject: (obj: DisplayObject, delay: number) => () => void,
    staggerDelay: number = 50,
): () => void {
    const cancels = objects.map((obj, index) =>
        animateObject(obj, index * staggerDelay)
    );

    return () => {
        cancels.forEach((cancel) => cancel?.());
    };
}
