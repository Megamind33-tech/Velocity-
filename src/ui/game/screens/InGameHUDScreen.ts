/**
 * InGameHUDScreen: Real-time game metrics (arcade HUD layer)
 */

import { Application, Container, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createStatDisplay, createProgressBar, createGameButton } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { getHudDataSource, requestGamePause } from '../gameFlowBridge';

export class InGameHUDScreen extends BaseGameScreen {
    private scoreText!: Text;
    private levelText!: Text;
    private altSpeedText!: Text;
    private altitudeBar!: Container & { setProgress: (current: number, max: number) => void };
    private topLeftPanel!: Container & { content: Container };
    private vocalPanel!: Container & { content: Container };
    private pauseBtn!: Container;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;
        const padding = GAME_SIZES.spacing.lg;

        this.topLeftPanel = createGamePanel(220, 168, 'hud');
        this.topLeftPanel.position.set(padding, padding);
        this.container.addChild(this.topLeftPanel);

        const content = this.topLeftPanel.content;
        const scoreDisplay = createStatDisplay('SCORE', '0', GAME_COLORS.accent_gold);
        content.addChild(scoreDisplay);
        this.scoreText = scoreDisplay.children[1] as Text;

        const levelDisplay = createStatDisplay('LEVEL', '1', GAME_COLORS.primary);
        levelDisplay.position.y = GAME_SIZES.spacing.xl;
        content.addChild(levelDisplay);
        this.levelText = levelDisplay.children[1] as Text;

        const altStyle = new TextStyle({
            fill: GAME_COLORS.text_secondary,
            fontSize: GAME_SIZES.font.sm,
            fontFamily: GAME_FONTS.monospace,
        });
        this.altSpeedText = new Text({ text: 'ALT — m  ·  SPD —', style: altStyle });
        this.altSpeedText.position.set(0, GAME_SIZES.spacing.xl * 2 + 4);
        content.addChild(this.altSpeedText);

        this.vocalPanel = createGamePanel(200, 96, 'hud');
        this.vocalPanel.position.set(padding, height - padding - 96);
        this.container.addChild(this.vocalPanel);

        const vocalContent = this.vocalPanel.content;
        const vocalLabel = new Text({
            text: 'VOCAL LEVEL',
            style: new TextStyle({
                fill: GAME_COLORS.text_secondary,
                fontSize: GAME_SIZES.font.xs,
                fontFamily: GAME_FONTS.arcade,
            }),
        });
        vocalContent.addChild(vocalLabel);
        this.altitudeBar = createProgressBar(160, 20, 0, 100, GAME_COLORS.primary);
        this.altitudeBar.position.y = GAME_SIZES.spacing.md + 4;
        vocalContent.addChild(this.altitudeBar);

        this.pauseBtn = createGameButton('PAUSE', () => requestGamePause(), 'secondary', 'small');
        this.pauseBtn.position.set(
            width - padding - GAME_SIZES.button.small.width,
            padding
        );
        this.container.addChild(this.pauseBtn);
    }

    public updateScore(score: number): void {
        this.scoreText.text = String(score);
    }

    public updateLevel(level: number): void {
        this.levelText.text = String(level);
    }

    public updateVocalLevel(current: number, max: number = 100): void {
        this.altitudeBar.setProgress(current, max);
    }

    public updateAltitudeSpeed(altM: number, speedPx: number): void {
        this.altSpeedText.text = `ALT ${altM}m  ·  SPD ${Math.round(speedPx)}`;
    }

    override update(_deltaTime: number): void {
        if (!this.container.visible) return;
        const h = getHudDataSource();
        this.updateScore(h.getScore());
        this.updateLevel(h.getLevelId());
        this.updateVocalLevel(Math.round(h.getVocal01() * 100), 100);
        this.updateAltitudeSpeed(h.getAltitudeDisplay(), h.getForwardSpeed());
    }

    show(): void {
        super.show();
    }

    resize(width: number, height: number): void {
        const padding = GAME_SIZES.spacing.lg;
        this.topLeftPanel.position.set(padding, padding);
        this.vocalPanel.position.set(padding, height - padding - 96);
        this.pauseBtn.position.set(
            width - padding - GAME_SIZES.button.small.width,
            padding
        );
    }
}
