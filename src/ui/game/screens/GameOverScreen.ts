import { Application, Container, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGameButton, createStatDisplay } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { gameFlow, getLastRunSummary, runEndActions } from '../gameFlowBridge';

export class GameOverScreen extends BaseGameScreen {
    private scoreValueText!: Text;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        const titleStyle = new TextStyle({
            fill: GAME_COLORS.accent_red,
            fontSize: GAME_SIZES.font.xxxl,
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.arcade,
        });
        const title = new Text({ text: 'CRASH', style: titleStyle });
        title.anchor.set(0.5);
        title.position.set(width / 2, height / 4);
        this.container.addChild(title);

        const statsContainer = new Container();
        statsContainer.position.set(width / 2 - 100, height / 2);
        this.container.addChild(statsContainer);

        const scoreDisplay = createStatDisplay('RUN SCORE', '0', GAME_COLORS.accent_gold);
        scoreDisplay.position.y = 0;
        statsContainer.addChild(scoreDisplay);
        this.scoreValueText = scoreDisplay.children[1] as Text;

        const restartBtn = createGameButton('RETRY', () => {
            runEndActions().onRetryRun();
        }, 'success', 'large');
        restartBtn.position.set(width / 2 - GAME_SIZES.button.large.width / 2, height * 0.7);
        this.container.addChild(restartBtn);

        const mapBtn = createGameButton('MISSION SELECT', () => {
            gameFlow().openMissionSelect();
        }, 'secondary', 'medium');
        mapBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, height * 0.78);
        this.container.addChild(mapBtn);

        const menuBtn = createGameButton('MAIN MENU', () => {
            gameFlow().openMainMenu();
            this.uiManager.showScreen('main-menu');
        }, 'secondary', 'medium');
        menuBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, height * 0.86);
        this.container.addChild(menuBtn);
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
        const children = this.container.children;
        if (children.length > 0) {
            children[0].position.set(width / 2, height / 4);
        }
        if (children.length > 1) {
            children[1].position.set(width / 2 - 100, height / 2);
        }
        if (children.length > 2) {
            children[2].position.set(width / 2 - GAME_SIZES.button.large.width / 2, height * 0.7);
        }
        if (children.length > 3) {
            children[3].position.set(width / 2 - GAME_SIZES.button.medium.width / 2, height * 0.78);
        }
        if (children.length > 4) {
            children[4].position.set(width / 2 - GAME_SIZES.button.medium.width / 2, height * 0.86);
        }
    }
}
