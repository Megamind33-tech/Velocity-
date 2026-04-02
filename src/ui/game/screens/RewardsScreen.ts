import { Application, Container, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton, createStatDisplay } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';

export class RewardsScreen extends BaseGameScreen {
    private panel: Container & { content: Container };

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        this.panel = createGamePanel(450, 400, 'modal', 'DAILY REWARDS');
        this.panel.position.set(width / 2 - 225, height / 2 - 200);
        this.container.addChild(this.panel);

        const content = this.panel.content;

        const titleStyle = new TextStyle({
            fill: GAME_COLORS.accent_gold,
            fontSize: GAME_SIZES.font.lg,
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.standard,
        });
        const subtitle = new Text({ text: 'Come back tomorrow!', style: titleStyle });
        subtitle.anchor.set(0.5);
        subtitle.position.set(225, 0);
        content.addChild(subtitle);

        let y = GAME_SIZES.spacing.xxl;
        const rewards = [
            { day: 'DAY 1', tokens: 100 },
            { day: 'DAY 2', tokens: 250 },
            { day: 'DAY 3', tokens: 500 },
        ];

        rewards.forEach((reward) => {
            const rewardDisplay = createStatDisplay(reward.day, `+${reward.tokens}`, GAME_COLORS.accent_green);
            rewardDisplay.position.y = y;
            content.addChild(rewardDisplay);
            y += GAME_SIZES.spacing.xl;
        });

        const claimBtn = createGameButton('CLAIM REWARD', () => {
            console.log('Reward claimed!');
            this.uiManager.goBack();
        }, 'success', 'large');
        claimBtn.position.set((450 - GAME_SIZES.button.large.width) / 2, y);
        content.addChild(claimBtn);
    }

    show(): void {
        super.show();
        console.log('🎁 Rewards opened');
    }

    resize(width: number, height: number): void {
        if (this.panel) {
            this.panel.position.set(width / 2 - 225, height / 2 - 200);
        }
    }
}
