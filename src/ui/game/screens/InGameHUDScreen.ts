/**
 * InGameHUDScreen: Compact HUD — minimal footprint on the gameplay canvas
 */

import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGameButton, createProgressBar } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { getHudDataSource, requestGamePause } from '../gameFlowBridge';
import { GameState } from '../../../engine/GameState';
import { ResponsiveUIManager } from '../../ResponsiveUIManager';

export class InGameHUDScreen extends BaseGameScreen {
    private statsBg!: Graphics;
    private scoreText!: Text;
    private levelText!: Text;
    private altSpeedText!: Text;
    private vocalRoot!: Container;
    private vocalBg!: Graphics;
    private vocalLabel!: Text;
    private altitudeBar!: Container & { setProgress: (current: number, max: number) => void };
    private pauseBtn!: Container;
    private lastBarWidth = 0;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        this.statsBg = new Graphics();
        this.container.addChild(this.statsBg);

        const lineStyle = new TextStyle({
            fill: GAME_COLORS.text_primary,
            fontSize: 13,
            fontFamily: GAME_FONTS.monospace,
            fontWeight: 'bold',
        });
        const subStyle = new TextStyle({
            fill: GAME_COLORS.text_secondary,
            fontSize: 11,
            fontFamily: GAME_FONTS.monospace,
        });

        this.scoreText = new Text({ text: 'SCORE 0', style: lineStyle });
        this.levelText = new Text({ text: 'LV 1', style: lineStyle });
        this.levelText.anchor.set(1, 0);
        this.altSpeedText = new Text({ text: 'ALT 0m  ·  SPD 0', style: subStyle });
        this.container.addChild(this.scoreText, this.levelText, this.altSpeedText);

        this.pauseBtn = createGameButton('II', () => requestGamePause(), 'secondary', 'small', {
            width: 52,
            height: 32,
        });
        this.container.addChild(this.pauseBtn);

        this.vocalRoot = new Container();
        this.vocalBg = new Graphics();
        this.vocalRoot.addChild(this.vocalBg);
        this.vocalLabel = new Text({
            text: 'VOCAL',
            style: new TextStyle({
                fill: GAME_COLORS.text_secondary,
                fontSize: 9,
                fontFamily: GAME_FONTS.arcade,
            }),
        });
        this.vocalLabel.position.set(10, 4);
        this.vocalRoot.addChild(this.vocalLabel);

        this.altitudeBar = createProgressBar(100, 8, 0, 100, GAME_COLORS.primary);
        this.altitudeBar.position.set(10, 16);
        this.vocalRoot.addChild(this.altitudeBar);
        this.container.addChild(this.vocalRoot);

        this.layoutChrome();
    }

    private layoutChrome(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;
        const safe = ResponsiveUIManager.getInstance().getSafeAreaPadding();
        const pad = Math.max(GAME_SIZES.spacing.sm, safe.left, safe.right, 8);
        const topY = Math.max(GAME_SIZES.spacing.sm, safe.top + 4);
        const pauseW = 52;
        const pauseH = 32;
        const gap = 8;
        const statsW = Math.min(220, Math.max(140, width - pad * 2 - pauseW - gap));
        const statsH = 56;

        this.statsBg.clear();
        this.statsBg.roundRect(0, 0, statsW, statsH, 8);
        this.statsBg.fill({ color: GAME_COLORS.hud_bg, alpha: 0.82 });
        this.statsBg.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.45 });
        this.statsBg.position.set(pad, topY);

        this.scoreText.position.set(pad + 10, topY + 8);
        this.levelText.position.set(pad + statsW - 10, topY + 8);
        this.altSpeedText.position.set(pad + 10, topY + 32);

        this.pauseBtn.position.set(width - pad - pauseW, topY + (statsH - pauseH) / 2);

        const vocalBodyH = 22;
        const vocalW = width - pad * 2;
        const bottomPad = Math.max(pad, safe.bottom + 8);
        const vocalY = height - bottomPad - vocalBodyH - 18;

        const barInnerW = Math.max(80, vocalW - 20);
        if (barInnerW !== this.lastBarWidth) {
            this.lastBarWidth = barInnerW;
            this.vocalRoot.removeChild(this.altitudeBar);
            this.altitudeBar.destroy({ children: true });
            this.altitudeBar = createProgressBar(barInnerW, 8, 0, 100, GAME_COLORS.primary);
            this.altitudeBar.position.set(10, 16);
            this.vocalRoot.addChild(this.altitudeBar);
        }

        this.vocalBg.clear();
        this.vocalBg.roundRect(0, 0, vocalW, vocalBodyH + 18, 8);
        this.vocalBg.fill({ color: GAME_COLORS.hud_bg, alpha: 0.78 });
        this.vocalBg.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.35 });
        this.vocalRoot.position.set(pad, vocalY);
    }

    override update(_deltaTime: number): void {
        if (!this.container.visible) return;
        this.pauseBtn.visible = !GameState.paused;
        const h = getHudDataSource();
        this.scoreText.text = `SCORE ${h.getScore()}`;
        this.levelText.text = `LV ${h.getLevelId()}`;
        this.altitudeBar.setProgress(Math.round(h.getVocal01() * 100), 100);
        this.altSpeedText.text = `ALT ${h.getAltitudeDisplay()}m  ·  SPD ${Math.round(h.getForwardSpeed())}`;
    }

    show(): void {
        super.show();
    }

    resize(width: number, height: number): void {
        this.layoutChrome();
    }
}
