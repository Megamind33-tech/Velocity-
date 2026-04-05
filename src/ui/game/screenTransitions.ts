/**
 * Screen Transitions — Professional UI transitions between game screens.
 *
 * DESIGN RULES:
 *   - Crossfade: 300ms, fade out current + fade in next
 *   - Slide: 300ms, slide out current, slide in next
 *   - Zoom: 300ms, zoom out current, zoom in next
 *   - All transitions maintain 60fps
 *   - No blocking: animations run in parallel when possible
 */

import { Container } from 'pixi.js';
import {
    easeOut,
    easeIn,
    easeInOut,
    animateAlpha,
    animateScale,
    animatePosition,
} from './animationHelpers';
import { AnimationManager } from './AnimationManager';

interface TransitionOptions {
    duration?: number;
    onComplete?: () => void;
}

/**
 * Crossfade transition: fade out current screen, fade in next.
 * @param currentScreen Screen to fade out
 * @param nextScreen Screen to fade in
 * @param options Transition options
 * @returns Cancel function
 */
export function animateCrossfade(
    currentScreen: Container,
    nextScreen: Container,
    options: TransitionOptions = {},
): () => void {
    const { duration = 300, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    nextScreen.alpha = 0;
    currentScreen.alpha = 1;

    let cancelCount = 0;
    let fadeOut: (() => void) | null = null;
    let fadeIn: (() => void) | null = null;

    const checkComplete = () => {
        cancelCount++;
        if (cancelCount === 2) {
            currentScreen.alpha = 0;
            nextScreen.alpha = 1;
            onComplete?.();
        }
    };

    // Fade out current
    fadeOut = animateAlpha(currentScreen, 1, 0, {
        duration,
        easing: easeIn,
        onComplete: checkComplete,
    });

    // Fade in next
    fadeIn = animateAlpha(nextScreen, 0, 1, {
        duration,
        easing: easeOut,
        onComplete: checkComplete,
    });

    const cancel = () => {
        fadeOut?.();
        fadeIn?.();
    };

    return animManager.register(cancel, {
        priority: 'high',
        group: 'transition-crossfade',
        onComplete,
    });
}

/**
 * Slide transition: slide current out, slide next in.
 * @param currentScreen Screen to slide out
 * @param nextScreen Screen to slide in
 * @param direction 'left', 'right', 'up', 'down'
 * @param options Transition options
 * @returns Cancel function
 */
export function animateSlide(
    currentScreen: Container,
    nextScreen: Container,
    direction: 'left' | 'right' | 'up' | 'down' = 'left',
    options: TransitionOptions = {},
): () => void {
    const { duration = 300, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    const width = currentScreen.width || 430;
    const height = currentScreen.height || 800;

    let fromX = 0, fromY = 0, toX = 0, toY = 0;
    let nextFromX = 0, nextFromY = 0, nextToX = 0, nextToY = 0;

    // Calculate slide vectors based on direction
    if (direction === 'left') {
        toX = -width;
        nextFromX = width;
    } else if (direction === 'right') {
        toX = width;
        nextFromX = -width;
    } else if (direction === 'up') {
        toY = -height;
        nextFromY = height;
    } else if (direction === 'down') {
        toY = height;
        nextFromY = -height;
    }

    nextScreen.position.set(nextFromX, nextFromY);

    let cancelCount = 0;
    let slideOut: (() => void) | null = null;
    let slideIn: (() => void) | null = null;

    const checkComplete = () => {
        cancelCount++;
        if (cancelCount === 2) {
            currentScreen.position.set(toX, toY);
            nextScreen.position.set(nextToX, nextToY);
            onComplete?.();
        }
    };

    // Slide out current
    slideOut = animatePosition(
        currentScreen,
        { x: fromX, y: fromY },
        { x: toX, y: toY },
        {
            duration,
            easing: easeIn,
            onComplete: checkComplete,
        }
    );

    // Slide in next
    slideIn = animatePosition(
        nextScreen,
        { x: nextFromX, y: nextFromY },
        { x: nextToX, y: nextToY },
        {
            duration,
            easing: easeOut,
            onComplete: checkComplete,
        }
    );

    const cancel = () => {
        slideOut?.();
        slideIn?.();
    };

    return animManager.register(cancel, {
        priority: 'high',
        group: 'transition-slide',
        onComplete,
    });
}

/**
 * Zoom transition: zoom out current, zoom in next.
 * @param currentScreen Screen to zoom out
 * @param nextScreen Screen to zoom in
 * @param options Transition options
 * @returns Cancel function
 */
export function animateZoom(
    currentScreen: Container,
    nextScreen: Container,
    options: TransitionOptions = {},
): () => void {
    const { duration = 300, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    nextScreen.scale.set(1.1, 1.1);
    nextScreen.alpha = 0;
    currentScreen.alpha = 1;

    let cancelCount = 0;
    let zoomOut: (() => void) | null = null;
    let zoomIn: (() => void) | null = null;
    let fadeOut: (() => void) | null = null;
    let fadeIn: (() => void) | null = null;

    const checkComplete = () => {
        cancelCount++;
        if (cancelCount === 4) {
            currentScreen.alpha = 0;
            nextScreen.alpha = 1;
            nextScreen.scale.set(1, 1);
            onComplete?.();
        }
    };

    // Zoom out and fade current
    zoomOut = animateScale(currentScreen, 1.0, 0.9, {
        duration,
        easing: easeIn,
        onComplete: checkComplete,
    });

    fadeOut = animateAlpha(currentScreen, 1, 0, {
        duration,
        easing: easeIn,
        onComplete: checkComplete,
    });

    // Zoom in and fade next
    zoomIn = animateScale(nextScreen, 1.1, 1.0, {
        duration,
        easing: easeOut,
        onComplete: checkComplete,
    });

    fadeIn = animateAlpha(nextScreen, 0, 1, {
        duration,
        easing: easeOut,
        onComplete: checkComplete,
    });

    const cancel = () => {
        zoomOut?.();
        zoomIn?.();
        fadeOut?.();
        fadeIn?.();
    };

    return animManager.register(cancel, {
        priority: 'high',
        group: 'transition-zoom',
        onComplete,
    });
}

/**
 * Dissolve transition: fade with slight scale distortion.
 * @param currentScreen Screen to dissolve out
 * @param nextScreen Screen to appear
 * @param options Transition options
 * @returns Cancel function
 */
export function animateDissolve(
    currentScreen: Container,
    nextScreen: Container,
    options: TransitionOptions = {},
): () => void {
    const { duration = 300, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    nextScreen.alpha = 0;
    nextScreen.scale.set(0.98, 0.98);

    let cancelCount = 0;
    let fadeOut: (() => void) | null = null;
    let fadeIn: (() => void) | null = null;
    let distort: (() => void) | null = null;
    let restore: (() => void) | null = null;

    const checkComplete = () => {
        cancelCount++;
        if (cancelCount === 4) {
            currentScreen.alpha = 0;
            nextScreen.alpha = 1;
            nextScreen.scale.set(1, 1);
            onComplete?.();
        }
    };

    // Fade out current
    fadeOut = animateAlpha(currentScreen, 1, 0, {
        duration,
        easing: easeIn,
        onComplete: checkComplete,
    });

    // Distort current slightly
    distort = animateScale(currentScreen, 1.0, 1.02, {
        duration: duration * 0.5,
        easing: easeOut,
        onComplete: () => {
            // Then shrink
            restore = animateScale(currentScreen, 1.02, 0.95, {
                duration: duration * 0.5,
                easing: easeIn,
                onComplete: checkComplete,
            });
        },
    });

    // Fade in next with scale
    fadeIn = animateAlpha(nextScreen, 0, 1, {
        duration,
        easing: easeOut,
        onComplete: checkComplete,
    });

    const scaleRestore = animateScale(nextScreen, 0.98, 1.0, {
        duration,
        easing: easeOut,
        onComplete: checkComplete,
    });

    const cancel = () => {
        fadeOut?.();
        distort?.();
        restore?.();
        fadeIn?.();
        scaleRestore?.();
    };

    return animManager.register(cancel, {
        priority: 'high',
        group: 'transition-dissolve',
        onComplete,
    });
}
