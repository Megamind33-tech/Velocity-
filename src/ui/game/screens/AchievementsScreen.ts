import { Application, Container, Graphics } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton, createGameLabel, createModalDimmer } from '../GameUIComponents';
import { GAME_COLORS, GAME_SIZES } from '../GameUITheme';

export class AchievementsScreen extends BaseGameScreen {
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

        const panelW = Math.min(500, sw - 24);
        const panelH = Math.min(520, sh - 48);
        this.panel = createGamePanel(panelW, panelH, 'modal', 'ACHIEVEMENTS');
        this.panel.position.set(sw / 2 - panelW / 2, sh / 2 - panelH / 2);
        this.container.addChild(this.panel);

        const content = this.panel.content;
        const pad = GAME_SIZES.spacing.xl;
        const innerW = panelW - pad * 2;

        const achievements = [
            { name: 'FIRST FLIGHT', desc: 'Complete level 1' },
            { name: 'HIGH FLYER', desc: 'Score 10000 points' },
            { name: 'PERFECT PITCH', desc: 'Perfect accuracy' },
        ];

        let y = 0;
        achievements.forEach((ach) => {
            const achLabel = createGameLabel(ach.name, GAME_SIZES.font.base, GAME_COLORS.primary, true);
            achLabel.position.y = y;
            content.addChild(achLabel);

            const descLabel = createGameLabel(ach.desc, GAME_SIZES.font.sm, GAME_COLORS.text_secondary);
            descLabel.position.y = y + GAME_SIZES.spacing.md;
            content.addChild(descLabel);

            y += GAME_SIZES.spacing.xl + 10;
        });

        const btnW = Math.min(260, innerW);
        const btnH = 46;
        const backBtn = createGameButton('BACK', () => this.uiManager.goBack(), 'secondary', 'medium', {
            width: btnW,
            height: btnH,
        });
        backBtn.position.set((innerW - btnW) / 2, y + 8);
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
            const panelW = Math.min(500, width - 24);
            const panelH = Math.min(520, height - 48);
            this.panel.position.set(width / 2 - panelW / 2, height / 2 - panelH / 2);
        }
    }
}
