import { Application, Container, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton, createGameLabel, createDivider } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';

export class LeaderboardScreen extends BaseGameScreen {
    private panel: Container & { content: Container };

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        this.panel = createGamePanel(500, 500, 'modal', 'LEADERBOARD');
        this.panel.position.set(width / 2 - 250, height / 2 - 250);
        this.container.addChild(this.panel);

        const content = this.panel.content;

        // Mock leaderboard data
        const scores = [
            { rank: 1, name: 'VOICE MASTER', score: 15000 },
            { rank: 2, name: 'PITCH PERFECT', score: 12500 },
            { rank: 3, name: 'SOUND WAVE', score: 10000 },
        ];

        let y = 0;
        scores.forEach((entry, idx) => {
            const entryText = `${entry.rank}. ${entry.name} - ${entry.score}`;
            const label = createGameLabel(entryText, GAME_SIZES.font.lg, GAME_COLORS.primary, true);
            label.position.y = y;
            content.addChild(label);
            y += GAME_SIZES.spacing.lg;
        });

        const backBtn = createGameButton('BACK', () => {
            this.uiManager.goBack();
        }, 'secondary', 'medium');
        backBtn.position.set((500 - GAME_SIZES.button.medium.width) / 2, y + GAME_SIZES.spacing.xl * 2);
        content.addChild(backBtn);
    }

    show(): void {
        super.show();
        console.log('🏆 Leaderboard opened');
    }

    resize(width: number, height: number): void {
        if (this.panel) {
            this.panel.position.set(width / 2 - 250, height / 2 - 250);
        }
    }
}
