/**
 * Content Animations — Text reveals, score count-ups, and list reveals for AAA polish.
 *
 * DESIGN RULES:
 *   - Score count-up: 1000ms, ease-out, numeric animation
 *   - Text reveal: 400-600ms, letter-by-letter or word-by-word
 *   - List stagger: 50ms between items, total 200-400ms
 *   - All animations maintain visual hierarchy
 */

import { Color, Text, Container } from 'pixi.js';
import type { PixiDisplayObject } from './pixiDisplayTypes';
import {
    easeOut,
    linear,
    animateAlpha,
    animateValue,
} from './animationHelpers';
import { AnimationManager } from './AnimationManager';

interface ContentAnimationOptions {
    duration?: number;
    onComplete?: () => void;
}

/**
 * Animate score count-up: gradually reveal score with easing.
 * @param scoreText Text object displaying score
 * @param fromScore Starting score value
 * @param toScore Target score value
 * @param options Animation options
 * @returns Cancel function
 */
export function animateScoreCountUp(
    scoreText: Text,
    fromScore: number,
    toScore: number,
    options: ContentAnimationOptions = {},
): () => void {
    const { duration = 1000, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    const cancel = animateValue(fromScore, toScore, duration, (value) => {
        scoreText.text = Math.floor(value).toString();
    }, easeOut, onComplete);

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'content-score',
        onComplete,
    });
}

/**
 * Animate text appearance: fade in + letter-by-letter reveal.
 * @param textObj Text object to animate
 * @param fullText Complete text to display
 * @param options Animation options
 * @returns Cancel function
 */
export function animateTextReveal(
    textObj: Text,
    fullText: string,
    options: ContentAnimationOptions & { letterDelay?: number } = {},
): () => void {
    const { duration = 500, letterDelay = 25, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    textObj.text = '';
    textObj.alpha = 1;

    let letterIndex = 0;
    const letters = fullText.split('');
    const cancels: Array<() => void> = [];

    const revealLetter = () => {
        if (letterIndex < letters.length) {
            textObj.text += letters[letterIndex];
            letterIndex++;
            const timeout = setTimeout(revealLetter, letterDelay);
            cancels.push(() => clearTimeout(timeout));
        } else {
            textObj.text = fullText;
            onComplete?.();
        }
    };

    revealLetter();

    const cancel = () => {
        cancels.forEach((c) => c?.());
        textObj.text = fullText;
    };

    return animManager.register(cancel, {
        priority: 'low',
        group: 'content-text-reveal',
        onComplete,
    });
}

/**
 * Animate list item reveal: fade in items with stagger.
 * @param items Array of display objects to reveal
 * @param options Animation options
 * @returns Cancel function
 */
export function animateListReveal(
    items: PixiDisplayObject[],
    options: ContentAnimationOptions & { itemDelay?: number } = {},
): () => void {
    const { duration = 300, itemDelay = 50, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    // Start all items invisible
    items.forEach((item) => {
        item.alpha = 0;
    });

    let cancelCount = 0;
    const cancels: Array<() => void> = [];

    const checkComplete = () => {
        cancelCount++;
        if (cancelCount === items.length) {
            onComplete?.();
        }
    };

    // Fade in each item with stagger
    items.forEach((item, index) => {
        const delay = index * itemDelay;
        const timeout = setTimeout(() => {
            const cancel = animateAlpha(item, 0, 1, {
                duration,
                easing: easeOut,
                onComplete: checkComplete,
            });
            cancels.push(cancel);
        }, delay);

        cancels.push(() => clearTimeout(timeout));
    });

    const cancel = () => {
        cancels.forEach((c) => c?.());
    };

    return animManager.register(cancel, {
        priority: 'low',
        group: 'content-list',
        onComplete,
    });
}

/**
 * Animate achievement or stat: pop + appear.
 * Combines scale and alpha for impact.
 * @param statObj Container to animate
 * @param options Animation options
 * @returns Cancel function
 */
export function animateStatPop(
    statObj: PixiDisplayObject,
    options: ContentAnimationOptions = {},
): () => void {
    const { duration = 400, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    statObj.alpha = 0;
    statObj.scale.set(0.5, 0.5);

    const cancels: Array<() => void> = [];
    let cancelCount = 0;
    let fade: (() => void) | null = null;
    let scale: (() => void) | null = null;

    const checkComplete = () => {
        cancelCount++;
        if (cancelCount === 2) {
            statObj.alpha = 1;
            statObj.scale.set(1, 1);
            onComplete?.();
        }
    };

    fade = animateAlpha(statObj, 0, 1, {
        duration: duration * 0.6,
        easing: easeOut,
    });

    const cancel2 = animateValue(0.5, 1.15, duration * 0.6, (value) => {
        statObj.scale.set(value, value);
    }, easeOut, () => {
        scale = animateValue(1.15, 1.0, duration * 0.4, (value) => {
            statObj.scale.set(value, value);
        }, easeOut, checkComplete);
    });

    cancels.push(cancel2);

    const cancel = () => {
        fade?.();
        scale?.();
        cancels.forEach((c) => c?.());
    };

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'content-pop',
        onComplete,
    });
}

/**
 * Animate star reveal: pop each star in sequence.
 * Used for achievement star displays.
 * @param starObjects Array of star sprites/objects
 * @param options Animation options
 * @returns Cancel function
 */
export function animateStarReveal(
    starObjects: PixiDisplayObject[],
    options: ContentAnimationOptions & { starDelay?: number } = {},
): () => void {
    const { duration = 300, starDelay = 150, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    // Make all stars invisible and small
    starObjects.forEach((star) => {
        star.alpha = 0;
        star.scale.set(0.3, 0.3);
    });

    let cancelCount = 0;
    const cancels: Array<() => void> = [];

    const checkComplete = () => {
        cancelCount++;
        if (cancelCount === starObjects.length) {
            onComplete?.();
        }
    };

    // Animate each star with stagger and pop effect
    starObjects.forEach((star, index) => {
        const delay = index * starDelay;
        const timeout = setTimeout(() => {
            let fadeDone = false;
            let scaleDone = false;

            // Fade
            const fadeCanccel = animateAlpha(star, 0, 1, {
                duration: duration * 0.7,
                easing: easeOut,
                onComplete: () => {
                    fadeDone = true;
                    if (scaleDone) checkComplete();
                },
            });
            cancels.push(fadeCanccel);

            // Pop scale
            const popCancel = animateValue(0.3, 1.2, duration * 0.5, (value) => {
                star.scale.set(value, value);
            }, easeOut, () => {
                const settleCancel = animateValue(1.2, 1.0, duration * 0.5, (value) => {
                    star.scale.set(value, value);
                }, easeOut, () => {
                    scaleDone = true;
                    if (fadeDone) checkComplete();
                });
                cancels.push(settleCancel);
            });
            cancels.push(popCancel);
        }, delay);

        cancels.push(() => clearTimeout(timeout));
    });

    const cancel = () => {
        cancels.forEach((c) => c?.());
    };

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'content-stars',
        onComplete,
    });
}

/**
 * Animate balance/currency update: pop with color flash.
 * @param currencyText Text displaying currency
 * @param fromValue Starting value
 * @param toValue Target value
 * @param options Animation options
 * @returns Cancel function
 */
export function animateCurrencyUpdate(
    currencyText: Text,
    fromValue: number,
    toValue: number,
    options: ContentAnimationOptions = {},
): () => void {
    const { duration = 800, onComplete } = options;
    const animManager = AnimationManager.getInstance();

    const isPositive = toValue > fromValue;
    const fillSrc = currencyText.style.fill;
    const origNum = typeof fillSrc === 'number' ? fillSrc : 0xf0f0f0;
    const orig = new Color(origNum);
    const flash = new Color(isPositive ? 0x4ade80 : 0xef4444);

    let cancelCount = 0;
    let textCancel: (() => void) | null = null;
    let colorCancel: (() => void) | null = null;

    const checkComplete = () => {
        cancelCount++;
        if (cancelCount === 2) {
            currencyText.style.fill = orig;
            onComplete?.();
        }
    };

    // Count up or down
    textCancel = animateValue(fromValue, toValue, duration * 0.8, (value) => {
        currencyText.text = Math.floor(value).toString();
    }, easeOut);

    // Flash color: original → flash → original
    colorCancel = animateValue(0, 1, duration * 0.4, (t) => {
        const blend = Math.sin(t * Math.PI) * 0.7;
        const r = orig.red * (1 - blend) + flash.red * blend;
        const g = orig.green * (1 - blend) + flash.green * blend;
        const b = orig.blue * (1 - blend) + flash.blue * blend;
        currencyText.style.fill = new Color({ r, g, b });
    }, easeOut, () => {
        currencyText.style.fill = orig;
        checkComplete();
    });

    const cancel = () => {
        textCancel?.();
        colorCancel?.();
    };

    return animManager.register(cancel, {
        priority: 'normal',
        group: 'content-currency',
        onComplete,
    });
}
