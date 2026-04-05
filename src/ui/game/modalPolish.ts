/**
 * Modal Polish Effects — Add subtle continuous animations to modal titles and decorative elements.
 *
 * Professional touches that enhance the AAA game feel:
 *   - Title glow pulse: Subtle breathing effect
 *   - Accent decorations: Shimmer and rotation effects
 *   - Success indicators: Celebratory pulse animations
 */

import { Text, Graphics, Container } from 'pixi.js';
import type { PixiDisplayObject } from './pixiDisplayTypes';
import { createGlowPulse, createShimmer, createPulseScale } from './polishEffects';
import { AnimationManager } from './AnimationManager';

/**
 * Apply subtle glow pulse effect to modal title text.
 * Creates a breathing, elegant effect that draws attention without being distracting.
 * @param titleText Text object (usually modal title)
 * @param minAlpha Minimum glow alpha (default 0.3)
 * @param maxAlpha Maximum glow alpha (default 0.6)
 * @returns Cancel function
 */
export function applyModalTitleGlow(
    titleText: Text,
    minAlpha: number = 0.3,
    maxAlpha: number = 0.6,
): () => void {
    const animManager = AnimationManager.getInstance();
    let isCancelled = false;

    // Apply glow pulse using animationManager
    const glowEffect = {
        alpha: maxAlpha,
    };

    const startPulse = () => {
        if (isCancelled) return;

        // Pulse the text alpha slightly for emphasis
        const cancel = animateTextAlpha(titleText, maxAlpha, minAlpha, 750, () => {
            if (isCancelled) return;
            const cancel2 = animateTextAlpha(titleText, minAlpha, maxAlpha, 750, startPulse);
        });
    };

    startPulse();

    const cancel = () => {
        isCancelled = true;
    };

    return animManager.register(cancel, {
        priority: 'low',
        group: 'modal-title-glow',
    });
}

/**
 * Animate text alpha with easing.
 * Helper for smooth text glow effects.
 */
function animateTextAlpha(
    text: Text,
    fromAlpha: number,
    toAlpha: number,
    duration: number,
    onComplete?: () => void,
): () => void {
    const startTime = Date.now();
    const startAlpha = text.alpha;

    return new Promise<void>((resolve) => {
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out curve
            const eased = 1 - Math.pow(1 - progress, 3);
            text.alpha = fromAlpha + (toAlpha - fromAlpha) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                text.alpha = toAlpha;
                onComplete?.();
                resolve();
            }
        };

        requestAnimationFrame(animate);
    }) as any;
}

/**
 * Apply celebratory pulse effect to achievement/completion indicators.
 * Used for star displays, achievement badges, etc.
 * @param element Element to apply effect to
 * @param minScale Minimum scale (default 0.95)
 * @param maxScale Maximum scale (default 1.08)
 * @param duration Pulse duration in ms (default 1200)
 * @returns Cancel function
 */
export function applyCelebratoryPulse(
    element: PixiDisplayObject,
    minScale: number = 0.95,
    maxScale: number = 1.08,
    duration: number = 1200,
): () => void {
    return createPulseScale(element, minScale, maxScale, duration, { loop: true });
}

/**
 * Apply shimmer effect to text or icons for attention-drawing.
 * Useful for new items, special achievements, etc.
 * @param element Element to shimmer
 * @returns Cancel function
 */
export function applyShimmerEffect(element: PixiDisplayObject): () => void {
    return createShimmer(element, { loop: true });
}

/**
 * Create a glow frame decoration for modals.
 * Visual enhancement that frames the modal content.
 * @param width Frame width
 * @param height Frame height
 * @returns Graphics container with glow effect
 */
export function createModalGlowFrame(
    width: number,
    height: number,
    glowColor: number = 0x4ade80,
): Container {
    const container = new Container();

    // Outer glow ring
    const outerGlow = new Graphics();
    outerGlow.rect(0, 0, width, height);
    outerGlow.stroke({ color: glowColor, width: 2, alpha: 0.3 });
    container.addChild(outerGlow);

    // Corner accents
    const cornerSize = 12;
    const corners = new Graphics();

    // Top-left
    corners.moveTo(cornerSize, 0).lineTo(0, 0).lineTo(0, cornerSize);
    corners.stroke({ color: glowColor, width: 2, alpha: 0.6 });

    // Top-right
    corners.moveTo(width - cornerSize, 0).lineTo(width, 0).lineTo(width, cornerSize);
    corners.stroke({ color: glowColor, width: 2, alpha: 0.6 });

    // Bottom-left
    corners.moveTo(0, height - cornerSize).lineTo(0, height).lineTo(cornerSize, height);
    corners.stroke({ color: glowColor, width: 2, alpha: 0.6 });

    // Bottom-right
    corners.moveTo(width - cornerSize, height).lineTo(width, height).lineTo(width, height - cornerSize);
    corners.stroke({ color: glowColor, width: 2, alpha: 0.6 });

    container.addChild(corners);

    return container;
}

/**
 * Apply success flash and pulse for positive feedback.
 * Use after level completion, achievement unlock, etc.
 * @param element Element to enhance
 * @returns Cancel function
 */
export function applySuccessEnhancement(element: PixiDisplayObject): () => void {
    const animManager = AnimationManager.getInstance();

    // Combine flash + pulse for celebration feel
    let cancelled = false;
    let pulseCancel: (() => void) | null = null;

    // Initial brief scale pop
    element.scale.set(1, 1);

    const cancel = animateValue(1, 1.1, 150, (value) => {
        element.scale.set(value, value);
    }, (t) => {
        return Math.sin(t * Math.PI) * 0.5 + 0.5;
    }, () => {
        if (!cancelled) {
            // Then settle with subtle pulse
            pulseCancel = createPulseScale(element, 1, 1.02, 1500, { loop: false });
        }
    });

    return animManager.register(() => {
        cancelled = true;
        cancel();
        pulseCancel?.();
    }, {
        priority: 'normal',
        group: 'polish-success',
    });
}

// Helper for smooth value animation
function animateValue(
    from: number,
    to: number,
    duration: number,
    onUpdate: (value: number) => void,
    easing: (t: number) => number,
    onComplete?: () => void,
): () => void {
    const startTime = Date.now();
    let cancelled = false;

    const animate = () => {
        if (cancelled) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easing(progress);
        const value = from + (to - from) * eased;

        onUpdate(value);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            onComplete?.();
        }
    };

    requestAnimationFrame(animate);

    return () => {
        cancelled = true;
    };
}
