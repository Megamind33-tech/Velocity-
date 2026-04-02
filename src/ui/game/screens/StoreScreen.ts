import { Application, Container, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGamePanel, createGameButton, createGameLabel } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';

export class StoreScreen extends BaseGameScreen {
    private panel!: Container & { content: Container };

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        this.panel = createGamePanel(500, 500, 'modal', 'STORE');
        this.panel.position.set(width / 2 - 250, height / 2 - 250);
        this.container.addChild(this.panel);

        const content = this.panel.content;

        const balanceLabel = createGameLabel('BALANCE: 1000 TOKENS', GAME_SIZES.font.lg, GAME_COLORS.accent_gold, true);
        balanceLabel.position.y = 0;
        content.addChild(balanceLabel);

        let y = GAME_SIZES.spacing.xxl;
        const items = [
            { name: 'POWER-UP', price: 100 },
            { name: 'VOICE BOOST', price: 250 },
            { name: 'SHIELD', price: 500 },
        ];

        items.forEach((item, idx) => {
            const itemBtn = createGameButton(`${item.name} (${item.price})`, () => {
                console.log(`Purchased: ${item.name}`);
            }, 'accent', 'medium');
            itemBtn.position.set((500 - GAME_SIZES.button.medium.width) / 2, y);
            content.addChild(itemBtn);
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
        console.log('🛍️  Store opened');
    }

    resize(width: number, height: number): void {
        if (this.panel) {
            this.panel.position.set(width / 2 - 250, height / 2 - 250);
        }
    }
}
