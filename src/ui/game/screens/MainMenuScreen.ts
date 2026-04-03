/**
 * Main menu — portrait game layout: HUD strip, hero, stats, CTA, secondary, economy, utility.
 * Pixi containers only; reuses Kenney textures via helpers.
 */

import { Application, Container, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { gameFlow } from '../gameFlowBridge';
import { getMainMenuProgress, getMenuHighScore } from '../../../data/localProgress';
import { ResponsiveUIManager } from '../../ResponsiveUIManager';
import {
    createAvatarBadge,
    createHeroPanel,
    createHudChip,
    createInfoPill,
    createMenuButton,
    createStatsStripBackplate,
    createUtilityRow,
    MENU_TIER_HEIGHT,
} from '../menuLayoutHelpers';
import { mountVelocityShell, resizeVelocityShell, type VelocityShellParts } from '../velocityScreenShell';

const GAP = { xs: 8, sm: 12, md: 16, lg: 22 };

export class MainMenuScreen extends BaseGameScreen {
    private shell!: VelocityShellParts;

    readonly topHudContainer = new Container();
    readonly titleHeroContainer = new Container();
    readonly statsStripContainer = new Container();
    readonly mainMenuContainer = new Container();
    readonly secondaryMenuContainer = new Container();
    readonly economyRowContainer = new Container();
    readonly floatingActionsContainer = new Container();

    private chipScoreValue!: Text;
    private chipRankValue!: Text;
    private chipStreakValue!: Text;
    private heroContent!: Container;

    constructor(app: Application) {
        super(app);
        this.topHudContainer.label = 'topHudContainer';
        this.titleHeroContainer.label = 'titleHeroContainer';
        this.statsStripContainer.label = 'statsStripContainer';
        this.mainMenuContainer.label = 'mainMenuContainer';
        this.secondaryMenuContainer.label = 'secondaryMenuContainer';
        this.economyRowContainer.label = 'economyRowContainer';
        this.floatingActionsContainer.label = 'floatingActionsContainer';

        this.setupUI();
    }

    private setupUI(): void {
        const w = this.app.screen.width;
        const h = this.app.screen.height;

        this.shell = mountVelocityShell(this.container, this.app, 0.52);

        this.container.addChild(
            this.topHudContainer,
            this.titleHeroContainer,
            this.statsStripContainer,
            this.mainMenuContainer,
            this.secondaryMenuContainer,
            this.economyRowContainer,
            this.floatingActionsContainer
        );

        this.rebuildLayout(w, h);
    }

    private contentWidth(screenW: number): number {
        const safe = ResponsiveUIManager.getInstance().getSafeAreaPadding();
        const margin = Math.max(safe.left, safe.right, GAME_SIZES.spacing.md);
        return Math.max(260, screenW - margin * 2);
    }

    private marginX(screenW: number, cw: number): number {
        return (screenW - cw) / 2;
    }

    private rebuildLayout(screenW: number, screenH: number): void {
        const safe = ResponsiveUIManager.getInstance().getSafeAreaPadding();
        const cw = this.contentWidth(screenW);
        const mx = this.marginX(screenW, cw);
        let y = safe.top + GAP.sm;

        resizeVelocityShell(this.shell, this.container, screenW, screenH, 0.52);

        this.topHudContainer.removeChildren();
        this.titleHeroContainer.removeChildren();
        this.statsStripContainer.removeChildren();
        this.mainMenuContainer.removeChildren();
        this.secondaryMenuContainer.removeChildren();
        this.economyRowContainer.removeChildren();
        this.floatingActionsContainer.removeChildren();

        const hudH = 40;
        const badgeSlot = 52;
        const chipW = Math.floor((cw - GAP.sm * 2 - badgeSlot) / 3);
        const chipScore = createHudChip('BEST', String(getMenuHighScore()), chipW);
        const prog = getMainMenuProgress();
        const chipRank = createHudChip('SECTOR', `${prog.maxUnlocked}`, chipW);
        chipRank.position.set(chipW + GAP.sm, 0);
        const chipStreak = createHudChip('ROUTES', `${prog.unlockedCount}`, chipW);
        chipStreak.position.set((chipW + GAP.sm) * 2, 0);
        this.chipScoreValue = chipScore.children[2] as Text;
        this.chipRankValue = chipRank.children[2] as Text;
        this.chipStreakValue = chipStreak.children[2] as Text;

        const badge = createAvatarBadge(44, 'V');
        badge.position.set(cw - 44, -2);

        this.topHudContainer.addChild(chipScore, chipRank, chipStreak, badge);
        this.topHudContainer.position.set(mx, y);
        y += hudH + GAP.md;

        const heroH = Math.min(128, Math.max(102, Math.floor(screenH * 0.16)));
        const hero = createHeroPanel(cw, heroH);
        this.heroContent = hero.content;
        const heroInnerW = Math.max(160, cw - 44);
        const innerCenterX = heroInnerW / 2;

        const titleStyle = new TextStyle({
            fill: GAME_COLORS.primary,
            fontSize: Math.min(GAME_SIZES.font.xxxl, 30),
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.arcade,
            letterSpacing: 2,
            dropShadow: { alpha: 0.85, blur: 6, color: 0x001018, distance: 0 },
        });
        const title = new Text({ text: 'VELOCITY', style: titleStyle });
        title.anchor.set(0.5, 0);
        title.position.set(innerCenterX, 6);

        const sub = new Text({
            text: 'Voice-Powered Flight',
            style: new TextStyle({
                fill: GAME_COLORS.text_secondary,
                fontSize: GAME_SIZES.font.base,
                fontFamily: GAME_FONTS.arcade,
            }),
        });
        sub.anchor.set(0.5, 0);
        sub.position.set(innerCenterX, 44);

        const pill = createInfoPill('Tap mission select — mic required for runs', cw - 48);
        pill.position.set(innerCenterX - pill.width / 2, 70);

        this.heroContent.addChild(title, sub, pill);
        this.titleHeroContainer.addChild(hero.root);
        this.titleHeroContainer.position.set(mx, y);
        y += heroH + GAP.sm;

        const stripH = 42;
        const strip = createStatsStripBackplate(cw, stripH);
        const stripLabel = new Text({
            text: 'STATUS',
            style: new TextStyle({
                fill: GAME_COLORS.text_muted,
                fontSize: GAME_SIZES.font.xs,
                fontFamily: GAME_FONTS.arcade,
                letterSpacing: 3,
            }),
        });
        stripLabel.position.set(12, 12);
        strip.addChild(stripLabel);
        this.statsStripContainer.addChild(strip);
        this.statsStripContainer.position.set(mx, y);
        y += stripH + GAP.lg;

        const cta = createMenuButton(
            'MISSION SELECT',
            'cta',
            'primary',
            () => gameFlow().openMissionSelect(),
            cw
        );
        this.mainMenuContainer.addChild(cta);
        this.mainMenuContainer.position.set(mx, y);
        y += MENU_TIER_HEIGHT.cta + GAP.md;

        const secGap = GAP.sm;
        const lb = createMenuButton('LEADERBOARD', 'secondary', 'secondary', () => this.uiManager.showScreen('leaderboard', true), cw);
        const ach = createMenuButton(
            'ACHIEVEMENTS',
            'secondary',
            'secondary',
            () => this.uiManager.showScreen('achievements', true),
            cw
        );
        ach.position.set(0, MENU_TIER_HEIGHT.secondary + secGap);
        this.secondaryMenuContainer.addChild(lb, ach);
        this.secondaryMenuContainer.position.set(mx, y);
        y += MENU_TIER_HEIGHT.secondary * 2 + secGap + GAP.md;

        const ecoGap = GAP.sm;
        const ecoW = Math.floor((cw - ecoGap) / 2);
        const store = createMenuButton('STORE', 'economy', 'accent', () => this.uiManager.showScreen('store', true), ecoW);
        const rewards = createMenuButton(
            'REWARDS',
            'economy',
            'accent',
            () => this.uiManager.showScreen('rewards', true),
            ecoW
        );
        rewards.position.set(ecoW + ecoGap, 0);
        this.economyRowContainer.addChild(store, rewards);
        this.economyRowContainer.position.set(mx, y);
        y += MENU_TIER_HEIGHT.economy + GAP.lg;

        const settingsRow = createUtilityRow('SETTINGS', () => this.uiManager.showScreen('settings', true), cw);
        this.floatingActionsContainer.addChild(settingsRow);
        this.floatingActionsContainer.position.set(mx, y);

        this.refreshStatsTexts();
    }

    private refreshStatsTexts(): void {
        this.chipScoreValue.text = String(getMenuHighScore());
        const prog = getMainMenuProgress();
        this.chipRankValue.text = `${prog.maxUnlocked}`;
        this.chipStreakValue.text = `${prog.unlockedCount}`;
    }

    show(): void {
        super.show();
        this.refreshStatsTexts();
    }

    resize(width: number, height: number): void {
        this.rebuildLayout(width, height);
    }
}
