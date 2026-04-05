import { Application, Text, TextStyle } from 'pixi.js';
import type { PixiDisplayObject } from '../pixiDisplayTypes';
import { BaseGameScreen } from '../GameUIManager';
import { createGameLabel } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import {
    buildVelocityModal,
    repositionVelocityModal,
    syncModalShellResize,
    velocityModalInnerWidth,
    type VelocityModalLayout,
} from '../velocityModalLayout';
import { createVelocityGameButton } from '../velocityUiButtons';
import { animateModalEntrance } from '../modalAnimations';
import { AnimationManager } from '../AnimationManager';
import { createShimmer } from '../polishEffects';
import { animateListReveal } from '../contentAnimations';
import { animateModalExit } from '../modalAnimations';

export class LeaderboardScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;
    private animManager = AnimationManager.getInstance();
    private cancelEntrance: (() => void) | null = null;
    private cancelPolish: (() => void) | null = null;
    private cancelExit: (() => void) | null = null;
    private leaderboardItems: Array<PixiDisplayObject> = [];

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const sw = this.app.screen.width;
        const sh = this.app.screen.height;
        const panelW = Math.min(500, sw - 24);
        const panelH = Math.min(520, sh - 48);

        this.layout = buildVelocityModal(this.container, this.app, 'LEADERBOARD', panelW, panelH);
        const { body, innerW } = this.layout;

        const scores = [
            { rank: 1, name: 'VOICE MASTER', score: 15000 },
            { rank: 2, name: 'PITCH PERFECT', score: 12500 },
            { rank: 3, name: 'SOUND WAVE', score: 10000 },
        ];

        let y = 0;
        this.leaderboardItems = [];
        scores.forEach((entry) => {
            const entryText = `${entry.rank}. ${entry.name}  ·  ${entry.score}`;
            const label = createGameLabel(entryText, GAME_SIZES.font.lg, GAME_COLORS.primary, true);
            label.position.y = y;
            label.alpha = 0; // Start invisible for reveal
            body.addChild(label);
            this.leaderboardItems.push(label);
            y += GAME_SIZES.spacing.lg;
        });

        const hint = new Text({
            text: 'Live scores sync in a future update',
            style: new TextStyle({
                fill: GAME_COLORS.text_muted,
                fontSize: GAME_SIZES.font.sm,
                fontFamily: GAME_FONTS.functional,
            }),
        });
        hint.position.set(0, y + 4);
        body.addChild(hint);
        y += GAME_SIZES.spacing.xl * 2;

        const btnW = Math.min(260, innerW);
        const btnH = 48;
        const backBtn = createVelocityGameButton('BACK', 'secondary', () => this.uiManager.goBack(), {
            width: btnW,
            height: btnH,
        });
        backBtn.position.set((innerW - btnW) / 2, y);
        body.addChild(backBtn);
    }

    show(): void {
        super.show();

        // Animate modal entrance
        this.cancelEntrance?.();
        this.container.alpha = 0;
        this.container.scale.set(0.95, 0.95);
        this.cancelEntrance = animateModalEntrance(this.container, {
            duration: 300,
            onComplete: () => {
                // Apply shimmer effect after entrance for polish
                this.cancelPolish?.();
                this.cancelPolish = createShimmer(this.container, { loop: true });

                // Reveal leaderboard entries with stagger animation
                if (this.leaderboardItems.length > 0) {
                    animateListReveal(this.leaderboardItems, {
                        duration: 300,
                        itemDelay: 100,
                    });
                }
            },
        });
    }

    resize(width: number, height: number): void {
        syncModalShellResize(this.layout, this.container, width, height);
        const panelW = Math.min(500, width - 24);
        const panelH = Math.min(520, height - 48);
        this.layout.panelW = panelW;
        this.layout.panelH = panelH;
        this.layout.innerW = velocityModalInnerWidth(panelW);
        repositionVelocityModal(this.layout, width, height);
    }

    hide(): void {
        this.cancelEntrance?.();
        this.cancelPolish?.();
        this.cancelExit?.();
        this.animManager.cancelGroup('modal-entrance');
        this.animManager.cancelGroup('polish-shimmer');
        this.animManager.cancelGroup('content-list');

        // Smooth exit animation before hiding
        this.cancelExit = animateModalExit(this.container, {
            duration: 200,
            onComplete: () => super.hide(),
        });
    }
}
