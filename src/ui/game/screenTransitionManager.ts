/**
 * Screen Transition Manager — Orchestrate professional transitions between screens.
 *
 * Works with GameUIManager to provide:
 *   - Crossfade transitions (default)
 *   - Slide transitions (directional)
 *   - Zoom transitions (emphasis)
 *   - Custom transition sequences
 */

import { Container } from 'pixi.js';
import {
    animateCrossfade,
    animateSlide,
    animateZoom,
} from './screenTransitions';
import { AnimationManager } from './AnimationManager';

export type TransitionType = 'crossfade' | 'slide' | 'zoom' | 'none';
export type TransitionDirection = 'left' | 'right' | 'up' | 'down';

interface TransitionConfig {
    type: TransitionType;
    direction?: TransitionDirection;
    duration?: number;
    onComplete?: () => void;
}

/**
 * Screen transition orchestrator.
 * Manages transitions between game screens with professional animations.
 */
export class ScreenTransitionManager {
    private static instance: ScreenTransitionManager;
    private animManager = AnimationManager.getInstance();
    private isTransitioning = false;
    private lastTransitionConfig: TransitionConfig | null = null;
    private defaultConfig: TransitionConfig = {
        type: 'crossfade',
        duration: 300,
    };

    private constructor() {}

    /**
     * Get singleton instance
     */
    static getInstance(): ScreenTransitionManager {
        if (!ScreenTransitionManager.instance) {
            ScreenTransitionManager.instance = new ScreenTransitionManager();
        }
        return ScreenTransitionManager.instance;
    }

    /**
     * Set default transition configuration.
     * Applied to all transitions unless overridden.
     */
    setDefaultConfig(config: Partial<TransitionConfig>): void {
        this.defaultConfig = {
            ...this.defaultConfig,
            ...config,
        };
    }

    /**
     * Transition from one screen to another.
     * @param currentScreen Screen container to transition from
     * @param nextScreen Screen container to transition to
     * @param config Transition configuration
     */
    async transitionScreens(
        currentScreen: Container | null,
        nextScreen: Container,
        config: Partial<TransitionConfig> = {},
    ): Promise<void> {
        // Don't overlap transitions
        if (this.isTransitioning) {
            return;
        }

        this.isTransitioning = true;
        const finalConfig = {
            ...this.defaultConfig,
            ...config,
        };

        this.lastTransitionConfig = finalConfig;

        return new Promise<void>((resolve) => {
            if (!currentScreen || finalConfig.type === 'none') {
                // No current screen or no animation requested
                nextScreen.visible = true;
                this.isTransitioning = false;
                resolve();
                return;
            }

            const onComplete = () => {
                this.isTransitioning = false;
                finalConfig.onComplete?.();
                resolve();
            };

            const duration = finalConfig.duration ?? 300;

            switch (finalConfig.type) {
                case 'crossfade':
                    animateCrossfade(currentScreen, nextScreen, {
                        duration,
                        onComplete,
                    });
                    break;

                case 'slide':
                    animateSlide(
                        currentScreen,
                        nextScreen,
                        finalConfig.direction ?? 'left',
                        {
                            duration,
                            onComplete,
                        }
                    );
                    break;

                case 'zoom':
                    animateZoom(currentScreen, nextScreen, {
                        duration,
                        onComplete,
                    });
                    break;

                default:
                    currentScreen.visible = false;
                    nextScreen.visible = true;
                    this.isTransitioning = false;
                    resolve();
                    break;
            }
        });
    }

    /**
     * Get current transition state.
     */
    isTransitioningNow(): boolean {
        return this.isTransitioning;
    }

    /**
     * Get the last transition configuration used.
     */
    getLastTransition(): TransitionConfig | null {
        return this.lastTransitionConfig;
    }

    /**
     * Cancel any active transitions.
     */
    cancelTransition(): void {
        this.animManager.cancelGroup('transition-crossfade');
        this.animManager.cancelGroup('transition-slide');
        this.animManager.cancelGroup('transition-zoom');
        this.isTransitioning = false;
    }

    /**
     * Create a predefined transition sequence (for complex multi-screen flows).
     * @param screens Array of screen containers
     * @param config Transition configuration
     */
    async transitionSequence(
        screens: Container[],
        config: Partial<TransitionConfig> = {},
    ): Promise<void> {
        for (let i = 0; i < screens.length - 1; i++) {
            await this.transitionScreens(screens[i], screens[i + 1], config);
        }
    }
}

/**
 * Helper function for quick transitions without creating the full manager.
 * Useful for one-off transitions.
 */
export async function quickTransition(
    current: Container | null,
    next: Container,
    type: TransitionType = 'crossfade',
    duration: number = 300,
): Promise<void> {
    const manager = ScreenTransitionManager.getInstance();
    return manager.transitionScreens(current, next, { type, duration });
}
