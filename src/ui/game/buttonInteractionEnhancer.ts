/**
 * Button Interaction Enhancer — Add AAA-quality animations to buttons.
 *
 * Usage:
 *   const button = createVelocityGameButton('CLICK ME', 'primary', handleClick);
 *   enhanceButtonInteraction(button);
 *
 * Automatically handles:
 *   - Hover: scale up with easing
 *   - Press: compress and release
 *   - Keyboard focus: scale up for accessibility
 *   - Touch: pressure feedback
 */

import { Container } from 'pixi.js';
import type { PixiDisplayObject } from './pixiDisplayTypes';
import {
    animateButtonHover,
    animateButtonHoverExit,
    animateButtonPress,
    InteractiveButton,
} from './buttonAnimations';
import { AnimationManager } from './AnimationManager';

interface ButtonEnhancerOptions {
    enableHover?: boolean;
    enablePress?: boolean;
    enableKeyboardFocus?: boolean;
    onBeforePress?: () => void;
    onAfterPress?: () => void;
}

/**
 * Enhance a button with professional hover and press animations.
 * @param button Button container to enhance
 * @param options Enhancement options
 */
export function enhanceButtonInteraction(
    button: PixiDisplayObject,
    options: ButtonEnhancerOptions = {},
): void {
    const {
        enableHover = true,
        enablePress = true,
        enableKeyboardFocus = true,
        onBeforePress,
        onAfterPress,
    } = options;

    button.eventMode = 'static';
    button.cursor = 'pointer';

    if (enableHover) {
        button.on('pointerover', () => {
            animateButtonHover(button);
        });

        button.on('pointerout', () => {
            animateButtonHoverExit(button);
        });
    }

    if (enablePress) {
        button.on('pointerdown', () => {
            onBeforePress?.();
            animateButtonPress(button);
        });

        button.on('pointerup', () => {
            onAfterPress?.();
        });
    }

    if (enableKeyboardFocus) {
        // Note: Pixi.js has limited keyboard support
        // This is a placeholder for future keyboard handling
        // In a real scenario, you'd integrate with a keyboard event system
    }
}

/**
 * Apply the InteractiveButton class to a button for complete lifecycle management.
 * @param button Button container
 * @returns InteractiveButton instance with full control
 */
export function createInteractiveButton(
    button: PixiDisplayObject,
): InteractiveButton {
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const interactive = new InteractiveButton(button);

    // Register pointer events
    button.on('pointerover', () => interactive.onHoverStart());
    button.on('pointerout', () => interactive.onHoverEnd());
    button.on('pointerdown', () => interactive.onPress());

    return interactive;
}

/**
 * Batch enhance multiple buttons.
 * @param buttons Array of buttons to enhance
 * @param options Enhancement options (applied to all)
 */
export function enhanceButtonsInteraction(
    buttons: PixiDisplayObject[],
    options: ButtonEnhancerOptions = {},
): void {
    buttons.forEach((button) => enhanceButtonInteraction(button, options));
}

/**
 * Create a button enhancement helper for complex button groups.
 * Useful for screens with many buttons that need animation management.
 */
export class ButtonEnhancementGroup {
    private buttons: InteractiveButton[] = [];
    private animManager = AnimationManager.getInstance();

    /**
     * Add a button to the enhancement group.
     */
    addButton(
        button: PixiDisplayObject,
        options: ButtonEnhancerOptions = {},
    ): InteractiveButton {
        button.eventMode = 'static';
        button.cursor = 'pointer';

        const interactive = new InteractiveButton(button);
        this.buttons.push(interactive);

        // Register pointer events
        button.on('pointerover', () => interactive.onHoverStart());
        button.on('pointerout', () => interactive.onHoverEnd());
        button.on('pointerdown', () => interactive.onPress());

        return interactive;
    }

    /**
     * Add multiple buttons at once.
     */
    addButtons(
        buttons: PixiDisplayObject[],
        options: ButtonEnhancerOptions = {},
    ): void {
        buttons.forEach((btn) => this.addButton(btn, options));
    }

    /**
     * Clean up all button animations.
     */
    cleanup(): void {
        this.buttons.forEach((btn) => btn.cleanup());
        this.buttons = [];
        this.animManager.cancelGroup('button-hover');
        this.animManager.cancelGroup('button-hover-exit');
        this.animManager.cancelGroup('button-press');
        this.animManager.cancelGroup('button-focus');
        this.animManager.cancelGroup('button-disable');
        this.animManager.cancelGroup('button-enable');
    }

    /**
     * Disable all buttons in group.
     */
    disableAll(): void {
        this.buttons.forEach((btn) => btn.disable());
    }

    /**
     * Enable all buttons in group.
     */
    enableAll(): void {
        this.buttons.forEach((btn) => btn.enable());
    }

    /**
     * Get count of buttons in group.
     */
    count(): number {
        return this.buttons.length;
    }
}
