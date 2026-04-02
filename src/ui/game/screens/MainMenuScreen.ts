/**
 * MainMenuScreen: Game start menu with level selection
 */

import { Application, Container, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGameButton, createMenuBackdrop } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { gameFlow } from '../gameFlowBridge';

export class MainMenuScreen extends BaseGameScreen {
    private backdrop!: Container;
    private titleText!: Text;
    private subtitleText!: Text;
    private buttonColumn!: Container;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        this.backdrop = createMenuBackdrop(width, height);
        this.container.addChild(this.backdrop);

        const titleStyle = new TextStyle({
            fill: GAME_COLORS.primary,
            fontSize: GAME_SIZES.font.title,
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.arcade,
            dropShadow: {
                alpha: 0.8,
                blur: 4,
                color: GAME_COLORS.primary,
                distance: 0,
            },
        });

        this.titleText = new Text({ text: 'VELOCITY', style: titleStyle });
        this.titleText.anchor.set(0.5);
        this.container.addChild(this.titleText);

        const subtitleStyle = new TextStyle({
            fill: GAME_COLORS.text_secondary,
            fontSize: GAME_SIZES.font.lg,
            fontFamily: GAME_FONTS.standard,
        });

        this.subtitleText = new Text({ text: 'Voice-Powered Flight', style: subtitleStyle });
        this.subtitleText.anchor.set(0.5);
        this.container.addChild(this.subtitleText);

        this.buttonColumn = new Container();
        this.container.addChild(this.buttonColumn);

        this.layoutForSize(width, height);
        this.buildButtons();
    }

    private layoutForSize(width: number, height: number): void {
        this.titleText.position.set(width / 2, height * 0.18);
        this.subtitleText.position.set(width / 2, height * 0.18 + 52);
        this.buttonColumn.position.set(width / 2, height * 0.42);
    }

    private buildButtons(): void {
        this.buttonColumn.removeChildren();
        const width = this.app.screen.width;
        const btnW = Math.min(288, Math.max(200, width - 48));
        const btnH = 48;
        const gap = 12;

        const addBtn = (label: string, type: 'primary' | 'secondary' | 'accent', onClick: () => void) => {
            const b = createGameButton(label, onClick, type, 'large', { width: btnW, height: btnH });
            b.position.set(-btnW / 2, this.buttonColumn.children.length * (btnH + gap));
            this.buttonColumn.addChild(b);
        };

        addBtn('MISSION SELECT', 'primary', () => gameFlow().openMissionSelect());
        addBtn('LEADERBOARD', 'secondary', () => this.uiManager.showScreen('leaderboard', true));
        addBtn('ACHIEVEMENTS', 'secondary', () => this.uiManager.showScreen('achievements', true));
        addBtn('STORE', 'accent', () => this.uiManager.showScreen('store', true));
        addBtn('REWARDS', 'accent', () => this.uiManager.showScreen('rewards', true));
        addBtn('SETTINGS', 'secondary', () => this.uiManager.showScreen('settings', true));
    }

    show(): void {
        super.show();
    }

    resize(width: number, height: number): void {
        this.backdrop.destroy({ children: true });
        this.backdrop = createMenuBackdrop(width, height);
        this.container.addChildAt(this.backdrop, 0);
        this.layoutForSize(width, height);
        this.buildButtons();
    }
}
