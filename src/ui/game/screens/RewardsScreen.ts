import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton, createStatDisplay, createModalDimmer } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';

export class RewardsScreen extends BaseGameScreen {
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
        const panelH = Math.min(440, sh - 48);
        this.panel = createGamePanel(panelW, panelH, 'modal', 'DAILY REWARDS');
        this.panel.position.set(sw / 2 - panelW / 2, sh / 2 - panelH / 2);
        this.container.addChild(this.panel);

        const content = this.panel.content;
        const pad = GAME_SIZES.spacing.xl;
        const innerW = panelW - pad * 2;

        const titleStyle = new TextStyle({
            fill: GAME_COLORS.accent_gold,
            fontSize: GAME_SIZES.font.lg,
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.standard,
        });
        const subtitle = new Text({ text: 'Come back tomorrow!', style: titleStyle });
        subtitle.anchor.set(0.5, 0);
        subtitle.position.set(innerW / 2, 0);
        content.addChild(subtitle);

        let y = GAME_SIZES.spacing.xxl;
        const rewards = [
            { day: 'DAY 1', tokens: 100 },
            { day: 'DAY 2', tokens: 250 },
            { day: 'DAY 3', tokens: 500 },
        ];

        rewards.forEach((reward) => {
            const rewardDisplay = createStatDisplay(reward.day, `+${reward.tokens}`, GAME_COLORS.accent_green);
            rewardDisplay.position.set((innerW - 200) / 2, y);
            content.addChild(rewardDisplay);
            y += GAME_SIZES.spacing.xl;
        });

        const btnW = Math.min(260, innerW);
        const btnH = 46;
        const claimBtn = createGameButton(
            'CLAIM REWARD',
            () => {
                console.log('Reward claimed!');
                this.uiManager.goBack();
            },
            'success',
            'large',
            { width: btnW, height: btnH }
        );
        claimBtn.position.set((innerW - btnW) / 2, y + 8);
        content.addChild(claimBtn);

        const backBtn = createGameButton('BACK', () => this.uiManager.goBack(), 'secondary', 'medium', {
            width: btnW,
            height: btnH,
        });
        backBtn.position.set((innerW - btnW) / 2, y + btnH + 20);
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
            const panelH = Math.min(440, height - 48);
            this.panel.position.set(width / 2 - panelW / 2, height / 2 - panelH / 2);
        }
    }
}
