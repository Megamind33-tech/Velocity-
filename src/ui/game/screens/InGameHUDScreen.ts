/**
 * InGameHUDScreen: Real-time game metrics display
 * Shows score, level, altitude, voice indicator during gameplay
 */

import { Application } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createStatDisplay, createProgressBar } from '../GameUIComponents';
import { GAME_COLORS, GAME_SIZES } from '../GameUITheme';

export class InGameHUDScreen extends BaseGameScreen {
    private scoreDisplay: any;
    private levelDisplay: any;
    private altitudeBar: any;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;
        const padding = GAME_SIZES.spacing.lg;

        // Top-left: Score and Level
        const topLeftPanel = createGamePanel(200, 140, 'hud');
        topLeftPanel.position.set(padding, padding);
        this.container.addChild(topLeftPanel);

        const content = (topLeftPanel).content;
        this.scoreDisplay = createStatDisplay('SCORE', '0', GAME_COLORS.accent_gold);
        content.addChild(this.scoreDisplay);

        this.levelDisplay = createStatDisplay('LEVEL', '1', GAME_COLORS.primary);
        this.levelDisplay.position.y = GAME_SIZES.spacing.xl;
        content.addChild(this.levelDisplay);

        // Bottom-left: Vocal indicator
        const vocalPanel = createGamePanel(200, 80, 'hud');
        vocalPanel.position.set(padding, height - padding - 80);
        this.container.addChild(vocalPanel);

        const vocalContent = (vocalPanel).content;
        this.altitudeBar = createProgressBar(160, 20, 50, 100, GAME_COLORS.primary);
        this.altitudeBar.position.y = GAME_SIZES.spacing.md;
        vocalContent.addChild(this.altitudeBar);
    }

    public updateScore(score: number): void {
        if (this.scoreDisplay) {
            const scoreText = this.scoreDisplay.children[1];
            scoreText.text = String(score);
        }
    }

    public updateLevel(level: number): void {
        if (this.levelDisplay) {
            const levelText = this.levelDisplay.children[1];
            levelText.text = String(level);
        }
    }

    public updateVocalLevel(current: number, max: number = 100): void {
        if (this.altitudeBar && (this.altitudeBar).setProgress) {
            (this.altitudeBar).setProgress(current, max);
        }
    }

    show(): void {
        super.show();
        console.log('🎮 In-Game HUD active');
    }
}
