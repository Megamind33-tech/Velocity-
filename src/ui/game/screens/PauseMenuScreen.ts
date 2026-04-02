import { Application } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton } from '../GameUIComponents';
import { GAME_SIZES } from '../GameUITheme';

export class PauseMenuScreen extends BaseGameScreen {
    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;
        const panel = createGamePanel(400, 300, 'modal', 'PAUSED');
        panel.position.set(width / 2 - 200, height / 2 - 150);
        this.container.addChild(panel);

        const buttonY = 100;
        const buttonSpacing = GAME_SIZES.spacing.xl;

        const resumeBtn = createGameButton('RESUME', () => {
            this.uiManager.goBack();
        }, 'primary', 'large');
        resumeBtn.position.set(100, buttonY);
        panel.addChild(resumeBtn);

        const settingsBtn = createGameButton('SETTINGS', () => {
            this.uiManager.showScreen('settings', false);
        }, 'secondary', 'medium');
        settingsBtn.position.set(140, buttonY + buttonSpacing + 20);
        panel.addChild(settingsBtn);

        const mainMenuBtn = createGameButton('MAIN MENU', () => {
            this.uiManager.showScreen('main-menu');
        }, 'danger', 'medium');
        mainMenuBtn.position.set(140, buttonY + buttonSpacing * 2 + 40);
        panel.addChild(mainMenuBtn);
    }

    show(): void {
        super.show();
        console.log('⏸️  Pause Menu opened');
    }
}
