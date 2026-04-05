/**
 * Main menu — Portrait mission console (mobile-first AAA quality)
 * Includes professional entrance animations, button interactions, and polish effects
 */

import { Application, Container, FederatedPointerEvent, Graphics } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { GAME_SIZES } from '../GameUITheme';
import { gameFlow } from '../gameFlowBridge';
import { getMainMenuProgress, getMenuHighScore, getUnlockedLevelIds } from '../../../data/localProgress';
import { ResponsiveUIManager } from '../../ResponsiveUIManager';
import { buildPortraitMissionScreen, type PortraitMissionBundle } from '../menuPortrait/portraitMissionScreen';
import { getPilotRank } from '../menuLayoutHelpers';
import { mountVelocityShell, resizeVelocityShell, type VelocityShellParts } from '../velocityScreenShell';
import { animateAlpha, animatePosition, easeOut } from '../animationHelpers';
import { AnimationManager } from '../AnimationManager';
import { createGlowPulse } from '../polishEffects';


export class MainMenuScreen extends BaseGameScreen {
    private shell!: VelocityShellParts;
    private readonly content = new Container();

    private portraitBundle: PortraitMissionBundle | null = null;

    private tabsSetActive!: (i: number) => void;
    private navSetActive!: (i: number) => void;

    private _tick = 0;
    private _flyBtn: Container | null = null;
    private _flyShimmer = 0; // Animation tick for fly button shimmer

    private listDrag = false;
    private listDragY = 0;
    private listScrollStart = 0;

    // Animation management
    private animManager = AnimationManager.getInstance();
    private cancelEntrance: (() => void) | null = null;
    private cancelGlow: (() => void) | null = null;
    constructor(app: Application) {
        super(app);
        this.content.label = 'mainMenuContent';
        this.setupUI();
    }

    private setupUI(): void {
        this.shell = mountVelocityShell(this.container, this.app, 0.36, { liveBackdrop: true });
        this.container.addChild(this.content);
        this.rebuildLayout(this.app.screen.width, this.app.screen.height);
    }

    private safePad() {
        return ResponsiveUIManager.getInstance().getSafeAreaPadding();
    }

    private contentWidth(sw: number): number {
        const s = this.safePad();
        const m = Math.max(s.left, s.right, GAME_SIZES.spacing.lg);
        const inner = sw - m * 2;
        return Math.min(450, Math.max(300, inner));
    }

    private rebuildLayout(sw: number, sh: number): void {
        const safe = this.safePad();
        resizeVelocityShell(this.shell, this.container, sw, sh, 0.36, { liveBackdrop: true });

        this.content.removeChildren();
        this.portraitBundle = null;
        this._flyBtn = null;

        const cw = this.contentWidth(sw);
        const mx = (sw - cw) / 2;
        const ui = this.uiManager;

        const prog = getMainMenuProgress();
        const unlocked = getUnlockedLevelIds();
        const firstPlayable = [...unlocked].sort((a, b) => a - b)[0] ?? 1;

        const bundle = buildPortraitMissionScreen({
            layoutW: cw,
            screenH: sh,
            safeTop: safe.top,
            safeBottom: safe.bottom,
            ui,
            getProgress: () => getMainMenuProgress(),
            getRank: (m) => getPilotRank(m),
            getBestScore: () => getMenuHighScore(),
            onFly: () => gameFlow().startLevelWithMicGate?.(firstPlayable),
        });
        this.portraitBundle = bundle;
        bundle.root.position.set(mx, 0);
        this.content.addChild(bundle.root);

        this.tabsSetActive = bundle.setTabActive;
        this.navSetActive = bundle.setNavActive;
        this._flyBtn = bundle.flyCta;
        this.setupListScroll(bundle.root, bundle);

        this._refreshTopBar();
    }

    private setupListScroll(
        root: Container,
        bundle: { setScrollY: (y: number) => void; getScrollY: () => number },
    ): void {
        root.eventMode = 'static';
        root.cursor = 'grab';

        root.on('pointerdown', (e: FederatedPointerEvent) => {
            this.listDrag = true;
            this.listDragY = e.global.y;
            this.listScrollStart = bundle.getScrollY();
            root.cursor = 'grabbing';
        });
        root.on('pointermove', (e: FederatedPointerEvent) => {
            if (!this.listDrag) return;
            const dy = e.global.y - this.listDragY;
            bundle.setScrollY(this.listScrollStart - dy);
        });
        const endDrag = () => {
            this.listDrag = false;
            root.cursor = 'grab';
        };
        root.on('pointerup', endDrag);
        root.on('pointerupoutside', endDrag);
        root.on('pointercancel', endDrag);
    }

    private _refreshTopBar(): void {
        if (this.portraitBundle?.topRefs) {
            const p = getMainMenuProgress();
            this.portraitBundle.topRefs.bestText.text = String(getMenuHighScore());
            this.portraitBundle.topRefs.premiumText.text = `${p.unlockedCount}`;
            this.portraitBundle.topRefs.energyText.text = `${p.maxUnlocked}`;
        }
    }

    update(deltaTime: number): void {
        if (!this.container.visible) return;
        this._tick += deltaTime;
        this.shell.backdropTick?.(this._tick);

        if (this.portraitBundle) {
            this.portraitBundle.tick(this._tick);
        }

        if (this._flyBtn) {
            this._flyShimmer += deltaTime * 0.9;
            const a = 0.04 * Math.sin(this._flyShimmer);
            this._flyBtn.alpha = 0.92 + a;
        }
    }

    show(): void {
        super.show();
        this.rebuildLayout(this.app.screen.width, this.app.screen.height);

        // Animate content entrance: fade + position slide from top
        this.cancelEntrance?.();
        this.content.alpha = 0;
        this.content.position.y = -50;

        this.cancelEntrance = animateAlpha(this.content, 0, 1, {
            duration: 400,
            easing: easeOut,
        });

        animatePosition(this.content, { y: -50 }, { y: 0 }, {
            duration: 400,
            easing: easeOut,
            onComplete: () => {
                // Apply glow pulse to fly button after entrance
                if (this._flyBtn) {
                    this.cancelGlow?.();
                    this.cancelGlow = createGlowPulse(this._flyBtn, 0.8, 1.0, { loop: true });
                }
            },
        });
    }

    hide(): void {
        this.cancelEntrance?.();
        this.cancelGlow?.();
        this.animManager.cancelGroup('modal-entrance');
        this.animManager.cancelGroup('polish-glow');
        super.hide();
    }

    resize(width: number, height: number): void {
        this.rebuildLayout(width, height);
    }
}
