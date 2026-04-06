/**
 * In-game HUD — Kenney nine-slice chrome + authoritative type hierarchy.
 *
 * DESIGN RULES (HUD Dominance):
 *   - Score value: 26 px gold — dominant reading target
 *   - Level value: 18 px cyan — secondary, clearly subordinate
 *   - Alt / Speed: 13 px — support detail, present but not competing
 *   - SCORE / LV / ALT / SPD labels: 9 px muted — pure scaffold, never rivals
 *   - Vocal bar: 20 px height — visible signal without crushing gameplay
 *   - Pause: 44×44 square Kenney chrome — minimum touch target, icon-only
 *   - Stats plate: 76 px tall — room for 2-row layout without crowding
 *   - Everything edge-safe, no center overlap with gameplay field
 */

import { Application, Container, FederatedPointerEvent, Graphics, NineSliceSprite, Sprite, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { getHudDataSource, requestGamePause } from '../gameFlowBridge';
import { GameState } from '../../../engine/GameState';
import { ResponsiveUIManager } from '../../ResponsiveUIManager';
import { createKenneyHProgressBar, createKenneyPanelNineSlice } from '../kenneyNineSlice';
import { getVelocityUiTexture, velocityUiArtReady } from '../velocityUiArt';
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';
import { AnimationManager } from '../AnimationManager';
import { createPulseScale, createBounce } from '../polishEffects';
import { animateScale } from '../animationHelpers';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATS_H   = 92;   // room for score row + details + telemetry line
const PAUSE_W   = 44;   // square, minimum touch target
const PAUSE_H   = 44;
const VOCAL_H   = 20;   // tall enough to register at a glance
const PAD_MIN   = 8;

// Type sizes pulled from GameUITheme
const SZ_LABEL  = GAME_SIZES.font.hud_label;     // 9 — scaffold label
const SZ_MAJOR  = GAME_SIZES.font.hud_major;     // 26 — score counter
const SZ_SECOND = GAME_SIZES.font.hud_secondary; // 18 — level
const SZ_DETAIL = GAME_SIZES.font.hud_detail;    // 13 — alt / spd

// ─── Helpers ──────────────────────────────────────────────────────────────────

function labelStyle(fill: number): TextStyle {
    return new TextStyle({
        fill,
        fontSize: SZ_LABEL,
        fontFamily: GAME_FONTS.functional,
        fontWeight: 'bold',
        letterSpacing: 1,
    });
}

function majorStyle(fill: number): TextStyle {
    return new TextStyle({
        fill,
        fontSize: SZ_MAJOR,
        fontFamily: GAME_FONTS.numerical,
        fontWeight: 'bold',
        letterSpacing: 0,
        stroke: { color: 0x000000, width: 4, alpha: 0.88 },
        padding: 4,
        dropShadow: { alpha: 0.55, blur: 2, color: GAME_COLORS.bg_base, distance: 1 },
    });
}

function secondaryStyle(fill: number): TextStyle {
    return new TextStyle({
        fill,
        fontSize: SZ_SECOND,
        fontFamily: GAME_FONTS.numerical,
        fontWeight: 'bold',
        letterSpacing: 0,
        stroke: { color: 0x000000, width: 3, alpha: 0.82 },
        padding: 3,
        dropShadow: { alpha: 0.45, blur: 2, color: GAME_COLORS.bg_base, distance: 1 },
    });
}

function detailStyle(fill: number): TextStyle {
    return new TextStyle({
        fill,
        fontSize: SZ_DETAIL,
        fontFamily: GAME_FONTS.functional,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        stroke: { color: 0x000000, width: 2, alpha: 0.78 },
        padding: 2,
        dropShadow: { alpha: 0.4, blur: 1, color: GAME_COLORS.bg_base, distance: 1 },
    });
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class InGameHUDScreen extends BaseGameScreen {
    // Stats plate
    private statsPlate!: Container;
    private statsKenney: NineSliceSprite | null = null;
    private statsFallback!: Graphics;

    // Score — split label + major value
    private scoreLbl!: Text;
    private scoreVal!: Text;

    // Level — split label + secondary value
    private levelLbl!: Text;
    private levelVal!: Text;

    // Detail row — Alt / Speed
    private altText!: Text;
    private spdText!: Text;
    /** Fixed-player telemetry: altimeter 0–1, tuning cents, combo mult */
    private telemetryText!: Text;

    // Pause button — square Kenney chrome with play/pause icon
    private pauseBtn!: Container;
    private pauseBtnBg: NineSliceSprite | null = null;

    // Vocal bar
    private vocalPlate!: Container;
    private vocalKenney: NineSliceSprite | null = null;
    private vocalFallback!: Graphics;
    private vocalBar!: Container & { setProgress: (p01: number) => void };
    private vocalLabel!: Text;

    private _metricSep!: Graphics;
    private lastStatsKey = '';
    private lastVocalW   = -1;

    // Animation tracking
    private animManager = AnimationManager.getInstance();
    private cancelScorePulse: (() => void) | null = null;
    private cancelLevelPulse: (() => void) | null = null;
    private cancelPausePress: (() => void) | null = null;
    private lastScore = -1;
    private lastLevel = -1;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    // ── Vocal bar factory ───────────────────────────────────────────────────

    private makeVocalBar(w: number): Container & { setProgress: (p01: number) => void } {
        const kenney = createKenneyHProgressBar(w, VOCAL_H);
        if (kenney) {
            kenney.setProgress(0);
            return kenney;
        }
        const root = new Container() as Container & { setProgress: (p01: number) => void };
        const bg   = new Graphics();
        bg.roundRect(0, 0, w, VOCAL_H, 5);
        bg.fill({ color: GAME_COLORS.hud_bg, alpha: 0.92 });
        bg.stroke({ color: GAME_COLORS.primary, width: 1.5, alpha: 0.40 });
        // Inner track detail
        const track = new Graphics();
        track.roundRect(1, VOCAL_H - 4, w - 2, 2, 1);
        track.fill({ color: GAME_COLORS.primary, alpha: 0.08 });
        const fill = new Graphics();
        root.addChild(bg, track, fill);
        root.setProgress = (p01: number) => {
            fill.clear();
            const p = Math.max(0, Math.min(1, p01));
            if (p > 0) {
                fill.roundRect(1, 1, (w - 2) * p, VOCAL_H - 2, 4);
                fill.fill({ color: GAME_COLORS.primary, alpha: p > 0.85 ? 1.0 : 0.82 });
                // Bright leading edge
                fill.rect((w - 2) * p - 2, 1, 2, VOCAL_H - 2);
                fill.fill({ color: GAME_COLORS.text_primary, alpha: 0.4 * p });
            }
        };
        return root;
    }

    // ── Square pause button ─────────────────────────────────────────────────

    private makePauseButton(): Container {
        const root = new Container();
        root.label = 'pauseBtn';

        const squareTex = getVelocityUiTexture('button_square_secondary');
        const BS = VELOCITY_UI_SLICE.button;

        if (squareTex) {
            const bg = new NineSliceSprite({
                texture: squareTex,
                leftWidth: BS.L, rightWidth: BS.R,
                topHeight: BS.T, bottomHeight: BS.B,
                width: PAUSE_W, height: PAUSE_H,
            });
            bg.tint = 0xd0dce8;
            bg.alpha = 0.92;
            this.pauseBtnBg = bg;
            root.addChild(bg);
        } else {
            const bg = new Graphics();
            bg.roundRect(0, 0, PAUSE_W, PAUSE_H, 8);
            bg.fill({ color: GAME_COLORS.hud_bg, alpha: 0.88 });
            bg.stroke({ color: GAME_COLORS.border_secondary, width: 1.5, alpha: 0.6 });
            root.addChild(bg);
        }

        // Pause icon — two vertical bars drawn as Graphics (no external image needed)
        const icon = new Graphics();
        const bw = 5;
        const bh = 16;
        const cx = PAUSE_W / 2;
        const cy = PAUSE_H / 2;
        icon.roundRect(cx - bw - 2, cy - bh / 2, bw, bh, 2);
        icon.fill({ color: 0x2a3a4a, alpha: 0.9 });
        icon.roundRect(cx + 2, cy - bh / 2, bw, bh, 2);
        icon.fill({ color: 0x2a3a4a, alpha: 0.9 });
        root.addChild(icon);

        root.eventMode = 'static';
        root.cursor = 'pointer';
        root.accessible = true;
        root.accessibleTitle = 'Pause';
        root.accessibleType = 'button';

        const stop = (e: FederatedPointerEvent) => e.stopPropagation();

        root.on('pointerdown', (e) => {
            stop(e);
            this.cancelPausePress?.();
            this.cancelPausePress = animateScale(root, { x: 1, y: 1 }, { x: 0.92, y: 0.92 }, {
                duration: 80,
            });
        });

        root.on('pointerup', (e) => {
            stop(e);
            this.cancelPausePress?.();
            this.cancelPausePress = animateScale(root, { x: 0.92, y: 0.92 }, { x: 1, y: 1 }, {
                duration: 100,
                onComplete: () => {
                    this.cancelPausePress = null;
                    requestGamePause();
                },
            });
        });

        root.on('pointerupoutside', (e) => {
            stop(e);
            this.cancelPausePress?.();
            this.cancelPausePress = animateScale(root, root.scale, { x: 1, y: 1 }, { duration: 100 });
        });

        root.on('pointercancel', (e) => {
            stop(e);
            this.cancelPausePress?.();
            this.cancelPausePress = animateScale(root, root.scale, { x: 1, y: 1 }, { duration: 100 });
        });

        return root;
    }

    // ── Setup ───────────────────────────────────────────────────────────────

    private setupUI(): void {
        // Stats plate (top-left)
        this.statsPlate   = new Container();
        this.statsFallback = new Graphics();
        this.container.addChild(this.statsPlate, this.statsFallback);

        // Score — row 1 left
        this.scoreLbl = new Text({ text: 'SCORE', style: labelStyle(GAME_COLORS.text_muted) });
        this.scoreVal = new Text({ text: '0',     style: majorStyle(GAME_COLORS.hud_score_value) });

        // Level — row 1 right (right-anchored)
        this.levelLbl = new Text({ text: 'LV', style: labelStyle(GAME_COLORS.text_muted) });
        this.levelLbl.anchor.set(1, 0);
        this.levelVal = new Text({ text: '1', style: secondaryStyle(GAME_COLORS.hud_level_value) });
        this.levelVal.anchor.set(1, 0);

        // Detail row — row 2
        this.altText = new Text({ text: 'ALT 0m',  style: detailStyle(GAME_COLORS.hud_alt) });
        this.spdText = new Text({ text: 'SPD 0',   style: detailStyle(GAME_COLORS.hud_spd) });
        this.telemetryText = new Text({
            text: 'ALT —  COMBO x1',
            style: detailStyle(GAME_COLORS.text_muted),
        });

        this.container.addChild(
            this.scoreLbl,
            this.scoreVal,
            this.levelLbl,
            this.levelVal,
            this.altText,
            this.spdText,
            this.telemetryText,
        );

        // Vertical separator between SCORE group and LV group
        this._metricSep = new Graphics();
        this.container.addChild(this._metricSep);

        // Pause button (top-right)
        this.pauseBtn = this.makePauseButton();
        this.container.addChild(this.pauseBtn);

        // Vocal bar (bottom strip)
        this.vocalPlate   = new Container();
        this.vocalFallback = new Graphics();
        this.container.addChild(this.vocalPlate, this.vocalFallback);

        this.vocalLabel = new Text({
            text: 'VOCAL INPUT',
            style: labelStyle(GAME_COLORS.hud_vocal_label),
        });
        this.vocalLabel.position.set(10, 2);
        this.vocalPlate.addChild(this.vocalLabel);

        this.vocalBar = this.makeVocalBar(100);
        this.vocalBar.position.set(10, 14);
        this.vocalPlate.addChild(this.vocalBar);

        this.layoutChrome();
    }

    // ── Layout ──────────────────────────────────────────────────────────────

    private layoutChrome(): void {
        const width  = this.app.screen.width;
        const height = this.app.screen.height;
        const safe   = ResponsiveUIManager.getInstance().getSafeAreaPadding();
        const pad    = Math.max(PAD_MIN, safe.left, safe.right, GAME_SIZES.spacing.sm);
        const topY   = Math.max(PAD_MIN, safe.top + 4);

        const gap     = 8;
        const statsW  = Math.min(240, Math.max(160, width - pad * 2 - PAUSE_W - gap));
        const statsH  = STATS_H;

        // ── Stats plate chrome ──────────────────────────────────────────────
        const statsKey = `${statsW}x${statsH}`;
        if (statsKey !== this.lastStatsKey) {
            this.lastStatsKey = statsKey;
            this.statsPlate.removeChildren();
            this.statsKenney = null;

            const k = velocityUiArtReady() && createKenneyPanelNineSlice(statsW, statsH);
            if (k) {
                this.statsKenney = k;
                k.alpha = 0.90;
                k.tint  = 0x1e2c3a;  // cooler dark tint — reads as HUD authority
                this.statsPlate.addChild(k);
            }

            this.statsFallback.clear();
            if (!k) {
                this.statsFallback.roundRect(0, 0, statsW, statsH, 10);
                this.statsFallback.fill({ color: GAME_COLORS.hud_bg, alpha: 0.88 });
                this.statsFallback.stroke({ color: GAME_COLORS.primary, width: 1.5, alpha: 0.5 });
            }
        }

        this.statsPlate.position.set(pad, topY);
        this.statsFallback.position.set(pad, topY);
        this.statsFallback.visible = !this.statsKenney;

        // ── Score — row 1, left ─────────────────────────────────────────────
        const inset = 10;
        this.scoreLbl.position.set(pad + inset, topY + 6);
        this.scoreVal.position.set(pad + inset, topY + 16);

        // ── Level — row 1, right ────────────────────────────────────────────
        const rightEdge = pad + statsW - inset;
        this.levelLbl.position.set(rightEdge, topY + 6);
        this.levelVal.position.set(rightEdge, topY + 16);

        // ── Metric separator — thin vertical line between SCORE and LV ─────
        const sepX = pad + Math.floor(statsW * 0.55);
        this._metricSep.clear();
        this._metricSep.rect(sepX, topY + 10, 1, statsH - 20);
        this._metricSep.fill({ color: GAME_COLORS.primary, alpha: 0.12 });

        // ── Detail row — row 2 (below major values) ─────────────────────────
        const detailY = topY + 16 + SZ_MAJOR + 4;
        this.altText.position.set(pad + inset, detailY);
        this.spdText.position.set(pad + inset + this.altText.width + 10, detailY);
        this.telemetryText.position.set(pad + inset, detailY + SZ_DETAIL + 3);

        // ── Pause button — top-right ────────────────────────────────────────
        this.pauseBtn.position.set(width - pad - PAUSE_W, topY + (statsH - PAUSE_H) / 2);

        // ── Vocal bar — bottom strip ────────────────────────────────────────
        const vocalW     = Math.max(80, width - pad * 2);
        const vocalH     = VOCAL_H + 16 + 4; // label + bar + padding
        const bottomPad  = Math.max(pad, safe.bottom + 8);
        const vocalY     = height - bottomPad - vocalH;

        if (vocalW !== this.lastVocalW) {
            this.lastVocalW = vocalW;

            // Rebuild plate
            this.vocalBar.destroy({ children: true });
            this.vocalPlate.removeChildren();
            this.vocalKenney = null;

            const vk = velocityUiArtReady() && createKenneyPanelNineSlice(vocalW, vocalH);
            if (vk) {
                this.vocalKenney = vk;
                vk.alpha = 0.90;
                vk.tint  = 0x1e2c3a;
                this.vocalPlate.addChild(vk);
            }

            // Re-add label
            this.vocalLabel = new Text({
                text: 'VOCAL INPUT',
                style: labelStyle(GAME_COLORS.hud_vocal_label),
            });
            this.vocalLabel.position.set(12, 4);
            this.vocalPlate.addChild(this.vocalLabel);

            // Re-add bar
            const barW   = Math.max(60, vocalW - 24);
            this.vocalBar = this.makeVocalBar(barW);
            this.vocalBar.position.set(12, 16);
            this.vocalPlate.addChild(this.vocalBar);
        }

        this.vocalPlate.position.set(pad, vocalY);

        // Fallback plate
        this.vocalFallback.clear();
        this.vocalFallback.visible = !this.vocalKenney;
        if (this.vocalFallback.visible) {
            this.vocalFallback.roundRect(0, 0, vocalW, vocalH, 8);
            this.vocalFallback.fill({ color: GAME_COLORS.hud_bg, alpha: 0.82 });
            this.vocalFallback.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.4 });
            this.vocalFallback.position.set(pad, vocalY);
        }
    }

    // ── Update loop ─────────────────────────────────────────────────────────

    override update(_deltaTime: number): void {
        if (!this.container.visible) return;

        this.pauseBtn.visible = !GameState.paused;

        const h = getHudDataSource();

        const score  = h.getScore();
        const levelId = h.getLevelId();

        // Animate score on change — pulse effect to draw attention
        if (score !== this.lastScore) {
            this.lastScore = score;
            this.scoreVal.text = String(score);

            // Cancel previous pulse
            this.cancelScorePulse?.();

            // Pulse scale on score update (1.0 → 1.05 → 1.0)
            this.cancelScorePulse = createPulseScale(this.scoreVal, 1.0, 1.08, 300, { loop: false });
        }

        // Animate level on change — subtle pulse
        if (levelId !== this.lastLevel) {
            this.lastLevel = levelId;
            this.levelVal.text = String(levelId);

            // Cancel previous pulse
            this.cancelLevelPulse?.();

            // Quick pulse on level up
            this.cancelLevelPulse = createBounce(this.levelVal, 4, 200, {});
        }

        // Re-align detail row after score value width change
        this.spdText.position.set(
            this.altText.x + this.altText.width + 10,
            this.altText.y,
        );

        this.altText.text = `ALT ${h.getAltitudeDisplay()}%`;
        this.spdText.text = `SPD ${Math.round(h.getForwardSpeed())}`;

        const a01 = Math.round(h.getAltitude01() * 100);
        const cents = h.getTuningCents();
        const tune =
            cents === null ? '—' : `${cents > 0 ? '+' : ''}${cents}¢`;
        this.telemetryText.text = `SKY ${a01}%  ·  TUNE ${tune}  ·  COMBO x${h.getComboMultiplier()}`;

        this.vocalBar.setProgress(Math.round(h.getVocal01() * 100) / 100);
    }

    // ── Lifecycle ────────────────────────────────────────────────────────────

    show(): void {
        super.show();
    }

    hide(): void {
        // Clean up all animations
        this.cancelScorePulse?.();
        this.cancelLevelPulse?.();
        this.cancelPausePress?.();
        this.animManager.cancelGroup('polish-pulse');
        this.animManager.cancelGroup('polish-bounce');
        super.hide();
    }

    resize(_width: number, _height: number): void {
        this.layoutChrome();
    }
}
