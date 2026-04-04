/**
 * Game Over — CRASH modal with hero score and strong action hierarchy.
 *
 * DESIGN RULES:
 *   - "CRASH" title: red, authoritative — immediate emotional read
 *   - Score: 36px gold — you know your score before anything else
 *   - RETRY: primary (blue) — dominant CTA
 *   - Mission Select / Main Menu: secondary — present but don't compete
 */

import { Application, Graphics, Text, TextStyle } from 'pixi.js';
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

export class GameOverScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;
    private scoreValText!: Text;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const sw     = this.app.screen.width;
        const sh     = this.app.screen.height;
        const panelW = Math.min(360, sw - 28);
        const panelH = Math.min(420, sh - 48);

        this.layout = buildVelocityModal(
            this.container,
            this.app,
            'CRASH',
            panelW,
            panelH,
            GAME_COLORS.accent_red,
        );
        const { body, innerW } = this.layout;

        let y = 4;

        // Score label — small, subordinate
        const scoreLabel = new Text({
            text: 'RUN SCORE',
            style: ts(GAME_COLORS.text_muted, 10, '700', 2.5),
        });
        scoreLabel.anchor.set(0.5, 0);
        scoreLabel.position.set(innerW / 2, y);
        body.addChild(scoreLabel);
        y += 16;

        // ── Red atmospheric ring — crash feel ────────────────────────────────
        const crashAtmo = new Graphics();
        const acx = innerW / 2;
        const acy = y + GAME_SIZES.font.score_hero / 2;
        // Concentric warning rings
        for (let i = 0; i < 4; i++) {
            const r = 24 + i * 14;
            crashAtmo.circle(acx, acy, r);
            crashAtmo.stroke({ color: GAME_COLORS.accent_red, width: 1, alpha: 0.14 - i * 0.03 });
        }
        // Inner red fill
        crashAtmo.circle(acx, acy, 26);
        crashAtmo.fill({ color: GAME_COLORS.accent_red, alpha: 0.06 });
        body.addChild(crashAtmo);

        // Score value — hero number, gold glow even on crash (you know your score)
        this.scoreValText = new Text({
            text: '0',
            style: new TextStyle({
                fill: GAME_COLORS.accent_gold,
                fontSize: GAME_SIZES.font.score_hero,
                fontWeight: '800',
                fontFamily: GAME_FONTS.arcade,
                letterSpacing: 2,
                dropShadow: { alpha: 0.7, blur: 8, color: GAME_COLORS.accent_gold, distance: 0 },
                stroke: { color: 0x000000, width: 1.5 },
            }),
        });
        this.scoreValText.anchor.set(0.5, 0);
        this.scoreValText.position.set(innerW / 2, y);
        body.addChild(this.scoreValText);
        y += GAME_SIZES.font.score_hero + 18;

        // Action buttons
        const btnW = innerW;
        const btnH = 52;

        const retryBtn = createVelocityGameButton(
            'RETRY',
            'success',
            () => runEndActions().onRetryRun(),
            { width: btnW, height: btnH },
        );
        retryBtn.position.set(0, y);
        body.addChild(retryBtn);
        y += btnH + 8;

        const mapBtn = createVelocityGameButton(
            'MISSION SELECT',
            'secondary',
            () => gameFlow().openMissionSelect(),
            { width: btnW, height: 44 },
        );
        mapBtn.position.set(0, y);
        body.addChild(mapBtn);
        y += 44 + 8;

        const menuBtn = createVelocityGameButton(
            'MAIN MENU',
            'danger',
            () => {
                gameFlow().openMainMenu();
                this.uiManager.showScreen('main-menu');
            },
            { width: btnW, height: 44 },
        );
        menuBtn.position.set(0, y);
        body.addChild(menuBtn);
    }

    refreshRunSummary(): void {
        const s = getLastRunSummary();
        this.scoreValText.text = String(s.score);
    }

    show(): void {
        super.show();
        this.refreshRunSummary();
    }

    resize(width: number, height: number): void {
        syncModalShellResize(this.layout, this.container, width, height);
        const panelW = Math.min(360, width - 28);
        const panelH = Math.min(420, height - 48);
        this.layout.panelW = panelW;
        this.layout.panelH = panelH;
        this.layout.innerW = velocityModalInnerWidth(panelW);
        repositionVelocityModal(this.layout, width, height);
    }
}
