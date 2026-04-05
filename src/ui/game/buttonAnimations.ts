/**
 * Button Animations — Professional hover, focus, and press feedback for AAA UI.
 *
 * DESIGN RULES:
 *   - Hover: 200ms, easeOut, scale 1.0 → 1.02, maintain visual feedback
 *   - Press: 100ms, easeOut, scale 1.02 → 0.98, then return to 1.0
 *   - Focus: 200ms, subtle glow enhancement
 *   - All interactions are non-blocking, stack properly
 */

import { Container, DisplayObject } from 'pixi.js';
import {
    easeOut,
    easeIn,
    easeInOut,
    animateScale,
    interpolateNumber,
    animateValue,
} from './animationHelpers';
import { AnimationManager } from './AnimationManager';

interface ButtonAnimationOptions {
    duration?: number;
    onComplete?: () => void;
}

/**
 * Animate button hover state: subtle scale up.
 * @param button Button container or sprite
 * @param options Animation options
 * @returns Cancel function
 */
export function animateButtonHover(
    button: DisplayObject,
    options: ButtonAnimationOptions = {},
): () => void {
    const { duration = 200, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    const cancel = animateScale(button, 1.0, 1.02, {
        duration,
        easing: easeOut,
        onComplete,
    });

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'button-hover',
        onComplete,
    });
}

/**
 * Animate button hover exit: return to normal scale.
 * @param button Button container or sprite
 * @param options Animation options
 * @returns Cancel function
 */
export function animateButtonHoverExit(
    button: DisplayObject,
    options: ButtonAnimationOptions = {},
): () => void {
    const { duration = 150, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    const cancel = animateScale(button, button.scale.x, 1.0, {
        duration,
        easing: easeInOut,
        onComplete,
    });

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'button-hover-exit',
        onComplete,
    });
}

/**
 * Animate button press: compress then release.
 * Simulates physical button feedback.
 * @param button Button container or sprite
 * @param options Animation options
 * @returns Cancel function
 */
export function animateButtonPress(
    button: DisplayObject,
    options: ButtonAnimationOptions = {},
): () => void {
    const { duration = 100, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    const startScale = button.scale.x; // Usually 1.0 or 1.02 if hovered

    let phase1: (() => void) | null = null;
    let phase2: (() => void) | null = null;

    // Phase 1: Compress (80% of duration)
    phase1 = animateScale(button, startScale, 0.98, {
        duration: Math.floor(duration * 0.8),
        easing: easeOut,
        onComplete: () => {
            // Phase 2: Release (20% of duration)
            phase2 = animateScale(button, 0.98, 1.0, {
                duration: Math.floor(duration * 0.2),
                easing: easeOut,
                onComplete,
            });
        },
    });

    const cancel = () => {
        phase1?.();
        phase2?.();
    };

    return animManager.register(cancel, {
        priority: 'high',
        group: 'button-press',
        onComplete,
    });
}

/**
 * Animate button focus: enhance shadow/glow.
 * Used for keyboard/gamepad focus states.
 * @param button Button container
 * @param glowObject Shadow/glow container within button
 * @param options Animation options
 * @returns Cancel function
 */
export function animateButtonFocus(
    button: DisplayObject,
    glowObject: DisplayObject | null = null,
    options: ButtonAnimationOptions = {},
): () => void {
    const { duration = 200, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    const cancel = animateScale(button, 1.0, 1.02, {
        duration,
        easing: easeOut,
        onComplete,
    });

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'button-focus',
        onComplete,
    });
}

/**
 * Animate button disable state: fade and desaturate.
 * @param button Button container
 * @param options Animation options
 * @returns Cancel function
 */
export function animateButtonDisable(
    button: DisplayObject,
    options: ButtonAnimationOptions = {},
): () => void {
    const { duration = 200, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    let cancelCount = 0;
    let alpha: (() => void) | null = null;
    let scale: (() => void) | null = null;

    const checkComplete = () => {
        cancelCount++;
        if (cancelCount === 2) {
            onComplete?.();
        }
    };

    // Fade: full opacity → 0.5
    alpha = animateValue(button.alpha, 0.5, duration, (value) => {
        button.alpha = value;
    }, easeOut, checkComplete);

    // Slightly shrink
    scale = animateScale(button, 1.0, 0.98, {
        duration,
        easing: easeOut,
        onComplete: checkComplete,
    });

    const cancel = () => {
        alpha?.();
        scale?.();
    };

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'button-disable',
        onComplete,
    });
}

/**
 * Animate button enable state: restore to normal.
 * @param button Button container
 * @param options Animation options
 * @returns Cancel function
 */
export function animateButtonEnable(
    button: DisplayObject,
    options: ButtonAnimationOptions = {},
): () => void {
    const { duration = 200, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    let cancelCount = 0;
    let alpha: (() => void) | null = null;
    let scale: (() => void) | null = null;

    const checkComplete = () => {
        cancelCount++;
        if (cancelCount === 2) {
            onComplete?.();
        }
    };

    // Fade: 0.5 → full opacity
    alpha = animateValue(button.alpha, 1.0, duration, (value) => {
        button.alpha = value;
    }, easeOut, checkComplete);

    // Grow back
    scale = animateScale(button, button.scale.x, 1.0, {
        duration,
        easing: easeOut,
        onComplete: checkComplete,
    });

    const cancel = () => {
        alpha?.();
        scale?.();
    };

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'button-enable',
        onComplete,
    });
}

/**
 * Interactive button handler: manages all button state animations.
 * Use this for complete button animation management.
 */
export class InteractiveButton {
    private button: DisplayObject;
    private animManager = AnimationManager.getInstance();
    private activeAnimations = new Map<string, () => void>();

    constructor(button: DisplayObject) {
        this.button = button;
    }

    /**
     * Handle mouse/touch enter.
     */
    onHoverStart(): void {
        this.cancelAnimation('hover-exit');
        const cancel = animateButtonHover(this.button);
        this.setAnimation('hover', cancel);
    }

    /**
     * Handle mouse/touch exit.
     */
    onHoverEnd(): void {
        this.cancelAnimation('hover');
        const cancel = animateButtonHoverExit(this.button);
        this.setAnimation('hover-exit', cancel);
    }

    /**
     * Handle press/click.
     */
    onPress(): void {
        this.cancelAnimation('press');
        const cancel = animateButtonPress(this.button);
        this.setAnimation('press', cancel);
    }

    /**
     * Handle focus (keyboard).
     */
    onFocus(): void {
        this.cancelAnimation('focus');
        const cancel = animateButtonFocus(this.button);
        this.setAnimation('focus', cancel);
    }

    /**
     * Handle blur (keyboard).
     */
    onBlur(): void {
        this.cancelAnimation('focus');
        const cancel = animateButtonHoverExit(this.button);
        this.setAnimation('blur', cancel);
    }

    /**
     * Disable button with animation.
     */
    disable(): void {
        const cancel = animateButtonDisable(this.button);
        this.setAnimation('disable', cancel);
    }

    /**
     * Enable button with animation.
     */
    enable(): void {
        const cancel = animateButtonEnable(this.button);
        this.setAnimation('enable', cancel);
    }

    /**
     * Clean up all animations.
     */
    cleanup(): void {
        for (const cancel of this.activeAnimations.values()) {
            cancel?.();
        }
        this.activeAnimations.clear();
    }

    private setAnimation(key: string, cancel: () => void): void {
        this.activeAnimations.set(key, cancel);
    }

    private cancelAnimation(key: string): void {
        const cancel = this.activeAnimations.get(key);
        if (cancel) {
            cancel();
            this.activeAnimations.delete(key);
        }
    }
}
