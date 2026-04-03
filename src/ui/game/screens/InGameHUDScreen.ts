/**
 * In-game HUD — Kenney outline panels + slide bar + uniform pause (UI Pack only)
 */

import { Application, Container, Graphics, NineSliceSprite, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { getHudDataSource, requestGamePause } from '../gameFlowBridge';
import { GameState } from '../../../engine/GameState';
import { ResponsiveUIManager } from '../../ResponsiveUIManager';
import { createKenneyHProgressBar, createKenneyPanelNineSlice } from '../kenneyNineSlice';
import { createVelocityGameButton } from '../velocityUiButtons';
import { velocityUiArtReady } from '../velocityUiArt';

export class InGameHUDScreen extends BaseGameScreen {
    private statsPlate!: Container;
    private statsKenney: NineSliceSprite | null = null;
    private statsFallback!: Graphics;
    private scoreText!: Text;
    private levelText!: Text;
    private altText!: Text;
    private spdText!: Text;
    private vocalPlate!: Container;
    private vocalKenney: NineSliceSprite | null = null;
    private vocalFallback!: Graphics;
    private vocalBar!: Container & { setProgress: (p01: number) => void };
    private pauseBtn!: Container;
    private lastStatsKey = '';
    private lastVocalW = 0;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private makeVocalBar(w: number): Container & { setProgress: (p01: number) => void } {
        const h = 10;
        const kenney = createKenneyHProgressBar(w, h);
        if (kenney) {
            kenney.setProgress(0);
            return kenney;
        }
        const root = new Container();
        const bg = new Graphics();
        bg.roundRect(0, 0, w, h, 3);
        bg.fill({ color: GAME_COLORS.hud_bg, alpha: 0.9 });
        bg.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.4 });
        const fill = new Graphics();
        root.addChild(bg, fill);
        const out = root as Container & { setProgress: (p01: number) => void };
        out.setProgress = (p01: number) => {
            fill.clear();
            const p = Math.max(0, Math.min(1, p01));
            fill.roundRect(0, 0, w * p, h, 3);
            fill.fill({ color: GAME_COLORS.primary, alpha: 0.85 });
        };
        return out;
    }

    private setupUI(): void {
        this.statsPlate = new Container();
        this.statsFallback = new Graphics();
        this.container.addChild(this.statsPlate, this.statsFallback);

        const hudGlow = {
            alpha: 0.75,
            blur: 3,
            color: GAME_COLORS.bg_darkest,
            distance: 0,
        };
        this.scoreText = new Text({
            text: 'SCORE 0',
            style: new TextStyle({
                fill: GAME_COLORS.hud_score_value,
                fontSize: 14,
                fontFamily: GAME_FONTS.arcade,
                fontWeight: 'bold',
                letterSpacing: 1,
                dropShadow: { ...hudGlow, color: 0x003322 },
            }),
        });
        this.levelText = new Text({
            text: 'LV 1',
            style: new TextStyle({
                fill: GAME_COLORS.hud_level_value,
                fontSize: 14,
                fontFamily: GAME_FONTS.arcade,
                fontWeight: 'bold',
                letterSpacing: 1,
                dropShadow: { ...hudGlow, color: 0x001a22 },
            }),
        });
        this.levelText.anchor.set(1, 0);
        this.altText = new Text({
            text: 'ALT 0m',
            style: new TextStyle({
                fill: GAME_COLORS.hud_alt,
                fontSize: 11,
                fontFamily: GAME_FONTS.arcade,
                fontWeight: 'bold',
                dropShadow: hudGlow,
            }),
        });
        this.spdText = new Text({
            text: '·  SPD 0',
            style: new TextStyle({
                fill: GAME_COLORS.hud_spd,
                fontSize: 11,
                fontFamily: GAME_FONTS.arcade,
                fontWeight: 'bold',
                dropShadow: hudGlow,
            }),
        });
        this.container.addChild(this.scoreText, this.levelText, this.altText, this.spdText);

        this.pauseBtn = createVelocityGameButton('II', 'secondary', () => requestGamePause(), {
            width: 52,
            height: 32,
        });
        this.container.addChild(this.pauseBtn);

        this.vocalPlate = new Container();
        this.vocalFallback = new Graphics();
        this.container.addChild(this.vocalPlate, this.vocalFallback);

        const vocalLabel = new Text({
            text: 'VOCAL',
            style: new TextStyle({
                fill: GAME_COLORS.hud_vocal_label,
                fontSize: 10,
                fontFamily: GAME_FONTS.arcade,
                fontWeight: 'bold',
                letterSpacing: 2,
                dropShadow: { alpha: 0.8, blur: 2, color: 0x220033, distance: 0 },
            }),
        });
        vocalLabel.position.set(10, 6);
        this.vocalPlate.addChild(vocalLabel);

        this.vocalBar = this.makeVocalBar(100);
        this.vocalBar.position.set(10, 18);
        this.vocalPlate.addChild(this.vocalBar);

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

        const statsKey = `${statsW}x${statsH}`;
        if (statsKey !== this.lastStatsKey) {
            this.lastStatsKey = statsKey;
            this.statsPlate.removeChildren();
            this.statsKenney = null;
            const k = velocityUiArtReady() && createKenneyPanelNineSlice(statsW, statsH);
            if (k) {
                this.statsKenney = k;
                k.alpha = 0.88;
                k.tint = 0x2a2a40;
                this.statsPlate.addChild(k);
            }
            this.statsFallback.clear();
            if (!k) {
                this.statsFallback.roundRect(0, 0, statsW, statsH, 8);
                this.statsFallback.fill({ color: GAME_COLORS.hud_bg, alpha: 0.82 });
                this.statsFallback.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.45 });
            }
        }
        this.statsPlate.position.set(pad, topY);
        this.statsFallback.position.set(pad, topY);
        this.statsFallback.visible = !this.statsKenney;

        this.scoreText.position.set(pad + 10, topY + 8);
        this.levelText.position.set(pad + statsW - 10, topY + 8);
        const row2y = topY + 32;
        this.altText.position.set(pad + 10, row2y);
        this.spdText.position.set(pad + 10 + this.altText.width + 6, row2y);

        this.pauseBtn.position.set(width - pad - pauseW, topY + (statsH - pauseH) / 2);

        const vocalW = width - pad * 2;
        const vocalH = 40;
        const bottomPad = Math.max(pad, safe.bottom + 8);
        const vocalY = height - bottomPad - vocalH;

        if (vocalW !== this.lastVocalW) {
            this.lastVocalW = vocalW;
            this.vocalBar.destroy({ children: true });
            this.vocalPlate.removeChildren();
            this.vocalKenney = null;
            const vk = velocityUiArtReady() && createKenneyPanelNineSlice(vocalW, vocalH);
            if (vk) {
                this.vocalKenney = vk;
                vk.alpha = 0.88;
                vk.tint = 0x2a2a40;
                this.vocalPlate.addChild(vk);
            }
            const vocalLabel = new Text({
                text: 'VOCAL',
                style: new TextStyle({
                    fill: GAME_COLORS.hud_vocal_label,
                    fontSize: 10,
                    fontFamily: GAME_FONTS.arcade,
                    fontWeight: 'bold',
                    letterSpacing: 2,
                    dropShadow: { alpha: 0.8, blur: 2, color: 0x220033, distance: 0 },
                }),
            });
            vocalLabel.position.set(10, 6);
            this.vocalPlate.addChild(vocalLabel);
            const barW = Math.max(60, vocalW - 24);
            this.vocalBar = this.makeVocalBar(barW);
            this.vocalBar.position.set(10, 18);
            this.vocalPlate.addChild(this.vocalBar);
        }
        this.vocalPlate.position.set(pad, vocalY);

        this.vocalFallback.clear();
        this.vocalFallback.visible = !this.vocalKenney;
        if (this.vocalFallback.visible) {
            this.vocalFallback.roundRect(0, 0, vocalW, vocalH, 8);
            this.vocalFallback.fill({ color: GAME_COLORS.hud_bg, alpha: 0.78 });
            this.vocalFallback.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.35 });
            this.vocalFallback.position.set(pad, vocalY);
        }
    }

    override update(_deltaTime: number): void {
        if (!this.container.visible) return;
        this.pauseBtn.visible = !GameState.paused;
        const h = getHudDataSource();
        this.scoreText.text = `SCORE ${h.getScore()}`;
        this.levelText.text = `LV ${h.getLevelId()}`;
        this.vocalBar.setProgress(Math.round(h.getVocal01() * 100) / 100);
        this.altText.text = `ALT ${h.getAltitudeDisplay()}m`;
        this.spdText.text = `·  SPD ${Math.round(h.getForwardSpeed())}`;
        this.spdText.position.set(this.altText.x + this.altText.width + 6, this.altText.y);
    }

    show(): void {
        super.show();
    }

    resize(width: number, height: number): void {
        this.layoutChrome();
    }
}
