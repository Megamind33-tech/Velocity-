import { Application, Container, Graphics } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton, createGameLabel, createModalDimmer } from '../GameUIComponents';
import { GAME_COLORS, GAME_SIZES } from '../GameUITheme';

export class SettingsScreen extends BaseGameScreen {
    private dimmer!: Graphics;
    private panel!: Container & { content: Container };

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const sw = this.app.screen.width;
        const sh = this.app.screen.height;

        this.dimmer = createModalDimmer(sw, sh);
        this.container.addChild(this.dimmer);

        const panelW = Math.min(450, sw - 24);
        const panelH = Math.min(420, sh - 48);
        this.panel = createGamePanel(panelW, panelH, 'modal', 'SETTINGS');
        this.panel.position.set(sw / 2 - panelW / 2, sh / 2 - panelH / 2);
        this.container.addChild(this.panel);

        const content = this.panel.content;
        const pad = GAME_SIZES.spacing.xl;
        const innerW = panelW - pad * 2;

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

        const btnW = Math.min(260, innerW);
        const btnH = 46;
        const backBtn = createGameButton('BACK', () => this.uiManager.goBack(), 'secondary', 'medium', {
            width: btnW,
            height: btnH,
        });
        backBtn.position.set((innerW - btnW) / 2, y);
        content.addChild(backBtn);
    }

    show(): void {
        super.show();
    }

    resize(width: number, height: number): void {
        this.dimmer.clear();
        this.dimmer.rect(0, 0, width, height);
        this.dimmer.fill({ color: 0x050510, alpha: 0.78 });
        if (this.panel) {
            const panelW = Math.min(450, width - 24);
            const panelH = Math.min(420, height - 48);
            this.panel.position.set(width / 2 - panelW / 2, height / 2 - panelH / 2);
        }
    }
}
