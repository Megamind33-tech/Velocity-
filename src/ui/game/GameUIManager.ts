/**
 * GameUIManager: Master UI system for Velocity
 * Manages all game screens and UI state
 * Game-focused architecture with proper screen management
 */

import { Container, Application } from 'pixi.js';
import { ResponsiveUIManager } from '../ResponsiveUIManager';

export type ScreenType =
    | 'main-menu'
    | 'in-game-hud'
    | 'pause'
    | 'game-over'
    | 'settings'
    | 'leaderboard'
    | 'level-complete'
    | 'store'
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
    private uiLayer: Container;
    private screens: Map<ScreenType, IGameScreen> = new Map();
    private currentScreen: ScreenType | null = null;
    private previousScreen: ScreenType | null = null;

    private constructor(app: Application) {
        this.app = app;
        this.responsiveManager = ResponsiveUIManager.getInstance();

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
     * Show a screen and hide the current one
     */
    public showScreen(type: ScreenType, hideCurrentScreen: boolean = true): void {
        const newScreen = this.screens.get(type);
        if (!newScreen) {
            console.warn(`Screen not found: ${type}`);
            return;
        }

        // Hide current screen if requested
        if (hideCurrentScreen && this.currentScreen) {
            const current = this.screens.get(this.currentScreen);
            if (current) {
                current.hide();
            }
        }

        // Store previous screen
        this.previousScreen = this.currentScreen;

        // Show new screen
        newScreen.show();
        this.currentScreen = type;
        console.log(`→ Screen shown: ${type}`);
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
     * Go back to previous screen
     */
    public goBack(): void {
        if (this.previousScreen) {
            this.showScreen(this.previousScreen);
        }
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
