import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GameState } from '../engine/GameState';
import { VoiceInputManager } from '../engine/input/VoiceInputManager';
import { ResponsiveUIManager } from './ResponsiveUIManager';

/**
 * Menu / pause controls only — does not steer the craft.
 * Fully responsive to screen size and orientation.
 */
export class PauseOverlay extends Container {
    private pauseBtn: Container;
    private pauseMenu: Container;
    private pausedLabel: Text;
    private resumeBtn: Container;
    private responsiveManager: ResponsiveUIManager;

    constructor(private readonly app: Application) {
        super();
        this.responsiveManager = ResponsiveUIManager.getInstance();

        // Create pause button
        this.pauseBtn = this.makePauseButton('PAUSE', () => this.enterPause());
        this.updatePauseButtonPosition();
        this.addChild(this.pauseBtn);

        // Create pause menu (hidden by default)
        this.pauseMenu = new Container();
        this.pauseMenu.visible = false;

        // Dimmed overlay
        const dim = new Graphics();
        dim.rect(0, 0, app.screen.width, app.screen.height);
        dim.fill({ color: 0x000000, alpha: 0.75 });
        dim.eventMode = 'static';
        this.pauseMenu.addChild(dim);

        // Paused label
        const pausedLabelSize = this.responsiveManager.calculateFontSize(36);
        const pausedLabelStyle = new TextStyle({
            fill: '#00ffcc',
            fontSize: pausedLabelSize,
            fontWeight: 'bold',
            fontFamily: 'Orbitron, Arial',
        });
        this.pausedLabel = new Text({ text: 'PAUSED', style: pausedLabelStyle });
        this.pausedLabel.anchor.set(0.5);
        const labelPos = this.responsiveManager.getPauseMenuLabelPosition();
        this.pausedLabel.position.set(labelPos.x, labelPos.y);
        this.pauseMenu.addChild(this.pausedLabel);

        // Resume button
        this.resumeBtn = this.makeResumeButton('RESUME', () => this.exitPause());
        const resumePos = this.responsiveManager.getPauseMenuResumeButtonPosition();
        this.resumeBtn.position.set(resumePos.x, resumePos.y);
        this.pauseMenu.addChild(this.resumeBtn);

        this.addChild(this.pauseMenu);

        // Listen for screen resize
        window.addEventListener('resize', () => this.onScreenResize());
        window.addEventListener('orientationchange', () => this.onScreenResize());
    }

    /**
     * Create the pause button with responsive sizing
     */
    private makePauseButton(label: string, onClick: () => void): Container {
        const dims = this.responsiveManager.getPauseButtonDimensions();
        const fontSize = this.responsiveManager.calculateFontSize(14);
        const btnStyle = new TextStyle({
            fill: '#00ffcc',
            fontSize: fontSize,
            fontWeight: 'bold',
            fontFamily: 'Orbitron, Arial',
        });

        const c = new Container();
        c.eventMode = 'static';
        c.cursor = 'pointer';

        const bg = new Graphics();
        bg.roundRect(0, 0, dims.width, dims.height, 8);
        bg.fill({ color: 0x111122, alpha: 0.95 });
        bg.stroke({ color: 0x00ffcc, width: 2 });

        const t = new Text({ text: label, style: btnStyle });
        t.anchor.set(0.5);
        t.position.set(dims.width / 2, dims.height / 2);

        c.addChild(bg, t);
        c.on('pointerdown', (e) => {
            e.stopPropagation();
            onClick();
        });

        return c;
    }

    /**
     * Create the resume button with responsive sizing
     */
    private makeResumeButton(label: string, onClick: () => void): Container {
        const dims = this.responsiveManager.getResumeButtonDimensions();
        const fontSize = this.responsiveManager.calculateFontSize(16);
        const btnStyle = new TextStyle({
            fill: '#00ffcc',
            fontSize: fontSize,
            fontWeight: 'bold',
            fontFamily: 'Orbitron, Arial',
        });

        const c = new Container();
        c.eventMode = 'static';
        c.cursor = 'pointer';

        const bg = new Graphics();
        bg.roundRect(0, 0, dims.width, dims.height, 8);
        bg.fill({ color: 0x111122, alpha: 0.95 });
        bg.stroke({ color: 0x00ffcc, width: 2 });

        const t = new Text({ text: label, style: btnStyle });
        t.anchor.set(0.5);
        t.position.set(dims.width / 2, dims.height / 2);

        c.addChild(bg, t);
        c.on('pointerdown', (e) => {
            e.stopPropagation();
            onClick();
        });

        return c;
    }

    /**
     * Update pause button position
     */
    private updatePauseButtonPosition(): void {
        const pos = this.responsiveManager.getPauseButtonPosition();
        this.pauseBtn.position.set(pos.x, pos.y);
    }

    /**
     * Handle screen resize and orientation changes
     */
    private onScreenResize(): void {
        // Update pause button position and size
        const pauseDims = this.responsiveManager.getPauseButtonDimensions();
        const pauseFontSize = this.responsiveManager.calculateFontSize(14);

        // Recreate pause button with new dimensions
        const pauseChildren = this.pauseBtn.children;
        if (pauseChildren.length > 0) {
            const bg = pauseChildren[0] as Graphics;
            const text = pauseChildren[1] as Text;

            bg.clear();
            bg.roundRect(0, 0, pauseDims.width, pauseDims.height, 8);
            bg.fill({ color: 0x111122, alpha: 0.95 });
            bg.stroke({ color: 0x00ffcc, width: 2 });

            text.style.fontSize = pauseFontSize;
            text.position.set(pauseDims.width / 2, pauseDims.height / 2);
        }

        this.updatePauseButtonPosition();

        // Update resume button if pause menu is active
        if (this.pauseMenu.visible && this.resumeBtn) {
            const resumeDims = this.responsiveManager.getResumeButtonDimensions();
            const resumeFontSize = this.responsiveManager.calculateFontSize(16);
            const resumeChildren = this.resumeBtn.children;

            if (resumeChildren.length > 0) {
                const bg = resumeChildren[0] as Graphics;
                const text = resumeChildren[1] as Text;

                bg.clear();
                bg.roundRect(0, 0, resumeDims.width, resumeDims.height, 8);
                bg.fill({ color: 0x111122, alpha: 0.95 });
                bg.stroke({ color: 0x00ffcc, width: 2 });

                text.style.fontSize = resumeFontSize;
                text.position.set(resumeDims.width / 2, resumeDims.height / 2);
            }

            const resumePos = this.responsiveManager.getPauseMenuResumeButtonPosition();
            this.resumeBtn.position.set(resumePos.x, resumePos.y);
        }

        // Update paused label position and size
        const labelSize = this.responsiveManager.calculateFontSize(36);
        this.pausedLabel.style.fontSize = labelSize;
        const labelPos = this.responsiveManager.getPauseMenuLabelPosition();
        this.pausedLabel.position.set(labelPos.x, labelPos.y);
    }

    private enterPause(): void {
        GameState.setPaused(true);
        VoiceInputManager.getInstance().pauseMic();
        this.pauseBtn.visible = false;
        this.pauseMenu.visible = true;
    }

    private exitPause(): void {
        GameState.setPaused(false);
        VoiceInputManager.getInstance().resumeMic();
        this.pauseMenu.visible = false;
        this.pauseBtn.visible = true;
    }
}
