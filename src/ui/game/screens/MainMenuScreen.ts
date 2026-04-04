/**
 * Main menu — portrait mission console OR landscape layout (PixiJS), orientation from aspect ratio.
 */

import { Application, Container, FederatedPointerEvent, Graphics } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { GAME_SIZES } from '../GameUITheme';
import { gameFlow } from '../gameFlowBridge';
import { getMainMenuProgress, getMenuHighScore, getUnlockedLevelIds } from '../../../data/localProgress';
import { ResponsiveUIManager } from '../../ResponsiveUIManager';
import {
    buildBottomNavDock,
    buildHeroFlightCard,
    buildMissionList,
    buildModeTabs,
    buildTopUtilityBar,
    type MissionListBundle,
    type TopBarRefs,
} from '../menuLandscape/landscapeMainMenuUI';
import { buildPortraitMissionScreen, type PortraitMissionBundle } from '../menuPortrait/portraitMissionScreen';
import { getPilotRank } from '../menuLayoutHelpers';
import { mountVelocityShell, resizeVelocityShell, type VelocityShellParts } from '../velocityScreenShell';

const GAP_Y = 12;

function findLabeledDescendant(root: Container, label: string): Container | null {
    if (root.label === label) return root;
    for (const ch of root.children) {
        if (ch instanceof Container) {
            const hit = findLabeledDescendant(ch, label);
            if (hit) return hit;
        }
    }
    return null;
}

function isPortraitAspect(sw: number, sh: number): boolean {
    return sh > sw;
}

export class MainMenuScreen extends BaseGameScreen {
    private shell!: VelocityShellParts;
    private readonly content = new Container();

    private portraitMode = false;
    private landscapeTopRefs!: TopBarRefs;
    private portraitBundle: PortraitMissionBundle | null = null;
    private missionBundle: MissionListBundle | null = null;

    private tabsSetActive!: (i: number) => void;
    private navSetActive!: (i: number) => void;

    private _tick = 0;
    private _flyShimmer = 0;
    private _flyBtn: Container | null = null;

    private listDrag = false;
    private listDragY = 0;
    private listScrollStart = 0;
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

    private contentWidth(sw: number, portrait: boolean): number {
        const s = this.safePad();
        const m = Math.max(s.left, s.right, GAME_SIZES.spacing.md);
        const inner = sw - m * 2;
        if (portrait) return Math.min(430, Math.max(320, inner));
        return Math.max(320, inner);
    }

    private marginX(sw: number, cw: number): number {
        return (sw - cw) / 2;
    }

    private rebuildLayout(sw: number, sh: number): void {
        const safe = this.safePad();
        resizeVelocityShell(this.shell, this.container, sw, sh, 0.36, { liveBackdrop: true });

        this.content.removeChildren();
        this.portraitBundle = null;
        this.missionBundle = null;
        this._flyBtn = null;

        this.portraitMode = isPortraitAspect(sw, sh);
        const cw = this.contentWidth(sw, this.portraitMode);
        const mx = this.marginX(sw, cw);
        const ui = this.uiManager;

        if (this.portraitMode) {
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

            this.landscapeTopRefs = {
                energyText: bundle.topRefs.signal,
                bestText: bundle.topRefs.best,
                premiumText: bundle.topRefs.premium,
            };
            this.tabsSetActive = bundle.setTabActive;
            this.navSetActive = bundle.setNavActive;
            this._flyBtn = bundle.flyCta;
            this.setupListScroll(bundle.root, bundle);
            return;
        }

        const topY = safe.top + 12;

        const prog = getMainMenuProgress();
        const rank = getPilotRank(prog.maxUnlocked);
        const score = getMenuHighScore();

        const topBar = buildTopUtilityBar(
            cw,
            () => ui.showScreen('settings', true),
            prog,
            score,
            () => gameFlow().openAchievements?.(),
        );
        this.landscapeTopRefs = topBar.refs;
        topBar.root.position.set(mx, topY);
        this.content.addChild(topBar.root);

        let y = topY + 64 + GAP_Y;

        const heroH = Math.min(190, Math.max(150, Math.floor(sh * 0.28)));
        const unlocked = getUnlockedLevelIds();
        const firstPlayable = [...unlocked].sort((a, b) => a - b)[0] ?? 1;

        const hero = buildHeroFlightCard(cw, heroH, prog, rank, () => {
            gameFlow().startLevelWithMicGate?.(firstPlayable);
        });
        hero.position.set(mx, y);

        const continuityBay = new Graphics();
        continuityBay.roundRect(
            mx - 6,
            y - 8,
            cw + 12,
            Math.max(220, sh - (y - 8) - safe.bottom - 76),
            18,
        );
        continuityBay.fill({ color: 0x08111d, alpha: 0.32 });
        continuityBay.stroke({ color: 0x2f445f, width: 1, alpha: 0.34 });
        continuityBay.roundRect(mx + 10, y + heroH + 8, cw - 20, 2, 1);
        continuityBay.fill({ color: 0x7bd8ff, alpha: 0.18 });
        this.content.addChild(continuityBay);

        this.content.addChild(hero);
        this._flyBtn = findLabeledDescendant(hero, 'heroFlyCta');

        y += heroH + GAP_Y;

        const tabsY = y;
        y += 46 + GAP_Y;

        const bottomNavH = 70;
        const listH = Math.max(160, sh - y - bottomNavH - safe.bottom - 16);

        const bundle = buildMissionList(cw, listH, (levelId) => {
            gameFlow().startLevelWithMicGate?.(levelId);
        }, () => getMainMenuProgress());
        this.missionBundle = bundle;
        bundle.root.position.set(mx, y);
        this.content.addChild(bundle.root);
        this.setupListScroll(bundle.root, bundle);

        const tabs = buildModeTabs(cw, (idx) => {
            this.missionBundle!.rebuild(idx);
            this.tabsSetActive(idx);
        });
        this.tabsSetActive = tabs.setActive;
        tabs.root.position.set(mx, tabsY);
        this.content.addChild(tabs.root);

        const dock = buildBottomNavDock(cw, ui, () => this.navSetActive(0), (slot) => this.navSetActive(slot));
        this.navSetActive = dock.setActive;
        dock.root.position.set(mx, sh - safe.bottom - bottomNavH - 8);
        this.content.addChild(dock.root);

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
        const p = getMainMenuProgress();
        this.landscapeTopRefs.bestText.text = String(getMenuHighScore());
        this.landscapeTopRefs.premiumText.text = `${p.unlockedCount}`;
        this.landscapeTopRefs.energyText.text = `${p.maxUnlocked}`;
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
    }

    resize(width: number, height: number): void {
        this.rebuildLayout(width, height);
    }
}
