import { Application } from 'pixi.js';
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
import { resetLocalProgress } from '../../../data/localProgress';
import { animateModalEntrance } from '../modalAnimations';
import { AnimationManager } from '../AnimationManager';
import { createShimmer } from '../polishEffects';
import { animateModalExit } from '../modalAnimations';

export class SettingsScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;
    private animManager = AnimationManager.getInstance();
    private cancelEntrance: (() => void) | null = null;
    private cancelPolish: (() => void) | null = null;
    private cancelExit: (() => void) | null = null;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const sw = this.app.screen.width;
        const sh = this.app.screen.height;
        const panelW = Math.min(450, sw - 24);
        const panelH = Math.min(480, sh - 48);

        this.layout = buildVelocityModal(this.container, this.app, 'SETTINGS', panelW, panelH);
        const { body, innerW } = this.layout;

        let y = 0;
        const musicLabel = createGameLabel('MUSIC VOLUME', GAME_SIZES.font.base, GAME_COLORS.text_primary);
        musicLabel.position.y = y;
        body.addChild(musicLabel);
        y += GAME_SIZES.spacing.xl;

        const soundLabel = createGameLabel('SFX VOLUME', GAME_SIZES.font.base, GAME_COLORS.text_primary);
        soundLabel.position.y = y;
        body.addChild(soundLabel);
        y += GAME_SIZES.spacing.xl;

        const difficultyLabel = createGameLabel('DIFFICULTY', GAME_SIZES.font.base, GAME_COLORS.text_primary);
        difficultyLabel.position.y = y;
        body.addChild(difficultyLabel);
        y += GAME_SIZES.spacing.xl * 2;

        const btnW = Math.min(260, innerW);
        const btnH = 48;
        const resetBtn = createVelocityGameButton(
            'RESET PROGRESS',
            'danger',
            () => {
                resetLocalProgress();
                this.uiManager.showScreen('main-menu', true);
            },
            { width: btnW, height: btnH },
        );
        resetBtn.position.set((innerW - btnW) / 2, y);
        body.addChild(resetBtn);
        y += btnH + GAME_SIZES.spacing.md;

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
            },
        });
    }

    resize(width: number, height: number): void {
        syncModalShellResize(this.layout, this.container, width, height);
        const panelW = Math.min(450, width - 24);
        const panelH = Math.min(480, height - 48);
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

        // Smooth exit animation before hiding
        this.cancelExit = animateModalExit(this.container, {
            duration: 200,
            onComplete: () => super.hide(),
        });
    }
}
