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

export class AchievementsScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;

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
        achievements.forEach((ach) => {
            const achLabel = createGameLabel(ach.name, GAME_SIZES.font.base, GAME_COLORS.primary, true);
            achLabel.position.y = y;
            body.addChild(achLabel);

            const descLabel = createGameLabel(ach.desc, GAME_SIZES.font.sm, GAME_COLORS.text_secondary);
            descLabel.position.y = y + GAME_SIZES.spacing.md;
            body.addChild(descLabel);

            y += GAME_SIZES.spacing.xl + 10;
        });

        const btnW = Math.min(260, innerW);
        const btnH = 46;
        const backBtn = createVelocityGameButton('BACK', 'secondary', () => this.uiManager.goBack(), {
            width: btnW,
            height: btnH,
        });
        backBtn.position.set((innerW - btnW) / 2, y + 8);
        body.addChild(backBtn);
    }

    show(): void {
        super.show();
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
}
