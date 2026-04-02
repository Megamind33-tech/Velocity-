import { Application, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGameButton, createStatDisplay } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';

export class GameOverScreen extends BaseGameScreen {
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
        const title = new Text({ text: 'GAME OVER', style: titleStyle });
        title.anchor.set(0.5);
        title.position.set(width / 2, height / 4);
        this.container.addChild(title);

        const statsContainer = new (require('pixi.js').Container)();
        statsContainer.position.set(width / 2 - 100, height / 2);
        this.container.addChild(statsContainer);

        const scoreDisplay = createStatDisplay('FINAL SCORE', '0', GAME_COLORS.accent_gold);
        scoreDisplay.position.y = 0;
        statsContainer.addChild(scoreDisplay);

        const restartBtn = createGameButton('PLAY AGAIN', () => {
            this.uiManager.showScreen('in-game-hud');
        }, 'success', 'large');
        restartBtn.position.set(width / 2 - GAME_SIZES.button.large.width / 2, height * 0.7);
        this.container.addChild(restartBtn);

        const menuBtn = createGameButton('MAIN MENU', () => {
            this.uiManager.showScreen('main-menu');
        }, 'secondary', 'medium');
        menuBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, height * 0.8);
        this.container.addChild(menuBtn);
    }

    show(): void {
        super.show();
        console.log('💀 Game Over');
    }
}
