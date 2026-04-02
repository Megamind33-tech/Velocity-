import { Application, Container, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton, createGameLabel } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';

export class AchievementsScreen extends BaseGameScreen {
    private panel!: Container & { content: Container };

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        this.panel = createGamePanel(500, 500, 'modal', 'ACHIEVEMENTS');
        this.panel.position.set(width / 2 - 250, height / 2 - 250);
        this.container.addChild(this.panel);

        const content = this.panel.content;

        const achievements = [
            { name: '🎤 FIRST FLIGHT', desc: 'Complete level 1' },
            { name: '🏆 HIGH FLYER', desc: 'Score 10000 points' },
            { name: '⭐ PERFECT PITCH', desc: 'Perfect accuracy' },
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

        const backBtn = createGameButton('BACK', () => {
            this.uiManager.goBack();
        }, 'secondary', 'medium');
        backBtn.position.set((500 - GAME_SIZES.button.medium.width) / 2, y);
        content.addChild(backBtn);
    }

    show(): void {
        super.show();
        console.log('🏅 Achievements opened');
    }

    resize(width: number, height: number): void {
        if (this.panel) {
            this.panel.position.set(width / 2 - 250, height / 2 - 250);
        }
    }
}
