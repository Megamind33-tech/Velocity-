/**
 * InGameHUDScreen: Real-time game metrics display
 * Shows score, level, altitude, voice indicator during gameplay
 */

import { Application, Container, Text } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createStatDisplay, createProgressBar } from '../GameUIComponents';
import { GAME_COLORS, GAME_SIZES } from '../GameUITheme';

export class InGameHUDScreen extends BaseGameScreen {
    private scoreText: Text;
    private levelText: Text;
    private altitudeBar: Container & { setProgress: (current: number, max: number) => void };
    private topLeftPanel: Container & { content: Container };
    private vocalPanel: Container & { content: Container };

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;
        const padding = GAME_SIZES.spacing.lg;

        // Top-left: Score and Level
        this.topLeftPanel = createGamePanel(200, 140, 'hud');
        this.topLeftPanel.position.set(padding, padding);
        this.container.addChild(this.topLeftPanel);

        const content = this.topLeftPanel.content;
        const scoreDisplay = createStatDisplay('SCORE', '0', GAME_COLORS.accent_gold);
        content.addChild(scoreDisplay);
        this.scoreText = scoreDisplay.children[1];

        const levelDisplay = createStatDisplay('LEVEL', '1', GAME_COLORS.primary);
        levelDisplay.position.y = GAME_SIZES.spacing.xl;
        content.addChild(levelDisplay);
        this.levelText = levelDisplay.children[1];

        // Bottom-left: Vocal indicator
        this.vocalPanel = createGamePanel(200, 80, 'hud');
        this.vocalPanel.position.set(padding, height - padding - 80);
        this.container.addChild(this.vocalPanel);

        const vocalContent = this.vocalPanel.content;
        this.altitudeBar = createProgressBar(160, 20, 50, 100, GAME_COLORS.primary);
        this.altitudeBar.position.y = GAME_SIZES.spacing.md;
        vocalContent.addChild(this.altitudeBar);
    }

    public updateScore(score: number): void {
        if (this.scoreText) {
            this.scoreText.text = String(score);
        }
    }

    public updateLevel(level: number): void {
        if (this.levelText) {
            this.levelText.text = String(level);
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

    resize(width: number, height: number): void {
        const padding = GAME_SIZES.spacing.lg;
        if (this.topLeftPanel) {
            this.topLeftPanel.position.set(padding, padding);
        }
        if (this.vocalPanel) {
            this.vocalPanel.position.set(padding, height - padding - 80);
        }
    }
}
