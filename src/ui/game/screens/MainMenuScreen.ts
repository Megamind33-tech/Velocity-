/**
 * Main menu — portrait game layout.
 * Phases 1–7: structured containers, premium HUD, role-based buttons,
 * strong typography, palette discipline, idle animation, final polish.
 */

import { Application, Container, Text } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { GAME_COLORS, GAME_SIZES } from '../GameUITheme';
import { gameFlow } from '../gameFlowBridge';
import { getMainMenuProgress, getMenuHighScore } from '../../../data/localProgress';
import { ResponsiveUIManager } from '../../ResponsiveUIManager';
import {
    createAvatarBadge,
    createHeroPanel,
    createHudChip,
    createInfoPill,
    createMenuButton,
    createPilotStatusStrip,
    createUtilityRow,
    MENU_TIER_HEIGHT,
} from '../menuLayoutHelpers';
import { heroSubtitleStyle, heroTitleStyle } from '../menuTextStyles';
import { mountVelocityShell, resizeVelocityShell, type VelocityShellParts } from '../velocityScreenShell';

// ─── Layout rhythm ────────────────────────────────────────────────────────────
const GAP = { xs: 6, sm: 10, md: 14, lg: 20, xl: 26 } as const;

// ─── Idle animation constants (Phase 6) ──────────────────────────────────────
// CTA breathes at this angular frequency (rad/s equivalent, applied per frame dt)
const CTA_PULSE_SPEED    = 0.048;
const CTA_PULSE_STRENGTH = 0.013; // max scale delta from 1.0
const ECO_PULSE_SPEED    = 0.072;
const ECO_PULSE_STRENGTH = 0.018; // alpha delta around base alpha

export class MainMenuScreen extends BaseGameScreen {
    private shell!: VelocityShellParts;

    // Phase 1: role-based containers
    readonly topHudContainer        = new Container();
    readonly titleHeroContainer     = new Container();
    readonly statsStripContainer    = new Container();
    readonly mainMenuContainer      = new Container();
    readonly secondaryMenuContainer = new Container();
    readonly economyRowContainer    = new Container();
    readonly floatingActionsContainer = new Container();

    // Phase 6: live references for animation
    private _ctaBtn:      Container | null = null;
    private _storeBtn:    Container | null = null;
    private _rewardsBtn:  Container | null = null;
    private _tick = 0;

    // Phase 4: live stat text refs for refresh
    private _chipScoreVal!: Text;
    private _chipRankVal!:  Text;
    private _chipStreakVal!: Text;

    constructor(app: Application) {
        super(app);
        this.topHudContainer.label        = 'topHudContainer';
        this.titleHeroContainer.label     = 'titleHeroContainer';
        this.statsStripContainer.label    = 'statsStripContainer';
        this.mainMenuContainer.label      = 'mainMenuContainer';
        this.secondaryMenuContainer.label = 'secondaryMenuContainer';
        this.economyRowContainer.label    = 'economyRowContainer';
        this.floatingActionsContainer.label = 'floatingActionsContainer';

        this.setupUI();
    }

    // ─── Setup ───────────────────────────────────────────────────────────────

    private setupUI(): void {
        const w = this.app.screen.width;
        const h = this.app.screen.height;

        this.shell = mountVelocityShell(this.container, this.app, 0.50);

        this.container.addChild(
            this.topHudContainer,
            this.titleHeroContainer,
            this.statsStripContainer,
            this.mainMenuContainer,
            this.secondaryMenuContainer,
            this.economyRowContainer,
            this.floatingActionsContainer,
        );

        this.rebuildLayout(w, h);
    }

    // ─── Layout metrics ───────────────────────────────────────────────────────

    private contentWidth(screenW: number): number {
        const safe   = ResponsiveUIManager.getInstance().getSafeAreaPadding();
        const margin = Math.max(safe.left, safe.right, GAME_SIZES.spacing.md);
        return Math.max(260, screenW - margin * 2);
    }

    private marginX(screenW: number, cw: number): number {
        return (screenW - cw) / 2;
    }

    // ─── Layout builder ───────────────────────────────────────────────────────

    private rebuildLayout(screenW: number, screenH: number): void {
        const safe = ResponsiveUIManager.getInstance().getSafeAreaPadding();
        const cw   = this.contentWidth(screenW);
        const mx   = this.marginX(screenW, cw);
        let   y    = safe.top + GAP.sm;

        resizeVelocityShell(this.shell, this.container, screenW, screenH, 0.50);

        // Clear all containers
        this.topHudContainer.removeChildren();
        this.titleHeroContainer.removeChildren();
        this.statsStripContainer.removeChildren();
        this.mainMenuContainer.removeChildren();
        this.secondaryMenuContainer.removeChildren();
        this.economyRowContainer.removeChildren();
        this.floatingActionsContainer.removeChildren();

        // Reset animation refs
        this._ctaBtn     = null;
        this._storeBtn   = null;
        this._rewardsBtn = null;

        // ── Phase 2: Top HUD ─────────────────────────────────────────────────
        // [BEST chip][SECTOR chip][ROUTES chip]          [avatar badge]
        const hudH      = 38;
        const badgeSize = 44;
        const chipW     = Math.floor((cw - GAP.sm * 2 - badgeSize - GAP.sm) / 3);

        const chipScore  = createHudChip('BEST',   String(getMenuHighScore()),          chipW, GAME_COLORS.accent_gold);
        const prog       = getMainMenuProgress();
        const chipRank   = createHudChip('SECTOR', `${prog.maxUnlocked}`,               chipW, GAME_COLORS.primary);
        const chipStreak = createHudChip('ROUTES', `${prog.unlockedCount}`,             chipW, 0x88ddff);

        chipRank.position.set(chipW + GAP.sm, 0);
        chipStreak.position.set((chipW + GAP.sm) * 2, 0);

        // Capture live text refs (child index: 0=bg, 1=accentLine, 2=label, 3=value)
        this._chipScoreVal  = chipScore.children[3]  as Text;
        this._chipRankVal   = chipRank.children[3]   as Text;
        this._chipStreakVal  = chipStreak.children[3] as Text;

        const badge = createAvatarBadge(badgeSize, 'V');
        badge.position.set(cw - badgeSize, -2);

        this.topHudContainer.addChild(chipScore, chipRank, chipStreak, badge);
        this.topHudContainer.position.set(mx, y);
        y += hudH + GAP.md;

        // ── Phase 4: Title hero panel ─────────────────────────────────────────
        const heroH      = Math.min(130, Math.max(104, Math.floor(screenH * 0.165)));
        const hero       = createHeroPanel(cw, heroH);
        const innerCentX = Math.max(160, cw - badgeSize - GAP.sm) / 2;

        // VELOCITY — hero identity, maximum contrast, no blur haze
        const titleFontSize = Math.min(36, Math.max(28, Math.floor(screenH * 0.048)));
        const title = new Text({
            text:  'VELOCITY',
            style: heroTitleStyle(titleFontSize),
        });
        title.anchor.set(0.5, 0);
        title.position.set(innerCentX, 8);

        // Subtitle — legible secondary; tighter spacing below title
        const sub = new Text({
            text:  'Voice-Powered Flight',
            style: heroSubtitleStyle(),
        });
        sub.anchor.set(0.5, 0);
        sub.position.set(innerCentX, title.y + titleFontSize + 8);

        // Tip pill — context, lowest hierarchy
        const pill = createInfoPill('Mic required · tap to begin', cw - 52);
        pill.position.set(innerCentX - pill.width / 2, sub.y + 20);

        hero.content.addChild(title, sub, pill);
        this.titleHeroContainer.addChild(hero.root);
        this.titleHeroContainer.position.set(mx, y);
        y += heroH + GAP.sm;

        // ── Phase 4 (STATUS fix): Pilot status strip ──────────────────────────
        const stripH = 44;
        const strip  = createPilotStatusStrip(cw, {
            maxUnlocked:   prog.maxUnlocked,
            unlockedCount: prog.unlockedCount,
            totalLevels:   prog.totalLevels,
        });
        this.statsStripContainer.addChild(strip);
        this.statsStripContainer.position.set(mx, y);
        y += stripH + GAP.lg;

        // ── Phase 3: Primary CTA — Mission Select ─────────────────────────────
        const cta = createMenuButton(
            'MISSION SELECT', 'cta', 'primary',
            () => gameFlow().openMissionSelect(),
            cw,
        );
        this._ctaBtn = cta;
        this.mainMenuContainer.addChild(cta);
        this.mainMenuContainer.position.set(mx, y);
        y += MENU_TIER_HEIGHT.cta + GAP.md;

        // ── Phase 3: Utility buttons — Leaderboard, Achievements ─────────────
        const lb = createMenuButton(
            'LEADERBOARD', 'secondary', 'secondary',
            () => this.uiManager.showScreen('leaderboard', true),
            cw,
        );
        const ach = createMenuButton(
            'ACHIEVEMENTS', 'secondary', 'secondary',
            () => this.uiManager.showScreen('achievements', true),
            cw,
        );
        ach.position.set(0, MENU_TIER_HEIGHT.secondary + GAP.sm);
        this.secondaryMenuContainer.addChild(lb, ach);
        this.secondaryMenuContainer.position.set(mx, y);
        y += MENU_TIER_HEIGHT.secondary * 2 + GAP.sm + GAP.md;

        // ── Phase 3: Economy row — Store + Rewards ────────────────────────────
        const ecoW    = Math.floor((cw - GAP.sm) / 2);
        const store   = createMenuButton(
            'STORE',   'economy', 'accent',
            () => this.uiManager.showScreen('store', true),
            ecoW,
        );
        const rewards = createMenuButton(
            'REWARDS', 'economy', 'accent',
            () => this.uiManager.showScreen('rewards', true),
            ecoW,
        );
        rewards.position.set(ecoW + GAP.sm, 0);
        this._storeBtn   = store;
        this._rewardsBtn = rewards;
        this.economyRowContainer.addChild(store, rewards);
        this.economyRowContainer.position.set(mx, y);
        y += MENU_TIER_HEIGHT.economy + GAP.xl;

        // ── Phase 3: Settings — lowest visual priority ────────────────────────
        const settings = createUtilityRow(
            'SETTINGS',
            () => this.uiManager.showScreen('settings', true),
            cw,
        );
        this.floatingActionsContainer.addChild(settings);
        this.floatingActionsContainer.position.set(mx, y);

        this._refreshChipTexts();
    }

    // ─── Stats refresh ────────────────────────────────────────────────────────

    private _refreshChipTexts(): void {
        if (this._chipScoreVal)  this._chipScoreVal.text  = String(getMenuHighScore());
        const prog = getMainMenuProgress();
        if (this._chipRankVal)   this._chipRankVal.text   = `${prog.maxUnlocked}`;
        if (this._chipStreakVal) this._chipStreakVal.text  = `${prog.unlockedCount}`;
    }

    // ─── Phase 6: Idle animation update ──────────────────────────────────────
    /**
     * Called each frame by GameUIManager.update().
     * CTA: gentle scale breathing so it reads as the live action.
     * Economy: soft alpha pulse — reward-aware without being loud.
     */
    update(deltaTime: number): void {
        if (!this.container.visible) return;

        this._tick += deltaTime;

        // Mission Select — scale breathing (dominant CTA pulse)
        if (this._ctaBtn) {
            const s = 1.0 + Math.sin(this._tick * CTA_PULSE_SPEED) * CTA_PULSE_STRENGTH;
            this._ctaBtn.scale.set(s);
        }

        // Economy buttons — mild alpha shimmer (reward hint, different phase)
        if (this._storeBtn) {
            // Don't override alpha if pointer is held (scale !== 1 implies pressed)
            if (this._storeBtn.scale.x > 0.98) {
                this._storeBtn.alpha =
                    0.92 + Math.sin(this._tick * ECO_PULSE_SPEED + Math.PI * 0.5) * ECO_PULSE_STRENGTH;
            }
        }
        if (this._rewardsBtn) {
            if (this._rewardsBtn.scale.x > 0.98) {
                this._rewardsBtn.alpha =
                    0.92 + Math.sin(this._tick * ECO_PULSE_SPEED + Math.PI * 1.5) * ECO_PULSE_STRENGTH;
            }
        }
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    show(): void {
        super.show();
        this._refreshChipTexts();
        // Rebuild pilot strip with fresh progress on every show
        const prog = getMainMenuProgress();
        const cw   = this.contentWidth(this.app.screen.width);
        this.statsStripContainer.removeChildren();
        this.statsStripContainer.addChild(
            createPilotStatusStrip(cw, {
                maxUnlocked:   prog.maxUnlocked,
                unlockedCount: prog.unlockedCount,
                totalLevels:   prog.totalLevels,
            }),
        );
    }

    resize(width: number, height: number): void {
        this.rebuildLayout(width, height);
    }
}
