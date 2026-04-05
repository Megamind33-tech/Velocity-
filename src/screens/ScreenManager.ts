/**
 * ScreenManager
 * Professional screen lifecycle management for Velocity's AAA game screens
 * Handles Shop, Hangar, and Plane Store screens with smooth transitions
 */

import { Container, Application } from 'pixi.js';
import { ShopScreen } from './ShopScreen';
import { HangarScreen } from './HangarScreen';
import { PlaneStoreScreen } from './PlaneStoreScreen';

// Game screen types
export type VelocityScreenType = 'shop' | 'hangar' | 'plane-store' | 'main-menu';

/**
 * Screen interface compatible with game UI system
 */
export interface IVelocityScreen {
  container: Container;
  show(): void;
  hide(): void;
  dispose?(): void;
}

/**
 * Screen wrapper for ShopScreen
 */
class ShopScreenWrapper implements IVelocityScreen {
  container: Container;
  private screen: ShopScreen;

  constructor() {
    this.screen = new ShopScreen();
    this.container = this.screen;
  }

  show(): void {
    this.container.visible = true;
    this.screen.fadeIn(300).catch(console.error);
  }

  hide(): void {
    this.container.visible = false;
  }

  dispose(): void {
    this.screen.destroyScreen();
  }
}

/**
 * Screen wrapper for HangarScreen
 */
class HangarScreenWrapper implements IVelocityScreen {
  container: Container;
  private screen: HangarScreen;

  constructor() {
    this.screen = new HangarScreen();
    this.container = this.screen;
  }

  show(): void {
    this.container.visible = true;
    this.screen.fadeIn(300).catch(console.error);
  }

  hide(): void {
    this.container.visible = false;
  }

  dispose(): void {
    this.screen.destroyScreen();
  }
}

/**
 * Screen wrapper for PlaneStoreScreen
 */
class PlaneStoreScreenWrapper implements IVelocityScreen {
  container: Container;
  private screen: PlaneStoreScreen;

  constructor() {
    this.screen = new PlaneStoreScreen();
    this.container = this.screen;
  }

  show(): void {
    this.container.visible = true;
    this.screen.fadeIn(300).catch(console.error);
  }

  hide(): void {
    this.container.visible = false;
  }

  dispose(): void {
    this.screen.destroyScreen();
  }
}

/**
 * ScreenManager - Centralized screen management for Velocity AAA screens
 * Professional lifecycle management with smooth transitions
 */
export class ScreenManager {
  private static instance: ScreenManager;

  private app: Application | null = null;
  private uiLayer: Container | null = null;
  private screens: Map<VelocityScreenType, IVelocityScreen> = new Map();
  private currentScreen: VelocityScreenType | null = null;
  private previousScreen: VelocityScreenType | null = null;
  private isTransitioning: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ScreenManager {
    if (!ScreenManager.instance) {
      ScreenManager.instance = new ScreenManager();
    }
    return ScreenManager.instance;
  }

  /**
   * Initialize ScreenManager with PixiJS app
   */
  public init(app: Application, uiLayer?: Container): void {
    this.app = app;
    this.uiLayer = uiLayer || new Container();

    if (!uiLayer) {
      this.app.stage.addChild(this.uiLayer!);
    }

    console.log('✓ ScreenManager initialized');
  }

  /**
   * Create and register all screens
   */
  public createAllScreens(): void {
    if (!this.uiLayer) {
      throw new Error('ScreenManager not initialized. Call init() first.');
    }

    // Create screen wrappers
    const shopScreen = new ShopScreenWrapper();
    const hangarScreen = new HangarScreenWrapper();
    const planeStoreScreen = new PlaneStoreScreenWrapper();

    // Register screens
    this.registerScreen('shop', shopScreen);
    this.registerScreen('hangar', hangarScreen);
    this.registerScreen('plane-store', planeStoreScreen);

    console.log('✓ All game screens created and registered');
  }

  /**
   * Register a screen
   */
  private registerScreen(type: VelocityScreenType, screen: IVelocityScreen): void {
    this.screens.set(type, screen);
    this.uiLayer!.addChild(screen.container);
    screen.hide();
    console.log(`  ✓ Screen registered: ${type}`);
  }

  /**
   * Show a screen with smooth transition
   */
  public async showScreen(
    type: VelocityScreenType,
    transitionType: 'fade' | 'slide-left' | 'slide-right' | 'none' = 'fade'
  ): Promise<void> {
    // Prevent overlapping transitions
    if (this.isTransitioning) {
      console.warn('Transition already in progress');
      return;
    }

    const newScreen = this.screens.get(type);
    if (!newScreen) {
      console.warn(`Screen not found: ${type}`);
      return;
    }

    // Prevent showing same screen twice
    if (this.currentScreen === type) {
      return;
    }

    this.isTransitioning = true;

    try {
      const currentScreenObj = this.currentScreen ? this.screens.get(this.currentScreen) : null;

      // Store previous screen
      this.previousScreen = this.currentScreen;

      // Execute transition
      if (currentScreenObj && transitionType !== 'none') {
        await this.transitionScreens(
          currentScreenObj.container,
          newScreen.container,
          transitionType
        );
        currentScreenObj.hide();
      } else if (currentScreenObj) {
        currentScreenObj.hide();
      }

      // Show new screen
      newScreen.show();
      this.currentScreen = type;

      console.log(`→ Screen shown: ${type} (transition: ${transitionType})`);
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Transition between screens
   */
  private async transitionScreens(
    outgoing: Container,
    incoming: Container,
    transitionType: string
  ): Promise<void> {
    return new Promise((resolve) => {
      const duration = 300;
      const startTime = Date.now();

      switch (transitionType) {
        case 'fade':
          this.transitionFade(outgoing, incoming, duration, startTime, resolve);
          break;
        case 'slide-left':
          this.transitionSlideLeft(outgoing, incoming, duration, startTime, resolve);
          break;
        case 'slide-right':
          this.transitionSlideRight(outgoing, incoming, duration, startTime, resolve);
          break;
        default:
          resolve();
      }
    });
  }

  /**
   * Fade transition
   */
  private transitionFade(
    outgoing: Container,
    incoming: Container,
    duration: number,
    startTime: number,
    callback: () => void
  ): void {
    outgoing.alpha = 1;
    incoming.alpha = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      outgoing.alpha = 1 - eased;
      incoming.alpha = eased;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        outgoing.alpha = 0;
        incoming.alpha = 1;
        callback();
      }
    };

    animate();
  }

  /**
   * Slide left transition
   */
  private transitionSlideLeft(
    outgoing: Container,
    incoming: Container,
    duration: number,
    startTime: number,
    callback: () => void
  ): void {
    const width = this.app?.screen.width || 1080;
    outgoing.x = 0;
    incoming.x = width;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      outgoing.x = -width * eased;
      incoming.x = width - width * eased;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        outgoing.x = -width;
        incoming.x = 0;
        callback();
      }
    };

    animate();
  }

  /**
   * Slide right transition
   */
  private transitionSlideRight(
    outgoing: Container,
    incoming: Container,
    duration: number,
    startTime: number,
    callback: () => void
  ): void {
    const width = this.app?.screen.width || 1080;
    outgoing.x = 0;
    incoming.x = -width;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      outgoing.x = width * eased;
      incoming.x = -width + width * eased;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        outgoing.x = width;
        incoming.x = 0;
        callback();
      }
    };

    animate();
  }

  /**
   * Get current screen type
   */
  public getCurrentScreen(): VelocityScreenType | null {
    return this.currentScreen;
  }

  /**
   * Get previous screen type
   */
  public getPreviousScreen(): VelocityScreenType | null {
    return this.previousScreen;
  }

  /**
   * Check if screen is active
   */
  public isScreenActive(type: VelocityScreenType): boolean {
    return this.currentScreen === type;
  }

  /**
   * Navigate back to previous screen
   */
  public async goBack(): Promise<void> {
    if (this.previousScreen) {
      await this.showScreen(this.previousScreen, 'slide-right');
    } else {
      console.warn('No previous screen to go back to');
    }
  }

  /**
   * Get screen container
   */
  public getScreen(type: VelocityScreenType): Container | null {
    const screen = this.screens.get(type);
    return screen ? screen.container : null;
  }

  /**
   * Check if currently transitioning
   */
  public isCurrentlyTransitioning(): boolean {
    return this.isTransitioning;
  }

  /**
   * List all registered screens
   */
  public listScreens(): VelocityScreenType[] {
    return Array.from(this.screens.keys());
  }

  /**
   * Dispose all screens
   */
  public dispose(): void {
    for (const [, screen] of this.screens) {
      if (screen.dispose) {
        screen.dispose();
      }
      this.uiLayer?.removeChild(screen.container);
    }
    this.screens.clear();
    this.currentScreen = null;
    this.previousScreen = null;
  }

  /**
   * Get debug info
   */
  public getDebugInfo(): object {
    return {
      current: this.currentScreen,
      previous: this.previousScreen,
      screens: Array.from(this.screens.keys()),
      isTransitioning: this.isTransitioning,
    };
  }
}
