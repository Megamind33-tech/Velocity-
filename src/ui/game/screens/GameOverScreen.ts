import { Application, Text } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createStatDisplay } from '../GameUIComponents';
import { GAME_COLORS, GAME_SIZES } from '../GameUITheme';
import { gameFlow, getLastRunSummary, runEndActions } from '../gameFlowBridge';
import {
    buildVelocityModal,
    repositionVelocityModal,
    syncModalShellResize,
    velocityModalInnerWidth,
    type VelocityModalLayout,
} from '../velocityModalLayout';
import { createVelocityGameButton } from '../velocityUiButtons';

export class GameOverScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;
    private scoreValueText!: Text;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;
        const panelW = Math.min(360, width - 28);
        const panelH = Math.min(400, height - 48);

        this.layout = buildVelocityModal(this.container, this.app, 'CRASH', panelW, panelH, GAME_COLORS.accent_red);
        const { body, innerW } = this.layout;

        const scoreDisplay = createStatDisplay('RUN SCORE', '0', GAME_COLORS.accent_gold);
        scoreDisplay.position.set((innerW - 200) / 2, 0);
        body.addChild(scoreDisplay);
        this.scoreValueText = scoreDisplay.children[1] as Text;

        const btnW = Math.min(268, innerW);
        const btnH = 48;
        let y = GAME_SIZES.spacing.xxl + 8;

        const retryBtn = createVelocityGameButton('RETRY', 'success', () => runEndActions().onRetryRun(), {
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
        y += btnH + 10;

        const menuBtn = createVelocityGameButton(
            'MAIN MENU',
            'danger',
            () => {
                gameFlow().openMainMenu();
                this.uiManager.showScreen('main-menu');
            },
            { width: btnW, height: btnH }
        );
        menuBtn.position.set((innerW - btnW) / 2, y);
        body.addChild(menuBtn);
    }

    refreshRunSummary(): void {
        const s = getLastRunSummary();
        this.scoreValueText.text = String(s.score);
    }

    show(): void {
        super.show();
        this.refreshRunSummary();
    }

    resize(width: number, height: number): void {
        syncModalShellResize(this.layout, this.container, width, height);
        const panelW = Math.min(360, width - 28);
        const panelH = Math.min(400, height - 48);
        this.layout.panelW = panelW;
        this.layout.panelH = panelH;
        this.layout.innerW = velocityModalInnerWidth(panelW);
        repositionVelocityModal(this.layout, width, height);
    }
}
