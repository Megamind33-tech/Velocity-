/**
 * GameUIManager: Master UI system for Velocity
 * Manages all game screens and UI state
 * Game-focused architecture with proper screen management
 * Includes professional screen transition animations
 */

import { Container, Application } from 'pixi.js';
import { ResponsiveUIManager } from '../ResponsiveUIManager';
import { ScreenTransitionManager } from './screenTransitionManager';

export type ScreenType =
    | 'main-menu'
    | 'in-game-hud'
    | 'pause'
    | 'game-over'
    | 'settings'
    | 'leaderboard'
    | 'level-complete'
    | 'store'
    | 'hangar'
    | 'achievements'
    | 'rewards';

/**
 * Base screen interface
 */
export interface IGameScreen {
    container: Container;
    show(): void;
    hide(): void;
    update?(deltaTime: number): void;
    resize?(width: number, height: number): void;
    dispose?(): void;
}

/**
 * GameUIManager - Central UI controller
 */
export class GameUIManager {
    private static instance: GameUIManager;

    private app: Application;
    private responsiveManager: ResponsiveUIManager;
    private transitionManager: ScreenTransitionManager;
    private uiLayer: Container;
    private screens: Map<ScreenType, IGameScreen> = new Map();
    private currentScreen: ScreenType | null = null;
    private previousScreen: ScreenType | null = null;

    private constructor(app: Application) {
        this.app = app;
        this.responsiveManager = ResponsiveUIManager.getInstance();
        this.transitionManager = ScreenTransitionManager.getInstance();

        // Create UI layer
        this.uiLayer = new Container();
        this.uiLayer.name = 'game-ui-layer';
        this.app.stage.addChild(this.uiLayer);

        // Listen for screen resize
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => this.handleResize());
    }

    /**
     * Initialize the GameUIManager singleton
     */
    public static init(app: Application): GameUIManager {
        if (!GameUIManager.instance) {
            GameUIManager.instance = new GameUIManager(app);
        }
        return GameUIManager.instance;
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): GameUIManager {
        if (!GameUIManager.instance) {
            throw new Error('GameUIManager not initialized. Call GameUIManager.init(app) first.');
        }
        return GameUIManager.instance;
    }

    /**
     * Register a screen with the UI manager
     */
    public registerScreen(type: ScreenType, screen: IGameScreen): void {
        this.screens.set(type, screen);
        this.uiLayer.addChild(screen.container);
        screen.hide(); // Hide by default
        console.log(`✓ Screen registered: ${type}`);
    }

    /**
     * Show a screen and hide the current one with professional transition animation.
     * ASYNC VERSION - Returns Promise that resolves when transition completes
     * @param type Screen type to show
     * @param hideCurrentScreen Whether to hide the current screen (default: true)
     * @param transitionType Type of transition (default: 'crossfade')
     */
    public async showScreen(
        type: ScreenType,
        hideCurrentScreen: boolean = true,
        transitionType: 'crossfade' | 'slide' | 'zoom' | 'none' = 'crossfade',
    ): Promise<void> {
        const newScreen = this.screens.get(type);
        if (!newScreen) {
            console.warn(`Screen not found: ${type}`);
            return;
        }

        const currentScreenObj = this.currentScreen ? this.screens.get(this.currentScreen) : null;

        // Store previous screen before transition
        this.previousScreen = this.currentScreen;

        // Show new screen (but keep hidden during transition if animating)
        newScreen.show();
        this.currentScreen = type;

        // Execute transition animation if requested and there's a current screen
        if (hideCurrentScreen && currentScreenObj && transitionType !== 'none') {
            await this.transitionManager.transitionScreens(
                currentScreenObj.container,
                newScreen.container,
                { type: transitionType, duration: 300 }
            );
            // Transitions only tween alpha; invisible containers still intercept pointers
            // and sit above older siblings — must fully hide the outgoing screen.
            currentScreenObj.hide();
            currentScreenObj.container.alpha = 1;
        } else if (hideCurrentScreen && currentScreenObj) {
            currentScreenObj.hide();
        }

        if (newScreen.container.alpha < 1) {
            newScreen.container.alpha = 1;
        }

        console.log(`→ Screen shown: ${type} (transition: ${transitionType})`);
    }

    /**
     * Synchronous wrapper for backwards compatibility.
     * Use for code that doesn't support async/await.
     * Transitions happen in background, not blocking.
     * @deprecated Use await showScreen() instead for proper async handling
     */
    public showScreenSync(
        type: ScreenType,
        hideCurrentScreen: boolean = true,
        transitionType: 'crossfade' | 'slide' | 'zoom' | 'none' = 'none',
    ): void {
        // Start async transition in background (fire and forget)
        this.showScreen(type, hideCurrentScreen, transitionType).catch((error) => {
            console.error(`Error showing screen ${type}:`, error);
        });
    }

    /**
     * Hide every registered screen and clear navigation stack.
     * Use when showing world gameplay layers (e.g. mission map) outside the screen system.
     */
    public hideAllScreens(): void {
        for (const [, screen] of this.screens) {
            screen.hide();
        }
        this.currentScreen = null;
        this.previousScreen = null;
    }

    /**
     * Hide specific screen
     */
    public hideScreen(type: ScreenType): void {
        const screen = this.screens.get(type);
        if (screen) {
            screen.hide();
            if (this.currentScreen === type) {
                this.currentScreen = null;
            }
        }
    }

    /**
     * Get current screen type
     */
    public getCurrentScreen(): ScreenType | null {
        return this.currentScreen;
    }

    /**
     * Go back to previous screen with transition animation
     */
    public async goBack(): Promise<void> {
        const prev = this.previousScreen;
        const cur = this.currentScreen;
        if (!prev || prev === cur) {
            await this.showScreen('main-menu', true, 'crossfade');
            return;
        }
        await this.showScreen(prev, true, 'crossfade');
    }

    /**
     * Check if screen is currently displayed
     */
    public isScreenActive(type: ScreenType): boolean {
        return this.currentScreen === type;
    }

    /**
     * Get screen by type
     */
    public getScreen(type: ScreenType): IGameScreen | undefined {
        return this.screens.get(type);
    }

    /**
     * Update active screen
     */
    public update(deltaTime: number): void {
        const screen = this.screens.get(this.currentScreen!);
        if (screen && screen.update) {
            screen.update(deltaTime);
        }
    }

    /**
     * Handle window resize
     */
    private handleResize(): void {
        for (const [type, screen] of this.screens) {
            if (screen.resize) {
                screen.resize(this.app.screen.width, this.app.screen.height);
            }
        }
    }

    /**
     * Get UI layer container
     */
    public getUILayer(): Container {
        return this.uiLayer;
    }

    /** Keep menus and HUD above gameplay layers (map, sprites, overlays). */
    public bringToFront(): void {
        const p = this.uiLayer.parent;
        if (p) {
            p.addChild(this.uiLayer);
        }
    }

    /**
     * Get app instance
     */
    public getApp(): Application {
        return this.app;
    }

    /**
     * Get responsive manager
     */
    public getResponsiveManager(): ResponsiveUIManager {
        return this.responsiveManager;
    }

    /**
     * Get screen transition manager
     */
    public getTransitionManager(): ScreenTransitionManager {
        return this.transitionManager;
    }

    /**
     * Cleanup and dispose
     */
    public dispose(): void {
        for (const [type, screen] of this.screens) {
            if (screen.dispose) {
                screen.dispose();
            }
            this.uiLayer.removeChild(screen.container);
        }
        this.screens.clear();
        this.app.stage.removeChild(this.uiLayer);
    }

    /**
     * Debug: List all registered screens
     */
    public listScreens(): ScreenType[] {
        return Array.from(this.screens.keys());
    }

    /**
     * Debug: Get debug info
     */
    public getDebugInfo(): string {
        return `Current: ${this.currentScreen} | Previous: ${this.previousScreen} | Registered: ${this.screens.size}`;
    }
}

/**
 * Base screen class for easy implementation
 */
export abstract class BaseGameScreen implements IGameScreen {
    container: Container;
    protected app: Application;
    protected uiManager: GameUIManager;

    constructor(app: Application) {
        this.app = app;
        this.uiManager = GameUIManager.getInstance();
        this.container = new Container();
        this.container.visible = false;
    }

    show(): void {
        this.container.visible = true;
    }

    hide(): void {
        this.container.visible = false;
    }

    update(deltaTime: number): void {
        // Override in subclass
    }

    resize(width: number, height: number): void {
        // Override in subclass
    }

    dispose(): void {
        // Override in subclass
    }
}
