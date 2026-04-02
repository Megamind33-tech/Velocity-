import { Application, Container } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton } from '../GameUIComponents';
import { GAME_SIZES } from '../GameUITheme';
import { gameFlow, resumeFromGamePause } from '../gameFlowBridge';

export class PauseMenuScreen extends BaseGameScreen {
    private panel!: Container & { content: Container };

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;
        const panelW = Math.min(340, width - 32);
        const panelH = Math.min(320, height * 0.55);
        this.panel = createGamePanel(panelW, panelH, 'modal', 'PAUSED');
        this.panel.position.set(width / 2 - panelW / 2, height / 2 - panelH / 2);
        this.container.addChild(this.panel);

        const content = this.panel.content;
        const innerPad = GAME_SIZES.spacing.xl * 2;
        const innerW = panelW - innerPad;
        const btnW = Math.min(260, innerW);
        const btnH = 48;
        const gap = 14;
        let y = 8;
        const btnX = (innerW - btnW) / 2;

        const resumeBtn = createGameButton(
            'RESUME',
            () => {
                resumeFromGamePause();
                this.uiManager.goBack();
            },
            'primary',
            'large',
            { width: btnW, height: btnH }
        );
        resumeBtn.position.set(btnX, y);
        y += btnH + gap;

        const settingsBtn = createGameButton(
            'SETTINGS',
            () => {
                this.uiManager.showScreen('settings', true);
            },
            'secondary',
            'medium',
            { width: btnW, height: btnH }
        );
        settingsBtn.position.set(btnX, y);
        y += btnH + gap;

        const mainMenuBtn = createGameButton(
            'MAIN MENU',
            () => {
                resumeFromGamePause();
                gameFlow().openMainMenu();
                this.uiManager.showScreen('main-menu');
            },
            'danger',
            'medium',
            { width: btnW, height: btnH }
        );
        mainMenuBtn.position.set(btnX, y);

        content.addChild(resumeBtn, settingsBtn, mainMenuBtn);
    }

    show(): void {
        super.show();
    }

    resize(width: number, height: number): void {
        if (!this.panel) return;
        const panelW = Math.min(340, width - 32);
        const panelH = Math.min(320, height * 0.55);
        this.panel.position.set(width / 2 - panelW / 2, height / 2 - panelH / 2);
    }
}
