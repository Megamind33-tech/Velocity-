import { Application, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createStatDisplay, createGameLabel } from '../GameUIComponents';
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

export class LevelCompleteScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;
    private scoreValueText!: Text;
    private starsLabel!: Text;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;
        const panelW = Math.min(360, width - 28);
        const panelH = Math.min(440, height - 48);

        this.layout = buildVelocityModal(
            this.container,
            this.app,
            'SECTOR CLEAR',
            panelW,
            panelH,
            GAME_COLORS.accent_green
        );
        const { body, innerW } = this.layout;

        const scoreDisplay = createStatDisplay('RUN SCORE', '0', GAME_COLORS.accent_gold);
        scoreDisplay.position.set((innerW - 200) / 2, 0);
        body.addChild(scoreDisplay);
        this.scoreValueText = scoreDisplay.children[1] as Text;

        const stars = createGameLabel('STARS: —', GAME_SIZES.font.lg, GAME_COLORS.primary, true);
        stars.position.set((innerW - 200) / 2, 56);
        body.addChild(stars);
        this.starsLabel = stars;

        const btnW = Math.min(268, innerW);
        const btnH = 48;
        let y = 120;

        const nextBtn = createVelocityGameButton('NEXT LEVEL', 'success', () => runEndActions().onNextLevel(), {
            width: btnW,
            height: btnH,
        });
        nextBtn.position.set((innerW - btnW) / 2, y);
        body.addChild(nextBtn);
        y += btnH + 10;

        const retryBtn = createVelocityGameButton('RETRY', 'secondary', () => runEndActions().onRetryRun(), {
            width: btnW,
            height: btnH,
        });
        retryBtn.position.set((innerW - btnW) / 2, y);
        body.addChild(retryBtn);
        y += btnH + 10;

        const mapBtn = createVelocityGameButton('MISSION SELECT', 'secondary', () => gameFlow().openMissionSelect(), {
            width: btnW,
            height: btnH,
        });
        mapBtn.position.set((innerW - btnW) / 2, y);
        body.addChild(mapBtn);
    }

    refreshRunSummary(): void {
        const s = getLastRunSummary();
        this.scoreValueText.text = String(s.score);
        const starStr = '★'.repeat(s.stars) + '☆'.repeat(Math.max(0, 3 - s.stars));
        this.starsLabel.text = `STARS ${starStr}`;
    }

    show(): void {
        super.show();
        this.refreshRunSummary();
    }

    resize(width: number, height: number): void {
        syncModalShellResize(this.layout, this.container, width, height);
        const panelW = Math.min(360, width - 28);
        const panelH = Math.min(440, height - 48);
        this.layout.panelW = panelW;
        this.layout.panelH = panelH;
        this.layout.innerW = velocityModalInnerWidth(panelW);
        repositionVelocityModal(this.layout, width, height);
    }
}
