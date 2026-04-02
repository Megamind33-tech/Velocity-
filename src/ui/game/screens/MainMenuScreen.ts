/**
 * MainMenuScreen: Game start menu with level selection
 */

import { Application, Text, TextStyle } from 'pixi.js';
import { BaseGameScreen } from '../GameUIManager';
import { createGameButton, createGamePanel, createGameLabel } from '../GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from '../GameUITheme';

export class MainMenuScreen extends BaseGameScreen {
    constructor(app: Application) {
        super(app);
        this.setupUI();
    }

    private setupUI(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        // Title
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

        const title = new Text({ text: 'VELOCITY', style: titleStyle });
        title.anchor.set(0.5);
        title.position.set(width / 2, height / 4);
        this.container.addChild(title);

        // Subtitle
        const subtitleStyle = new TextStyle({
            fill: GAME_COLORS.text_secondary,
            fontSize: GAME_SIZES.font.lg,
            fontFamily: GAME_FONTS.standard,
        });

        const subtitle = new Text({ text: 'Voice-Powered Flight', style: subtitleStyle });
        subtitle.anchor.set(0.5);
        subtitle.position.set(width / 2, height / 4 + 60);
        this.container.addChild(subtitle);

        // Button container
        const buttonY = height / 2;
        const buttonSpacing = GAME_SIZES.spacing.xl;

        // Start Game button
        const startBtn = createGameButton('START GAME', () => {
            this.uiManager.showScreen('in-game-hud');
        }, 'primary', 'large');
        startBtn.position.set(width / 2 - GAME_SIZES.button.large.width / 2, buttonY);
        this.container.addChild(startBtn);

        // Leaderboard button
        const leaderboardBtn = createGameButton('LEADERBOARD', () => {
            this.uiManager.showScreen('leaderboard', false);
        }, 'secondary', 'medium');
        leaderboardBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, buttonY + buttonSpacing + 20);
        this.container.addChild(leaderboardBtn);

        // Achievements button
        const achievementsBtn = createGameButton('ACHIEVEMENTS', () => {
            this.uiManager.showScreen('achievements', false);
        }, 'secondary', 'medium');
        achievementsBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, buttonY + buttonSpacing * 2 + 40);
        this.container.addChild(achievementsBtn);

        // Settings button
        const settingsBtn = createGameButton('SETTINGS', () => {
            this.uiManager.showScreen('settings', false);
        }, 'secondary', 'medium');
        settingsBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, buttonY + buttonSpacing * 3 + 60);
        this.container.addChild(settingsBtn);
    }

    show(): void {
        super.show();
        console.log('📋 Main Menu opened');
    }

    hide(): void {
        super.hide();
    }

    resize(width: number, height: number): void {
        // Update positioned elements for responsive layout
        const children = this.container.children;
        if (children.length > 0) {
            const title = children[0];
            title.position.set(width / 2, height / 4);
        }
        if (children.length > 1) {
            const subtitle = children[1];
            subtitle.position.set(width / 2, height / 4 + 60);
        }
        const buttonY = height / 2;
        const buttonSpacing = GAME_SIZES.spacing.xl;
        if (children.length > 2) {
            const startBtn = children[2];
            startBtn.position.set(width / 2 - GAME_SIZES.button.large.width / 2, buttonY);
        }
        if (children.length > 3) {
            const leaderboardBtn = children[3];
            leaderboardBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, buttonY + buttonSpacing + 20);
        }
        if (children.length > 4) {
            const achievementsBtn = children[4];
            achievementsBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, buttonY + buttonSpacing * 2 + 40);
        }
        if (children.length > 5) {
            const settingsBtn = children[5];
            settingsBtn.position.set(width / 2 - GAME_SIZES.button.medium.width / 2, buttonY + buttonSpacing * 3 + 60);
        }
    }
}
