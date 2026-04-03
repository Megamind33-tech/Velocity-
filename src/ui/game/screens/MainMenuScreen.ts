/**
 * Main menu — portrait game layout.
 * Wires all UI modules: hero, HUD chips, pilot strip, CTA, utility, reward buttons.
 */

import { Application, Container, Text } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { GAME_COLORS, GAME_SIZES } from '../GameUITheme';
import { gameFlow } from '../gameFlowBridge';
import { getMainMenuProgress, getMenuHighScore } from '../../../data/localProgress';
import { ResponsiveUIManager } from '../../ResponsiveUIManager';
import {
    createAvatarBadge,
    createHudChip,
    createMenuButton,
    createPilotStatusStrip,
    createSettingsDock,
    getPilotRank,
    MENU_TIER_HEIGHT,
} from '../menuLayoutHelpers';
import { buildHeroModule } from '../menuHeroComposer';
import { createRewardButton } from '../menuRewardComponents';
import { mountVelocityShell, resizeVelocityShell, type VelocityShellParts } from '../velocityScreenShell';

// ─── Layout rhythm ────────────────────────────────────────────────────────────
const GAP = { xs: 6, sm: 10, md: 14, lg: 20, xl: 26 } as const;

/** Pull modules together so the column reads as one cockpit stack, not isolated rows. */
const OVERLAP_STATS = 18;
const OVERLAP_CTA   = 12;
const OVERLAP_SEC   = 8;

// ─── Idle animation constants ─────────────────────────────────────────────────
const CTA_PULSE_SPEED    = 0.048;
const CTA_PULSE_STRENGTH = 0.013;
const ECO_PULSE_SPEED    = 0.072;
const ECO_PULSE_STRENGTH = 0.018;

export class MainMenuScreen extends BaseGameScreen {
    private shell!: VelocityShellParts;

    // Phase 1: role-based containers
    readonly topHudContainer          = new Container();
    readonly titleHeroContainer       = new Container();
    readonly statsStripContainer      = new Container();
    readonly mainMenuContainer        = new Container();
    readonly secondaryMenuContainer   = new Container();
    readonly economyRowContainer      = new Container();
    readonly floatingActionsContainer = new Container();

    // Animation refs
    private _ctaBtn:      Container | null = null;
    private _storeBtn:    Container | null = null;
    private _rewardsBtn:  Container | null = null;
    private _tick = 0;

    // Live HUD text refs (child indices: 0=bg, 1=accentLine, 2=label, 3=value)
    private _chipScoreVal!: Text;
    private _chipRankVal!:  Text;
    private _chipStreakVal!: Text;

    constructor(app: Application) {
        super(app);
        this.topHudContainer.label          = 'topHudContainer';
        this.titleHeroContainer.label       = 'titleHeroContainer';
        this.statsStripContainer.label      = 'statsStripContainer';
        this.mainMenuContainer.label        = 'mainMenuContainer';
        this.secondaryMenuContainer.label   = 'secondaryMenuContainer';
        this.economyRowContainer.label      = 'economyRowContainer';
        this.floatingActionsContainer.label = 'floatingActionsContainer';

        this.setupUI();
    }

    // ─── Setup ───────────────────────────────────────────────────────────────

    private setupUI(): void {
        this.shell = mountVelocityShell(this.container, this.app, 0.48);
        this.container.addChild(
            this.topHudContainer,
            this.titleHeroContainer,
            this.statsStripContainer,
            this.mainMenuContainer,
            this.secondaryMenuContainer,
            this.economyRowContainer,
            this.floatingActionsContainer,
        );
        this.rebuildLayout(this.app.screen.width, this.app.screen.height);
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

        resizeVelocityShell(this.shell, this.container, screenW, screenH, 0.48);

        this.topHudContainer.removeChildren();
        this.titleHeroContainer.removeChildren();
        this.statsStripContainer.removeChildren();
        this.mainMenuContainer.removeChildren();
        this.secondaryMenuContainer.removeChildren();
        this.economyRowContainer.removeChildren();
        this.floatingActionsContainer.removeChildren();

        this._ctaBtn     = null;
        this._storeBtn   = null;
        this._rewardsBtn = null;

        // ── Top HUD: capsule chips + avatar badge ─────────────────────────
        const hudH      = 40;   // chipHeight=38 + 2px breathing room
        const badgeSize = 44;
        const chipW     = Math.floor((cw - GAP.sm * 2 - badgeSize - GAP.sm) / 3);
        const prog      = getMainMenuProgress();

        const chipScore  = createHudChip('BEST',   String(getMenuHighScore()),  chipW, GAME_COLORS.accent_gold);
        const chipRank   = createHudChip('SECTOR', `${prog.maxUnlocked}`,       chipW, GAME_COLORS.primary);
        const chipStreak = createHudChip('ROUTES', `${prog.unlockedCount}`,     chipW, 0x88ddff);

        chipRank.position.set(chipW + GAP.sm, 0);
        chipStreak.position.set((chipW + GAP.sm) * 2, 0);

        // indices: 0=bg, 1=accentLine, 2=label, 3=value
        this._chipScoreVal  = chipScore.children[3]  as Text;
        this._chipRankVal   = chipRank.children[3]   as Text;
        this._chipStreakVal  = chipStreak.children[3] as Text;

        const badge = createAvatarBadge(badgeSize, 'V');
        badge.position.set(cw - badgeSize, -2);

        this.topHudContainer.addChild(chipScore, chipRank, chipStreak, badge);
        this.topHudContainer.position.set(mx, y);
        y += hudH + GAP.md;

        // ── Hero module — signature cockpit identity zone ──────────────────
        const heroH = Math.min(152, Math.max(122, Math.floor(screenH * 0.19)));
        const hero  = buildHeroModule(cw, heroH, {
            title:     'VELOCITY',
            subtitle:  'Voice-Powered Flight',
            hint:      'Mic live · command ready',
            pilotRank: getPilotRank(prog.maxUnlocked),
        });
        this.titleHeroContainer.addChild(hero);
        this.titleHeroContainer.position.set(mx, y);
        y += heroH + GAP.xs;

        // ── Pilot status strip — overlaps hero foot (connected progression read) ─
        const strip = createPilotStatusStrip(cw, {
            maxUnlocked:   prog.maxUnlocked,
            unlockedCount: prog.unlockedCount,
            totalLevels:   prog.totalLevels,
        });
        this.statsStripContainer.addChild(strip);
        this.statsStripContainer.position.set(mx, y - OVERLAP_STATS);
        y += 48 + GAP.md - OVERLAP_STATS;

        // ── Mission Select — launch CTA (energy deck + deploy strip) ───────
        const cta = createMenuButton(
            'MISSION SELECT', 'cta', 'primary',
            () => gameFlow().openMissionSelect(),
            cw,
            { ctaLaunch: true },
        );
        this._ctaBtn = cta;
        this.mainMenuContainer.addChild(cta);
        this.mainMenuContainer.position.set(mx, y - OVERLAP_CTA);
        y += MENU_TIER_HEIGHT.cta + GAP.sm - OVERLAP_CTA;

        // ── Leaderboard + Achievements — prestige columns, tuck under CTA ──
        const secW = Math.floor((cw - GAP.sm) / 2);
        const lb = createMenuButton(
            'LEADERBOARD', 'secondary', 'secondary',
            () => this.uiManager.showScreen('leaderboard', true),
            secW,
            { social: 'leaderboard' },
        );
        const ach = createMenuButton(
            'ACHIEVEMENTS', 'secondary', 'secondary',
            () => this.uiManager.showScreen('achievements', true),
            secW,
            { social: 'achievements' },
        );
        ach.position.set(secW + GAP.sm, 0);
        this.secondaryMenuContainer.addChild(lb, ach);
        this.secondaryMenuContainer.position.set(mx, y - OVERLAP_SEC);
        y += MENU_TIER_HEIGHT.secondary + GAP.md - OVERLAP_SEC;

        // ── Economy row — reward buttons with icon sockets ────────────────
        const ecoW    = Math.floor((cw - GAP.sm) / 2);
        const ecoH    = MENU_TIER_HEIGHT.economy;
        const store   = createRewardButton(
            'store', 'STORE',
            () => this.uiManager.showScreen('store', true),
            ecoW, ecoH,
        );
        const rewards = createRewardButton(
            'rewards', 'REWARDS',
            () => this.uiManager.showScreen('rewards', true),
            ecoW, ecoH,
        );
        rewards.position.set(ecoW + GAP.sm, 0);
        this._storeBtn   = store;
        this._rewardsBtn = rewards;
        this.economyRowContainer.addChild(store, rewards);
        this.economyRowContainer.position.set(mx, y);
        y += ecoH + GAP.xl;

        // ── Settings — compact systems dock (finished footer, not empty slab) ─
        const settings = createSettingsDock(
            'SETTINGS',
            () => this.uiManager.showScreen('settings', true),
            cw,
        );
        this.floatingActionsContainer.addChild(settings);
        this.floatingActionsContainer.position.set(mx, y);

        this._refreshChipTexts();
    }

    // ─── Chip text refresh ────────────────────────────────────────────────────

    private _refreshChipTexts(): void {
        if (this._chipScoreVal)  this._chipScoreVal.text  = String(getMenuHighScore());
        const p = getMainMenuProgress();
        if (this._chipRankVal)   this._chipRankVal.text   = `${p.maxUnlocked}`;
        if (this._chipStreakVal) this._chipStreakVal.text  = `${p.unlockedCount}`;
    }

    // ─── Idle animation ───────────────────────────────────────────────────────

    update(deltaTime: number): void {
        if (!this.container.visible) return;

        this._tick += deltaTime;

        // Mission Select — scale breathing (dominant CTA pulse)
        if (this._ctaBtn) {
            const s = 1.0 + Math.sin(this._tick * CTA_PULSE_SPEED) * CTA_PULSE_STRENGTH;
            this._ctaBtn.scale.set(s);
        }

        // Economy buttons — alpha shimmer at offset phases
        if (this._storeBtn && this._storeBtn.scale.x > 0.98) {
            this._storeBtn.alpha =
                0.92 + Math.sin(this._tick * ECO_PULSE_SPEED + Math.PI * 0.5) * ECO_PULSE_STRENGTH;
        }
        if (this._rewardsBtn && this._rewardsBtn.scale.x > 0.98) {
            this._rewardsBtn.alpha =
                0.92 + Math.sin(this._tick * ECO_PULSE_SPEED + Math.PI * 1.5) * ECO_PULSE_STRENGTH;
        }
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    show(): void {
        super.show();
        // Rebuild on show so pilot rank, score, and progress are always fresh
        this.rebuildLayout(this.app.screen.width, this.app.screen.height);
    }

    resize(width: number, height: number): void {
        this.rebuildLayout(width, height);
    }
}
