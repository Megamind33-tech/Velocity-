import { Application, Container, Text } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton } from '../GameUIComponents';
import { GAME_SIZES } from '../GameUITheme';

export class PauseMenuScreen extends BaseGameScreen {
    private panel!: Container & { content: Container };

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;
        this.panel = createGamePanel(400, 300, 'modal', 'PAUSED');
        this.panel.position.set(width / 2 - 200, height / 2 - 150);
        this.container.addChild(this.panel);

        const content = this.panel.content;
        const buttonY = 30;
        const buttonSpacing = GAME_SIZES.spacing.xl;

        const resumeBtn = createGameButton('RESUME', () => {
            this.uiManager.goBack();
        }, 'primary', 'large');
        resumeBtn.position.set((400 - GAME_SIZES.button.large.width) / 2, buttonY);
        content.addChild(resumeBtn);

        const settingsBtn = createGameButton('SETTINGS', () => {
            this.uiManager.showScreen('settings', false);
        }, 'secondary', 'medium');
        settingsBtn.position.set((400 - GAME_SIZES.button.medium.width) / 2, buttonY + buttonSpacing + 20);
        content.addChild(settingsBtn);

        const mainMenuBtn = createGameButton('MAIN MENU', () => {
            this.uiManager.showScreen('main-menu');
        }, 'danger', 'medium');
        mainMenuBtn.position.set((400 - GAME_SIZES.button.medium.width) / 2, buttonY + buttonSpacing * 2 + 40);
        content.addChild(mainMenuBtn);
    }

    show(): void {
        super.show();
        console.log('⏸️  Pause Menu opened');
    }

    resize(width: number, height: number): void {
        if (this.panel) {
            this.panel.position.set(width / 2 - 200, height / 2 - 150);
        }
    }
}
