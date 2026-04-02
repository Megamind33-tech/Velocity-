import { Application } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGameLabel } from '../GameUIComponents';
import { GAME_COLORS, GAME_SIZES } from '../GameUITheme';
import {
    buildVelocityModal,
    repositionVelocityModal,
    syncModalShellResize,
    velocityModalInnerWidth,
    type VelocityModalLayout,
} from '../velocityModalLayout';
import { createVelocityGameButton } from '../velocityUiButtons';

export class StoreScreen extends BaseGameScreen {
    private layout!: VelocityModalLayout;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const sw = this.app.screen.width;
        const sh = this.app.screen.height;
        const panelW = Math.min(500, sw - 24);
        const panelH = Math.min(520, sh - 48);

        this.layout = buildVelocityModal(this.container, this.app, 'STORE', panelW, panelH);
        const { body, innerW } = this.layout;

        const balanceLabel = createGameLabel('BALANCE: 1000 TOKENS', GAME_SIZES.font.base, GAME_COLORS.accent_gold, true);
        balanceLabel.anchor.set(0.5, 0);
        balanceLabel.position.set(innerW / 2, 0);
        body.addChild(balanceLabel);

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
            const itemBtn = createVelocityGameButton(
                `${item.name} (${item.price})`,
                'accent',
                () => console.log(`Purchased: ${item.name}`),
                { width: btnW, height: btnH }
            );
            itemBtn.position.set((innerW - btnW) / 2, y);
            body.addChild(itemBtn);
            y += btnH + gap;
        });

        const backBtn = createVelocityGameButton('BACK', 'secondary', () => this.uiManager.goBack(), {
            width: btnW,
            height: btnH,
        });
        backBtn.position.set((innerW - btnW) / 2, y + 8);
        body.addChild(backBtn);
    }

    show(): void {
        super.show();
    }

    resize(width: number, height: number): void {
        syncModalShellResize(this.layout, this.container, width, height);
        const panelW = Math.min(500, width - 24);
        const panelH = Math.min(520, height - 48);
        this.layout.panelW = panelW;
        this.layout.panelH = panelH;
        this.layout.innerW = velocityModalInnerWidth(panelW);
        repositionVelocityModal(this.layout, width, height);
    }
}
