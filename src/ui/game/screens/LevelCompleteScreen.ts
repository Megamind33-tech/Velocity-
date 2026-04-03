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

import { Application, Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ts(fill: number, size: number, weight: '400'|'600'|'700'|'800' = '700', spacing = 0): TextStyle {
    return new TextStyle({
        fill,
        fontSize: size,
        fontWeight: weight,
        fontFamily: GAME_FONTS.arcade,
        letterSpacing: spacing,
        dropShadow: size >= 18
            ? { alpha: 0.6, blur: 3, color: 0x000000, distance: 2 }
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
            style: ts(GAME_COLORS.text_muted, 11, '700', 2),
        });
        scoreLabel.anchor.set(0.5, 0);
        scoreLabel.position.set(innerW / 2, y);
        body.addChild(scoreLabel);
        y += 16;

        // ── Score value — hero number, gold, dominant ────────────────────────
        this.scoreValText = new Text({
            text: '0',
            style: ts(GAME_COLORS.accent_gold, GAME_SIZES.font.score_hero, '800'),
        });
        this.scoreValText.anchor.set(0.5, 0);
        this.scoreValText.position.set(innerW / 2, y);
        body.addChild(this.scoreValText);
        y += GAME_SIZES.font.score_hero + 12;

        // ── Divider ──────────────────────────────────────────────────────────
        const div = new Graphics();
        div.rect(innerW * 0.1, y, innerW * 0.8, 1);
        div.fill({ color: GAME_COLORS.accent_green, alpha: 0.3 });
        body.addChild(div);
        y += 12;

        // ── Stars row — Kenney star sprites ──────────────────────────────────
        const STAR_SIZE = 44;
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
            { width: btnW, height: 44 },
        );
        retryBtn.position.set(0, y);
        body.addChild(retryBtn);
        y += 44 + 8;

        const mapBtn = createVelocityGameButton(
            'MISSION SELECT',
            'secondary',
            () => gameFlow().openMissionSelect(),
            { width: btnW, height: 44 },
        );
        mapBtn.position.set(0, y);
        body.addChild(mapBtn);
    }

    refreshRunSummary(): void {
        const s = getLastRunSummary();
        this.scoreValText.text = String(s.score);

        // Rebuild stars with correct count
        const { body, innerW } = this.layout;
        if (this.starRow.parent) this.starRow.parent.removeChild(this.starRow);
        this.starRow.destroy({ children: true });

        this.starCount = Math.max(0, Math.min(3, s.stars));
        const STAR_SIZE = 44;
        this.starRow = buildStarRow(innerW, this.starCount, STAR_SIZE);

        // Re-position: below score value (label 16 + scoreFontSize + 12 + divider 13)
        const scoreY = 4 + 16 + GAME_SIZES.font.score_hero + 12 + 13;
        this.starRow.position.set(0, scoreY);
        body.addChild(this.starRow);
    }

    show(): void {
        super.show();
        this.refreshRunSummary();
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
}
