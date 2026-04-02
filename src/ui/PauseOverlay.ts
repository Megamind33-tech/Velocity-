import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GameState } from '../engine/GameState';
import { VoiceInputManager } from '../engine/input/VoiceInputManager';
import { GAME_UI } from './theme/GameUITheme';
import { createMenuButton } from './gameUiPrimitives';

export interface PauseOverlayOptions {
    onQuitToMenu?: () => void;
}

/**
 * In-run pause — menu controls only, matches arcade UI.
 */
export class PauseOverlay extends Container {
    private pauseBtn: Container;
    private pauseMenu: Container;
    private pausedLabel: Text;
    private btnRow: Container;

    constructor(
        private readonly app: Application,
        private readonly opts: PauseOverlayOptions = {}
    ) {
        super();

        this.pauseBtn = createMenuButton('II', 52, 44, () => this.enterPause());
        this.pauseBtn.position.set(app.screen.width - 64, 12);
        this.addChild(this.pauseBtn);

        this.pauseMenu = new Container();
        this.pauseMenu.visible = false;
        const dim = new Graphics();
        dim.eventMode = 'static';
        this.pauseMenu.addChild(dim);

        this.pausedLabel = new Text({
            text: 'PAUSED',
            style: new TextStyle({
                fontFamily: GAME_UI.fontTitle,
                fontSize: 36,
                fill: '#ffffff',
                letterSpacing: 6,
                dropShadow: { blur: 8, color: '#ff3d9a', distance: 0, alpha: 0.8 },
            }),
        });
        this.pausedLabel.anchor.set(0.5);
        this.pauseMenu.addChild(this.pausedLabel);

        this.btnRow = new Container();
        const resume = createMenuButton('RESUME', 130, 48, () => this.exitPause(), { primary: true });
        resume.position.set(0, 0);
        this.btnRow.addChild(resume);

        if (opts.onQuitToMenu) {
            const menu = createMenuButton('MENU', 130, 48, () => {
                GameState.setPaused(false);
                VoiceInputManager.getInstance().pauseMic();
                this.pauseMenu.visible = false;
                this.pauseBtn.visible = true;
                opts.onQuitToMenu!();
            });
            menu.position.set(146, 0);
            this.btnRow.addChild(menu);
        }

        this.pauseMenu.addChild(this.btnRow);
        this.addChild(this.pauseMenu);
    }

    layout(width: number, height: number): void {
        this.pauseBtn.position.set(width - 64, 12);
        const dim = this.pauseMenu.children[0] as Graphics;
        dim.clear();
        dim.rect(0, 0, width, height);
        dim.fill({ color: GAME_UI.bgDeep, alpha: 0.82 });
        this.pausedLabel.position.set(width / 2, height * 0.38);
        this.btnRow.position.set(width / 2 - (this.opts.onQuitToMenu ? 138 : 65), height * 0.52);
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
