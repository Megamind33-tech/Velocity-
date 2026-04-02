import { Application, Container, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton, createGameLabel } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';

export class SettingsScreen extends BaseGameScreen {
    private panel: Container & { content: Container };

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        this.panel = createGamePanel(450, 400, 'modal', 'SETTINGS');
        this.panel.position.set(width / 2 - 225, height / 2 - 200);
        this.container.addChild(this.panel);

        const content = this.panel.content;
        let y = 0;

        const musicLabel = createGameLabel('MUSIC VOLUME', GAME_SIZES.font.base, GAME_COLORS.text_primary);
        musicLabel.position.y = y;
        content.addChild(musicLabel);
        y += GAME_SIZES.spacing.xl;

        const soundLabel = createGameLabel('SFX VOLUME', GAME_SIZES.font.base, GAME_COLORS.text_primary);
        soundLabel.position.y = y;
        content.addChild(soundLabel);
        y += GAME_SIZES.spacing.xl;

        const difficultyLabel = createGameLabel('DIFFICULTY', GAME_SIZES.font.base, GAME_COLORS.text_primary);
        difficultyLabel.position.y = y;
        content.addChild(difficultyLabel);
        y += GAME_SIZES.spacing.xl * 2;

        const backBtn = createGameButton('BACK', () => {
            this.uiManager.goBack();
        }, 'secondary', 'medium');
        backBtn.position.set((450 - GAME_SIZES.button.medium.width) / 2, y);
        content.addChild(backBtn);
    }

    show(): void {
        super.show();
        console.log('⚙️  Settings opened');
    }

    resize(width: number, height: number): void {
        if (this.panel) {
            this.panel.position.set(width / 2 - 225, height / 2 - 200);
        }
    }
}
