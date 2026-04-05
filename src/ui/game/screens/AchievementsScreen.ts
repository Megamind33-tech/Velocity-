import { Application } from 'pixi.js';
import type { PixiDisplayObject } from '../pixiDisplayTypes';
import { BaseGameScreen } from '../GameUIManager';
import { createGameLabel } from '../GameUIComponents';
import { GAME_COLORS, GAME_SIZES } from '../GameUITheme';
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

export class AchievementsScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;
    private animManager = AnimationManager.getInstance();
    private cancelEntrance: (() => void) | null = null;
    private cancelPolish: (() => void) | null = null;
    private cancelExit: (() => void) | null = null;
    private achievementItems: Array<PixiDisplayObject> = [];

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const sw = this.app.screen.width;
        const sh = this.app.screen.height;
        const panelW = Math.min(500, sw - 24);
        const panelH = Math.min(520, sh - 48);

        this.layout = buildVelocityModal(this.container, this.app, 'ACHIEVEMENTS', panelW, panelH);
        const { body, innerW } = this.layout;

        const achievements = [
            { name: 'FIRST FLIGHT', desc: 'Complete level 1' },
            { name: 'HIGH FLYER', desc: 'Score 10000 points' },
            { name: 'PERFECT PITCH', desc: 'Perfect accuracy' },
        ];

        let y = 0;
        this.achievementItems = [];
        achievements.forEach((ach) => {
            const achLabel = createGameLabel(ach.name, GAME_SIZES.font.base, GAME_COLORS.primary, true);
            achLabel.position.y = y;
            achLabel.alpha = 0; // Start invisible for reveal
            body.addChild(achLabel);
            this.achievementItems.push(achLabel);

            const descLabel = createGameLabel(ach.desc, GAME_SIZES.font.sm, GAME_COLORS.text_secondary);
            descLabel.position.y = y + GAME_SIZES.spacing.md;
            descLabel.alpha = 0; // Start invisible for reveal
            body.addChild(descLabel);
            this.achievementItems.push(descLabel);

            y += GAME_SIZES.spacing.xl + 10;
        });

        const btnW = Math.min(260, innerW);
        const btnH = 48;
        const backBtn = createVelocityGameButton('MAIN MENU', 'secondary', () =>
            this.uiManager.showScreenSync('main-menu', true, 'none'), {
            width: btnW,
            height: btnH,
        });
        backBtn.position.set((innerW - btnW) / 2, y + 8);
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

                // Reveal achievement items with stagger animation
                if (this.achievementItems.length > 0) {
                    animateListReveal(this.achievementItems, {
                        duration: 300,
                        itemDelay: 80,
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
