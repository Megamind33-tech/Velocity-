import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGameButton, createModalDimmer } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES, GAME_PANEL_STYLES } from '../GameUITheme';
import { gameFlow, resumeFromGamePause } from '../gameFlowBridge';
import { ResponsiveUIManager } from '../../ResponsiveUIManager';

/**
 * Pause: full-screen dimmer, in-game HUD hidden while visible (see main pause handler).
 * Panel height is computed from buttons so nothing clips on short phones.
 */
export class PauseMenuScreen extends BaseGameScreen {
    private dimmer!: Graphics;
    private panel!: Container;
    private panelBg!: Graphics;
    private titleText!: Text;
    private content!: Container;

    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const sw = this.app.screen.width;
        const sh = this.app.screen.height;

        this.dimmer = createModalDimmer(sw, sh, 0.84);
        this.container.addChild(this.dimmer);

        this.panel = new Container();
        this.panelBg = new Graphics();
        this.panel.addChild(this.panelBg);

        const modal = GAME_PANEL_STYLES.modal;
        this.titleText = new Text({
            text: 'PAUSED',
            style: new TextStyle({
                fill: modal.border,
                fontSize: GAME_SIZES.font.xl,
                fontWeight: 'bold',
                fontFamily: GAME_FONTS.arcade,
                dropShadow: {
                    alpha: 0.6,
                    blur: 2,
                    color: GAME_COLORS.bg_darkest,
                    distance: 1,
                },
            }),
        });
        this.titleText.anchor.set(0.5, 0);
        this.panel.addChild(this.titleText);

        this.content = new Container();
        this.panel.addChild(this.content);
        this.container.addChild(this.panel);

        this.layoutPause();
    }

    private layoutPause(): void {
        const sw = this.app.screen.width;
        const sh = this.app.screen.height;
        const safe = ResponsiveUIManager.getInstance().getSafeAreaPadding();
        const modal = GAME_PANEL_STYLES.modal;

        this.dimmer.clear();
        this.dimmer.rect(0, 0, sw, sh);
        this.dimmer.fill({ color: 0x020208, alpha: 0.84 });

        const maxPanelH = sh - safe.top - safe.bottom - 20;
        const panelW = Math.min(320, sw - 28);
        const pad = modal.padding;
        const contentTop = GAME_SIZES.spacing.xl + GAME_SIZES.spacing.lg;

        let btnH = 44;
        let gap = 12;
        const innerTop = 6;
        let innerH = innerTop + btnH * 3 + gap * 2;
        let bottomPad = GAME_SIZES.spacing.lg;
        let panelH = pad + contentTop + innerH + bottomPad;

        if (panelH > maxPanelH) {
            btnH = 40;
            gap = 10;
            innerH = innerTop + btnH * 3 + gap * 2;
            panelH = pad + contentTop + innerH + bottomPad;
        }
        if (panelH > maxPanelH) {
            btnH = 36;
            gap = 8;
            innerH = innerTop + btnH * 3 + gap * 2;
            panelH = pad + contentTop + innerH + bottomPad;
        }
        if (panelH > maxPanelH) {
            bottomPad = GAME_SIZES.spacing.md;
            panelH = pad + contentTop + innerH + bottomPad;
        }
        panelH = Math.min(panelH, maxPanelH);
        panelH = Math.max(panelH, pad + contentTop + innerH + bottomPad);

        const panelX = sw / 2 - panelW / 2;
        const panelY = safe.top + 10 + Math.max(0, (maxPanelH - panelH) / 2);
        this.panel.position.set(panelX, panelY);

        this.panelBg.clear();
        this.panelBg.roundRect(0, 0, panelW, panelH, modal.corner_radius);
        this.panelBg.fill({ color: modal.bg, alpha: modal.bg_alpha });
        this.panelBg.stroke({
            color: modal.border,
            width: modal.border_width,
            alpha: 1,
        });

        this.titleText.position.set(panelW / 2, GAME_SIZES.spacing.lg);
        this.content.position.set(pad, contentTop);

        const innerW = panelW - pad * 2;
        const btnW = Math.max(160, innerW - 8);
        const btnX = (innerW - btnW) / 2;

        this.content.removeChildren();
        let y = innerTop;

        const resumeBtn = createGameButton(
            'RESUME',
            () => {
                resumeFromGamePause();
                this.uiManager.goBack();
            },
            'primary',
            'large',
            { width: btnW, height: btnH }
        );
        resumeBtn.position.set(btnX, y);
        y += btnH + gap;

        const settingsBtn = createGameButton(
            'SETTINGS',
            () => {
                this.uiManager.showScreen('settings', true);
            },
            'secondary',
            'medium',
            { width: btnW, height: btnH }
        );
        settingsBtn.position.set(btnX, y);
        y += btnH + gap;

        const mainMenuBtn = createGameButton(
            'MAIN MENU',
            () => {
                resumeFromGamePause();
                gameFlow().openMainMenu();
                this.uiManager.showScreen('main-menu');
            },
            'danger',
            'medium',
            { width: btnW, height: btnH }
        );
        mainMenuBtn.position.set(btnX, y);

        this.content.addChild(resumeBtn, settingsBtn, mainMenuBtn);
    }

    show(): void {
        super.show();
        this.layoutPause();
    }

    resize(width: number, height: number): void {
        this.layoutPause();
    }
}
