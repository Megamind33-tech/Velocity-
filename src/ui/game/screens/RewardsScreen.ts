import { Application, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createStatDisplay } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import {
    buildVelocityModal,
    repositionVelocityModal,
    syncModalShellResize,
    velocityModalInnerWidth,
    type VelocityModalLayout,
} from '../velocityModalLayout';
import { createVelocityGameButton } from '../velocityUiButtons';

export class RewardsScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const sw = this.app.screen.width;
        const sh = this.app.screen.height;
        const panelW = Math.min(450, sw - 24);
        const panelH = Math.min(440, sh - 48);

        this.layout = buildVelocityModal(this.container, this.app, 'DAILY REWARDS', panelW, panelH, GAME_COLORS.accent_gold);
        const { body, innerW } = this.layout;

        const subStyle = new TextStyle({
            fill: GAME_COLORS.accent_gold,
            fontSize: GAME_SIZES.font.lg,
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.standard,
        });
        const subtitle = new Text({ text: 'Come back tomorrow!', style: subStyle });
        subtitle.anchor.set(0.5, 0);
        subtitle.position.set(innerW / 2, 0);
        body.addChild(subtitle);

        let y = GAME_SIZES.spacing.xxl;
        const rewards = [
            { day: 'DAY 1', tokens: 100 },
            { day: 'DAY 2', tokens: 250 },
            { day: 'DAY 3', tokens: 500 },
        ];

        rewards.forEach((reward) => {
            const rewardDisplay = createStatDisplay(reward.day, `+${reward.tokens}`, GAME_COLORS.accent_green);
            rewardDisplay.position.set((innerW - 200) / 2, y);
            body.addChild(rewardDisplay);
            y += GAME_SIZES.spacing.xl;
        });

        const btnW = Math.min(260, innerW);
        const btnH = 46;
        const claimBtn = createVelocityGameButton(
            'CLAIM REWARD',
            'success',
            () => {
                console.log('Reward claimed!');
                this.uiManager.goBack();
            },
            { width: btnW, height: btnH }
        );
        claimBtn.position.set((innerW - btnW) / 2, y + 8);
        body.addChild(claimBtn);

        const backBtn = createVelocityGameButton('BACK', 'secondary', () => this.uiManager.goBack(), {
            width: btnW,
            height: btnH,
        });
        backBtn.position.set((innerW - btnW) / 2, y + btnH + 20);
        body.addChild(backBtn);
    }

    show(): void {
        super.show();
    }

    resize(width: number, height: number): void {
        syncModalShellResize(this.layout, this.container, width, height);
        const panelW = Math.min(450, width - 24);
        const panelH = Math.min(440, height - 48);
        this.layout.panelW = panelW;
        this.layout.panelH = panelH;
        this.layout.innerW = velocityModalInnerWidth(panelW);
        repositionVelocityModal(this.layout, width, height);
    }
}
