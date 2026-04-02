import { Application, Container, Graphics } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton, createGameLabel, createModalDimmer } from '../GameUIComponents';
import { GAME_COLORS, GAME_SIZES } from '../GameUITheme';

export class StoreScreen extends BaseGameScreen {
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
        this.panel = createGamePanel(panelW, panelH, 'modal', 'STORE');
        this.panel.position.set(sw / 2 - panelW / 2, sh / 2 - panelH / 2);
        this.container.addChild(this.panel);

        const content = this.panel.content;
        const pad = GAME_SIZES.spacing.xl;
        const innerW = panelW - pad * 2;

        const balanceLabel = createGameLabel('BALANCE: 1000 TOKENS', GAME_SIZES.font.base, GAME_COLORS.accent_gold, true);
        balanceLabel.anchor.set(0.5, 0);
        balanceLabel.position.set(innerW / 2, 0);
        content.addChild(balanceLabel);

        const btnW = Math.min(280, innerW);
        const btnH = 46;
        const gap = 12;
        let y = GAME_SIZES.spacing.xxl;

        const items = [
            { name: 'POWER-UP', price: 100 },
            { name: 'VOICE BOOST', price: 250 },
            { name: 'SHIELD', price: 500 },
        ];

        items.forEach((item) => {
            const itemBtn = createGameButton(
                `${item.name} (${item.price})`,
                () => console.log(`Purchased: ${item.name}`),
                'accent',
                'medium',
                { width: btnW, height: btnH }
            );
            itemBtn.position.set((innerW - btnW) / 2, y);
            content.addChild(itemBtn);
            y += btnH + gap;
        });

        const backBtn = createGameButton(
            'BACK',
            () => this.uiManager.goBack(),
            'secondary',
            'medium',
            { width: btnW, height: btnH }
        );
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
