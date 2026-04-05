/**
 * ScreenManager
 * Professional screen lifecycle management for Velocity's full-screen UI.
 * Handles Hangar, Shop (tokens/power-ups/fuel) and Plane Store screens.
 */

import { Container, Application } from 'pixi.js';
import { ShopScreen } from './ShopScreen';
import { HangarScreen } from './HangarScreen';
import { PlaneStoreScreen } from './PlaneStoreScreen';
import { consumePlaneStoreOpen } from './shopNavigationIntent';

export type VelocityScreenType = 'shop' | 'hangar' | 'plane-store' | 'main-menu';

export interface IVelocityScreen {
    container: Container;
    show(): void;
    hide(): void;
    dispose?(): void;
}

// ─── Screen wrappers ──────────────────────────────────────────────────────────

class ShopScreenWrapper implements IVelocityScreen {
    container: Container;
    private screen: ShopScreen;

    constructor() {
        this.screen    = new ShopScreen();
        this.container = this.screen;
    }

    show(): void {
        this.container.visible = true;
        const planesFirst = consumePlaneStoreOpen();
        this.screen.fadeIn(300).then(() => {
            if (planesFirst && 'openToPlanesTab' in this.screen) {
                (this.screen as any).openToPlanesTab();
            }
        }).catch(console.error);
    }

    hide(): void  { this.container.visible = false; }
    dispose(): void { this.screen.destroyScreen(); }
}

class HangarScreenWrapper implements IVelocityScreen {
    container: Container;
    private screen: HangarScreen;
    constructor() {
        this.screen    = new HangarScreen();
        this.container = this.screen;
    }
    show(): void  { this.screen.fadeIn(300).catch(console.error); }
    hide(): void  { this.screen.fadeOut(180).catch(console.error); }
    dispose(): void { this.screen.destroyScreen(); }
}

class PlaneStoreScreenWrapper implements IVelocityScreen {
    container: Container;
    private screen: PlaneStoreScreen;
    constructor() {
        this.screen    = new PlaneStoreScreen();
        this.container = this.screen;
    }
    show(): void  { this.screen.fadeIn(300).catch(console.error); }
    hide(): void  { this.screen.fadeOut(180).catch(console.error); }
    dispose(): void { this.screen.destroyScreen(); }
}

// ─── ScreenManager ────────────────────────────────────────────────────────────

export class ScreenManager {
    private static instance: ScreenManager;

    private app:              Application | null = null;
    private uiLayer:          Container   | null = null;
    private screens:          Map<VelocityScreenType, IVelocityScreen> = new Map();
    private currentScreen:    VelocityScreenType | null = null;
    private previousScreen:   VelocityScreenType | null = null;
    private isTransitioning   = false;

    private constructor() {}

    public static getInstance(): ScreenManager {
        if (!ScreenManager.instance) ScreenManager.instance = new ScreenManager();
        return ScreenManager.instance;
    }

    public init(app: Application, uiLayer?: Container): void {
        this.app     = app;
        this.uiLayer = uiLayer ?? new Container();
        if (!uiLayer) this.app.stage.addChild(this.uiLayer!);
        console.log('✓ ScreenManager initialized');
    }

    public createAllScreens(): void {
        if (!this.uiLayer) throw new Error('ScreenManager not initialized. Call init() first.');

        this.registerScreen('shop',        new ShopScreenWrapper());
        this.registerScreen('hangar',      new HangarScreenWrapper());
        this.registerScreen('plane-store', new PlaneStoreScreenWrapper());

        console.log('✓ All game screens created and registered');
    }

    private registerScreen(type: VelocityScreenType, screen: IVelocityScreen): void {
        this.screens.set(type, screen);
        this.uiLayer!.addChild(screen.container);
        screen.hide();
        console.log(`  ✓ Screen registered: ${type}`);
    }

    public async showScreen(
        type: VelocityScreenType,
        transitionType: 'fade' | 'slide-left' | 'slide-right' | 'none' = 'fade',
    ): Promise<void> {
        if (this.isTransitioning) {
            console.warn('Transition already in progress');
            return;
        }
        const newScreen = this.screens.get(type);
        if (!newScreen) {
            console.warn(`Screen not found: ${type}`);
            return;
        }
        if (this.currentScreen === type) return;

        this.isTransitioning = true;
        try {
            const outgoing = this.currentScreen ? this.screens.get(this.currentScreen) : null;
            this.previousScreen = this.currentScreen;

            if (outgoing && transitionType !== 'none') {
                await this.transition(outgoing.container, newScreen.container, transitionType);
                outgoing.hide();
            } else if (outgoing) {
                outgoing.hide();
            }

            newScreen.show();
            this.currentScreen = type;
            console.log(`→ Screen shown: ${type} (${transitionType})`);
        } finally {
            this.isTransitioning = false;
        }
    }

    /** Hide all registered screens without disposing them. */
    public hideAll(): void {
        for (const [, screen] of this.screens) {
            screen.hide();
        }
        this.currentScreen = null;
    }

    public async goBack(): Promise<void> {
        if (this.previousScreen) await this.showScreen(this.previousScreen, 'slide-right');
        else console.warn('No previous screen to go back to');
    }

    public getCurrentScreen(): VelocityScreenType | null { return this.currentScreen; }
    public getPreviousScreen(): VelocityScreenType | null { return this.previousScreen; }
    public isScreenActive(type: VelocityScreenType): boolean { return this.currentScreen === type; }
    public getScreen(type: VelocityScreenType): Container | null { return this.screens.get(type)?.container ?? null; }
    public isCurrentlyTransitioning(): boolean { return this.isTransitioning; }
    public listScreens(): VelocityScreenType[] { return Array.from(this.screens.keys()); }

    public dispose(): void {
        for (const [, screen] of this.screens) {
            if (screen.dispose) screen.dispose();
            this.uiLayer?.removeChild(screen.container);
        }
        this.screens.clear();
        this.currentScreen  = null;
        this.previousScreen = null;
    }

    // ── Transitions ───────────────────────────────────────────────────────────

    private transition(
        out: Container,
        inn: Container,
        type: string,
    ): Promise<void> {
        return new Promise(resolve => {
            const DURATION  = 280;
            const screenW   = this.app?.screen.width ?? 390;
            const t0        = performance.now();

            switch (type) {
                case 'fade': {
                    out.alpha = 1; inn.alpha = 0;
                    const tick = (now: number) => {
                        const p = Math.min((now - t0) / DURATION, 1);
                        const e = 1 - Math.pow(1 - p, 3);
                        out.alpha = 1 - e;
                        inn.alpha = e;
                        if (p < 1) requestAnimationFrame(tick);
                        else { out.alpha = 0; inn.alpha = 1; resolve(); }
                    };
                    requestAnimationFrame(tick);
                    break;
                }
                case 'slide-left': {
                    out.x = 0; inn.x = screenW;
                    const tick = (now: number) => {
                        const p = Math.min((now - t0) / DURATION, 1);
                        const e = 1 - Math.pow(1 - p, 3);
                        out.x = -screenW * e;
                        inn.x =  screenW - screenW * e;
                        if (p < 1) requestAnimationFrame(tick);
                        else { out.x = -screenW; inn.x = 0; resolve(); }
                    };
                    requestAnimationFrame(tick);
                    break;
                }
                case 'slide-right': {
                    out.x = 0; inn.x = -screenW;
                    const tick = (now: number) => {
                        const p = Math.min((now - t0) / DURATION, 1);
                        const e = 1 - Math.pow(1 - p, 3);
                        out.x =  screenW * e;
                        inn.x = -screenW + screenW * e;
                        if (p < 1) requestAnimationFrame(tick);
                        else { out.x = screenW; inn.x = 0; resolve(); }
                    };
                    requestAnimationFrame(tick);
                    break;
                }
                default:
                    resolve();
            }
        });
    }

    public getDebugInfo(): object {
        return {
            current:       this.currentScreen,
            previous:      this.previousScreen,
            screens:       Array.from(this.screens.keys()),
            isTransitioning: this.isTransitioning,
        };
    }
}
