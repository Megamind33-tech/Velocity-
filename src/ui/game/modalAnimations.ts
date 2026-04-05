/**
 * Modal Animations — Professional entrance/exit effects for modal screens.
 *
 * DESIGN RULES:
 *   - Entrance: 300ms, easeOut, fade + scale-up from 0.95
 *   - Exit: 200ms, easeIn, fade + scale-down to 0.95
 *   - Timing: Smooth, predictable, non-distracting
 *   - Performance: Maintains 60fps throughout animation
 */

import { Container } from 'pixi.js';
import {
    easeOut,
    easeIn,
    animateAlpha,
    animateScale,
} from './animationHelpers';
import { AnimationManager } from './AnimationManager';

interface ModalAnimationOptions {
    duration?: number;
    onComplete?: () => void;
}

/**
 * Animate modal entrance: fade in + scale up.
 * @param modal Container to animate
 * @param options Animation options
 * @returns Cancel function
 */
export function animateModalEntrance(
    modal: Container,
    options: ModalAnimationOptions = {},
): () => void {
    const { duration = 300, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    // Reset to starting state
    modal.alpha = 0;
    modal.scale.set(0.95, 0.95);

    let cancelCount = 0;
    let alpha: (() => void) | null = null;
    let scale: (() => void) | null = null;

    const checkComplete = () => {
        cancelCount++;
        if (cancelCount === 2) {
            onComplete?.();
        }
    };

    // Animate alpha: 0 → 1
    alpha = animateAlpha(modal, 0, 1, {
        duration,
        easing: easeOut,
        onComplete: checkComplete,
    });

    // Animate scale: 0.95 → 1.0
    scale = animateScale(modal, 0.95, 1.0, {
        duration,
        easing: easeOut,
        onComplete: checkComplete,
    });

    const cancel = () => {
        alpha?.();
        scale?.();
    };

    return animManager.register(cancel, {
        priority: 'high',
        group: 'modal-entrance',
        onComplete,
    });
}

/**
 * Animate modal exit: fade out + scale down.
 * @param modal Container to animate
 * @param options Animation options
 * @returns Cancel function
 */
export function animateModalExit(
    modal: Container,
    options: ModalAnimationOptions = {},
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

    // Animate alpha: 1 → 0
    alpha = animateAlpha(modal, modal.alpha, 0, {
        duration,
        easing: easeIn,
        onComplete: checkComplete,
    });

    // Animate scale: 1.0 → 0.95
    scale = animateScale(modal, 1.0, 0.95, {
        duration,
        easing: easeIn,
        onComplete: checkComplete,
    });

    const cancel = () => {
        alpha?.();
        scale?.();
    };

    return animManager.register(cancel, {
        priority: 'high',
        group: 'modal-exit',
        onComplete,
    });
}

/**
 * Animate modal with staggered child entrance.
 * Useful for content that should appear after modal entrance.
 * @param modal Container to animate
 * @param children Child objects to stagger
 * @param options Animation options
 * @returns Cancel function
 */
export function animateModalWithContent(
    modal: Container,
    children: Container[] = [],
    options: ModalAnimationOptions & { childDelay?: number } = {},
): () => void {
    const { duration = 300, childDelay = 100, onComplete } = options;

    let cancelMain: (() => void) | null = null;
    const cancelChildren: Array<() => void> = [];

    // Animate main modal
    cancelMain = animateModalEntrance(modal, {
        duration,
        onComplete: () => {
            // Stagger children entrance after modal appears
            children.forEach((child, index) => {
                const delay = index * childDelay;
                setTimeout(() => {
                    child.alpha = 0;
                    const cancel = animateAlpha(child, 0, 1, {
                        duration: duration * 0.7,
                        easing: easeOut,
                    });
                    cancelChildren.push(cancel);
                }, delay);
            });

            // Calculate when all children are done
            const lastChildStart = (children.length - 1) * childDelay;
            const lastChildDuration = duration * 0.7;
            const totalTime = lastChildStart + lastChildDuration;

            setTimeout(() => {
                onComplete?.();
            }, totalTime);
        },
    });

    const cancel = () => {
        cancelMain?.();
        cancelChildren.forEach((c) => c?.());
    };

    return cancel;
}
