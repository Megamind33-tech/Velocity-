import { Application, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGameButton, createStatDisplay } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';

export class LevelCompleteScreen extends BaseGameScreen {
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
        const title = new Text({ text: 'LEVEL COMPLETE!', style: titleStyle });
        title.anchor.set(0.5);
        title.position.set(width / 2, height / 4);
        this.container.addChild(title);

        const statsY = height / 2;
        const scoreDisplay = createStatDisplay('LEVEL SCORE', '2500', GAME_COLORS.accent_gold);
        scoreDisplay.position.set(width / 2 - 100, statsY);
        this.container.addChild(scoreDisplay);

        const nextBtn = createGameButton('NEXT LEVEL', () => {
            this.uiManager.showScreen('in-game-hud');
        }, 'success', 'large');
        nextBtn.position.set(width / 2 - GAME_SIZES.button.large.width / 2, height * 0.7);
        this.container.addChild(nextBtn);

        const retryBtn = createGameButton('RETRY', () => {
            this.uiManager.showScreen('in-game-hud');
        }, 'secondary', 'medium');
        retryBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, height * 0.8);
        this.container.addChild(retryBtn);
    }

    show(): void {
        super.show();
        console.log('✅ Level Complete');
    }

    resize(width: number, height: number): void {
        // Update positioned elements for responsive layout
        const children = this.container.children;
        if (children.length > 0) {
            const title = children[0];
            title.position.set(width / 2, height / 4);
        }
        if (children.length > 1) {
            const scoreDisplay = children[1];
            scoreDisplay.position.set(width / 2 - 100, height / 2);
        }
        if (children.length > 2) {
            const nextBtn = children[2];
            nextBtn.position.set(width / 2 - GAME_SIZES.button.large.width / 2, height * 0.7);
        }
        if (children.length > 3) {
            const retryBtn = children[3];
            retryBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, height * 0.8);
        }
    }
}
