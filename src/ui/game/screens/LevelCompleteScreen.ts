/**
 * Level Complete — celebration screen with Kenney star sprites + hero score.
 *
 * DESIGN RULES (Reward Richness / Menu Wow):
 *   - Score: 36px gold — the dominant fact after a good run
 *   - Stars: real Kenney star.png / star_outline.png sprites at 44px each
 *   - Title "SECTOR CLEAR": 28px green — immediate positive confirmation
 *   - Next Level: primary (blue) — the obvious CTA, reads first
 *   - Retry: secondary — present but doesn't compete with NEXT LEVEL
 *   - Mission Select: secondary — escape route, lowest priority
 *   - No data list. No stat dashboard. Celebration + action.
 */

import { Application, Container, DisplayObject, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { gameFlow, getLastRunSummary, runEndActions } from '../gameFlowBridge';
import {
    buildVelocityModal,
    repositionVelocityModal,
    syncModalShellResize,
    velocityModalInnerWidth,
    type VelocityModalLayout,
} from '../velocityModalLayout';
import { createVelocityGameButton } from '../velocityUiButtons';
import { getVelocityUiTexture } from '../velocityUiArt';
import { animateModalEntrance } from '../modalAnimations';
import { AnimationManager } from '../AnimationManager';
import { animateScoreCountUp, animateStarReveal } from '../contentAnimations';
import { applyCelebratoryPulse } from '../modalPolish';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ts(fill: number, size: number, weight: '400'|'600'|'700'|'800' = '700', spacing = 0): TextStyle {
    return new TextStyle({
        fill,
        fontSize: size,
        fontWeight: weight,
        fontFamily: GAME_FONTS.functional,
        letterSpacing: spacing,
        dropShadow: size >= 18
            ? { alpha: 0.5, blur: 2, color: 0x000000, distance: 1 }
            : undefined,
    });
}

/** Build a row of 3 Kenney star sprites (filled or outline). */
function buildStarRow(
    innerW: number,
    starCount: number,
    starSize = 44,
): Container {
    const root = new Container();
    const total   = 3;
    const gap     = 10;
    const rowW    = total * starSize + (total - 1) * gap;
    const startX  = (innerW - rowW) / 2;

    const starTex    = getVelocityUiTexture('icon_star');
    const outlineTex = getVelocityUiTexture('icon_star_outline');

    for (let i = 0; i < total; i++) {
        const x = startX + i * (starSize + gap);
        const earned = i < starCount;
        const useTex = earned ? starTex : outlineTex;

        if (useTex) {
            const s = new Sprite(useTex);
            s.anchor.set(0, 0);
            s.width  = starSize;
            s.height = starSize;
            s.position.set(x, 0);
            if (earned) {
                s.tint  = 0xffe040;
                s.alpha = 1.0;
            } else {
                s.tint  = 0xaabbcc;
                s.alpha = 0.38;
            }
            root.addChild(s);
        } else {
            // Vector fallback star
            const g = new Graphics();
            const cx = x + starSize / 2;
            const cy = starSize / 2;
            const n  = 5;
            const ro = starSize * 0.46;
            const ri = starSize * 0.20;
            for (let j = 0; j < n * 2; j++) {
                const a = (j * Math.PI) / n - Math.PI / 2;
                const r = j % 2 === 0 ? ro : ri;
                const px = cx + Math.cos(a) * r;
                const py = cy + Math.sin(a) * r;
                if (j === 0) g.moveTo(px, py); else g.lineTo(px, py);
            }
            g.closePath();
            g.fill({
                color: earned ? GAME_COLORS.accent_gold : 0x444455,
                alpha: earned ? 0.95 : 0.32,
            });
            root.addChild(g);
        }
    }

    return root;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export class LevelCompleteScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;
    private scoreValText!: Text;
    private starRow!: Container;
    private starCount = 0;
    private animManager = AnimationManager.getInstance();
    private cancelEntrance: (() => void) | null = null;
    private cancelPolish: (() => void) | null = null;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const sw     = this.app.screen.width;
        const sh     = this.app.screen.height;
        const panelW = Math.min(380, sw - 28);
        const panelH = Math.min(460, sh - 48);

        this.layout = buildVelocityModal(
            this.container,
            this.app,
            'SECTOR CLEAR',
            panelW,
            panelH,
            GAME_COLORS.accent_green,
        );
        const { body, innerW } = this.layout;

        let y = 4;

        // ── Score label — small, subordinate ────────────────────────────────
        const scoreLabel = new Text({
            text: 'RUN SCORE',
            style: ts(GAME_COLORS.text_muted, 10, '700', 2.5),
        });
        scoreLabel.anchor.set(0.5, 0);
        scoreLabel.position.set(innerW / 2, y);
        body.addChild(scoreLabel);
        y += 16;

        // ── Score ambient glow — circle behind the number ───────────────────
        const scoreGlow = new Graphics();
        scoreGlow.circle(innerW / 2, y + GAME_SIZES.font.score_hero / 2, 36);
        scoreGlow.fill({ color: GAME_COLORS.accent_gold, alpha: 0.07 });
        body.addChild(scoreGlow);

        // ── Score value — hero number, gold, dominant ────────────────────────
        this.scoreValText = new Text({
            text: '0',
            style: new TextStyle({
                fill: GAME_COLORS.accent_gold,
                fontSize: GAME_SIZES.font.score_hero,
                fontWeight: '800',
                fontFamily: GAME_FONTS.functional,
                letterSpacing: 2,
                dropShadow: { alpha: 0.4, blur: 2, color: GAME_COLORS.accent_gold, distance: 0 },
                stroke: { color: 0x000000, width: 1.5 },
            }),
        });
        this.scoreValText.anchor.set(0.5, 0);
        this.scoreValText.position.set(innerW / 2, y);
        body.addChild(this.scoreValText);
        y += GAME_SIZES.font.score_hero + 12;

        // ── Divider ──────────────────────────────────────────────────────────
        const div = new Graphics();
        div.rect(innerW * 0.15, y, innerW * 0.7, 1);
        div.fill({ color: GAME_COLORS.accent_green, alpha: 0.35 });
        body.addChild(div);
        y += 14;

        // ── Celebration rings — radiating behind stars ───────────────────────
        const STAR_SIZE = 44;
        const starY = y;
        const ringCx = innerW / 2;
        const ringCy = starY + STAR_SIZE / 2;
        const celebRings = new Graphics();
        for (let i = 0; i < 5; i++) {
            const r = 28 + i * 16;
            celebRings.circle(ringCx, ringCy, r);
            celebRings.stroke({ color: GAME_COLORS.accent_green, width: 1, alpha: 0.10 - i * 0.016 });
        }
        body.addChild(celebRings);

        // ── Stars row — Kenney star sprites ──────────────────────────────────
        this.starRow = buildStarRow(innerW, 0, STAR_SIZE);
        this.starRow.position.set(0, y);
        body.addChild(this.starRow);
        y += STAR_SIZE + 16;

        // ── Action buttons ────────────────────────────────────────────────────
        const btnW = innerW;
        const btnH = 50;

        const nextBtn = createVelocityGameButton(
            'NEXT LEVEL',
            'success',
            () => runEndActions().onNextLevel(),
            { width: btnW, height: btnH },
        );
        nextBtn.position.set(0, y);
        body.addChild(nextBtn);
        y += btnH + 8;

        const retryBtn = createVelocityGameButton(
            'RETRY',
            'secondary',
            () => runEndActions().onRetryRun(),
            { width: btnW, height: 40 },
        );
        retryBtn.position.set(0, y);
        body.addChild(retryBtn);
        y += 44 + 8;

        const mapBtn = createVelocityGameButton(
            'MISSION SELECT',
            'secondary',
            () => gameFlow().openMissionSelect(),
            { width: btnW, height: 40 },
        );
        mapBtn.position.set(0, y);
        body.addChild(mapBtn);
    }

    refreshRunSummary(): void {
        const s = getLastRunSummary();

        // Animate score count-up
        animateScoreCountUp(this.scoreValText, 0, s.score, {
            duration: 1000,
        });

        // Rebuild stars with correct count
        const { body, innerW } = this.layout;
        if (this.starRow.parent) this.starRow.parent.removeChild(this.starRow);
        this.starRow.destroy({ children: true });

        this.starCount = Math.max(0, Math.min(3, s.stars));
        const STAR_SIZE = 44;
        this.starRow = buildStarRow(innerW, this.starCount, STAR_SIZE);

        // Re-position: label(16) + score(score_hero) + gap(12) + divider(14)
        const scoreY = 4 + 16 + GAME_SIZES.font.score_hero + 12 + 14;
        this.starRow.position.set(0, scoreY);
        body.addChild(this.starRow);

        // Animate star reveal with stagger
        const starSprites = this.starRow.children as DisplayObject[];
        animateStarReveal(starSprites, {
            duration: 300,
            starDelay: 150,
        });
    }

    show(): void {
        super.show();
        this.refreshRunSummary();

        // Animate modal entrance
        this.cancelEntrance?.();
        this.container.alpha = 0;
        this.container.scale.set(0.95, 0.95);
        this.cancelEntrance = animateModalEntrance(this.container, {
            duration: 300,
            onComplete: () => {
                // Apply celebratory polish after entrance completes
                this.cancelPolish?.();
                this.cancelPolish = applyCelebratoryPulse(this.container, 0.98, 1.02, 1200);
            },
        });
    }

    resize(width: number, height: number): void {
        syncModalShellResize(this.layout, this.container, width, height);
        const panelW = Math.min(380, width - 28);
        const panelH = Math.min(460, height - 48);
        this.layout.panelW = panelW;
        this.layout.panelH = panelH;
        this.layout.innerW = velocityModalInnerWidth(panelW);
        repositionVelocityModal(this.layout, width, height);
    }

    hide(): void {
        this.cancelEntrance?.();
        this.cancelPolish?.();
        this.animManager.cancelGroup('modal-entrance');
        this.animManager.cancelGroup('polish-pulse-scale');
        super.hide();
    }
}
