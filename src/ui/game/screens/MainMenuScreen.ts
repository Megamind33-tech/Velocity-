/**
 * Main menu — Kenney UI Pack only (uniform chrome + shared backdrop).
 */

import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGameButton, createMenuBackdrop } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';
import { gameFlow } from '../gameFlowBridge';
import { createKenneyNineSliceButton, createKenneyPanelNineSlice } from '../kenneyNineSlice';
import { velocityUiArtReady } from '../velocityUiArt';

const TITLE_PLATE_H = 112;

export class MainMenuScreen extends BaseGameScreen {
    private backdrop!: Container;
    private titlePlate!: Container;
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

        this.titlePlate = new Container();
        this.container.addChild(this.titlePlate);

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

        this.layoutTitlePlate(width, height);
        this.layoutTextAndButtons(width, height);
        this.buildButtons();
    }

    private layoutTitlePlate(width: number, height: number): void {
        this.titlePlate.removeChildren();
        const plateW = Math.min(340, width - 36);
        const plate = createKenneyPanelNineSlice(plateW, TITLE_PLATE_H);
        if (plate) {
            this.titlePlate.addChild(plate);
        } else {
            const g = new Graphics();
            g.roundRect(0, 0, plateW, TITLE_PLATE_H, 12);
            g.fill({ color: GAME_COLORS.panel_bg, alpha: 0.92 });
            g.stroke({ color: GAME_COLORS.primary, width: 2, alpha: 0.5 });
            this.titlePlate.addChild(g);
        }
        this.titlePlate.position.set(width / 2 - plateW / 2, Math.max(16, height * 0.08));
    }

    private layoutTextAndButtons(width: number, height: number): void {
        const plateTop = this.titlePlate.y;
        this.titleText.position.set(width / 2, plateTop + 36);
        this.subtitleText.position.set(width / 2, plateTop + 78);
        this.buttonColumn.position.set(width / 2, plateTop + TITLE_PLATE_H + 28);
    }

    private buildButtons(): void {
        this.buttonColumn.removeChildren();
        const width = this.app.screen.width;
        const btnW = Math.min(288, Math.max(200, width - 48));
        const btnH = 52;
        const gap = 10;
        const useArt = velocityUiArtReady();

        const addBtn = (
            label: string,
            variant: 'primary' | 'secondary' | 'accent',
            onClick: () => void
        ) => {
            const v = variant === 'primary' ? 'primary' : variant === 'accent' ? 'accent' : 'neutral';
            const kenney = useArt && createKenneyNineSliceButton(label, btnW, btnH, v, onClick);
            const b =
                kenney ||
                createGameButton(label, onClick, variant, 'large', { width: btnW, height: btnH });
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
        this.layoutTitlePlate(width, height);
        this.layoutTextAndButtons(width, height);
        this.buildButtons();
    }
}
