import { Application, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGameButton, createStatDisplay, createGameLabel } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { gameFlow, getLastRunSummary, runEndActions } from '../gameFlowBridge';

export class LevelCompleteScreen extends BaseGameScreen {
    private scoreValueText!: Text;
    private starsLabel!: Text;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        const titleStyle = new TextStyle({
            fill: GAME_COLORS.accent_green,
            fontSize: GAME_SIZES.font.xxxl,
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.arcade,
        });
        const title = new Text({ text: 'SECTOR CLEAR', style: titleStyle });
        title.anchor.set(0.5);
        title.position.set(width / 2, height / 4);
        this.container.addChild(title);

        const statsY = height / 2 - 24;
        const scoreDisplay = createStatDisplay('RUN SCORE', '0', GAME_COLORS.accent_gold);
        scoreDisplay.position.set(width / 2 - 100, statsY);
        this.container.addChild(scoreDisplay);
        this.scoreValueText = scoreDisplay.children[1] as Text;

        const stars = createGameLabel('STARS: —', GAME_SIZES.font.lg, GAME_COLORS.primary, true);
        stars.position.set(width / 2 - 100, statsY + 56);
        this.container.addChild(stars);
        this.starsLabel = stars;

        const nextBtn = createGameButton('NEXT LEVEL', () => {
            runEndActions().onNextLevel();
        }, 'success', 'large');
        nextBtn.position.set(width / 2 - GAME_SIZES.button.large.width / 2, height * 0.7);
        this.container.addChild(nextBtn);

        const retryBtn = createGameButton('RETRY', () => {
            runEndActions().onRetryRun();
        }, 'secondary', 'medium');
        retryBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, height * 0.78);
        this.container.addChild(retryBtn);

        const mapBtn = createGameButton('MISSION SELECT', () => {
            gameFlow().openMissionSelect();
        }, 'secondary', 'medium');
        mapBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, height * 0.86);
        this.container.addChild(mapBtn);
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
        const children = this.container.children;
        if (children.length > 0) {
            children[0].position.set(width / 2, height / 4);
        }
        if (children.length > 1) {
            children[1].position.set(width / 2 - 100, height / 2 - 24);
        }
        if (children.length > 2) {
            children[2].position.set(width / 2 - 100, height / 2 + 32);
        }
        if (children.length > 3) {
            children[3].position.set(width / 2 - GAME_SIZES.button.large.width / 2, height * 0.7);
        }
        if (children.length > 4) {
            children[4].position.set(width / 2 - GAME_SIZES.button.medium.width / 2, height * 0.78);
        }
        if (children.length > 5) {
            children[5].position.set(width / 2 - GAME_SIZES.button.medium.width / 2, height * 0.86);
        }
    }
}
