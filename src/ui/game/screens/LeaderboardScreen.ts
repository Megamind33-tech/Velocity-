import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton, createGameLabel, createModalDimmer } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';

export class LeaderboardScreen extends BaseGameScreen {
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
        this.panel = createGamePanel(panelW, panelH, 'modal', 'LEADERBOARD');
        this.panel.position.set(sw / 2 - panelW / 2, sh / 2 - panelH / 2);
        this.container.addChild(this.panel);

        const content = this.panel.content;
        const pad = GAME_SIZES.spacing.xl;
        const innerW = panelW - pad * 2;

        const scores = [
            { rank: 1, name: 'VOICE MASTER', score: 15000 },
            { rank: 2, name: 'PITCH PERFECT', score: 12500 },
            { rank: 3, name: 'SOUND WAVE', score: 10000 },
        ];

        let y = 0;
        scores.forEach((entry) => {
            const entryText = `${entry.rank}. ${entry.name}  ·  ${entry.score}`;
            const label = createGameLabel(entryText, GAME_SIZES.font.lg, GAME_COLORS.primary, true);
            label.position.y = y;
            content.addChild(label);
            y += GAME_SIZES.spacing.lg;
        });

        const hint = new Text({
            text: 'Live scores sync in a future update',
            style: new TextStyle({
                fill: GAME_COLORS.text_muted,
                fontSize: GAME_SIZES.font.sm,
                fontFamily: GAME_FONTS.standard,
            }),
        });
        hint.position.set(0, y + 4);
        content.addChild(hint);
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
            const panelW = Math.min(500, width - 24);
            const panelH = Math.min(520, height - 48);
            this.panel.position.set(width / 2 - panelW / 2, height / 2 - panelH / 2);
        }
    }
}
