import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GameState } from '../engine/GameState';
import { VoiceInputManager } from '../engine/input/VoiceInputManager';

const btnStyle = new TextStyle({
    fill: '#00ffcc',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron, Arial',
});

/**
 * Menu / pause controls only — does not steer the craft.
 */
export class PauseOverlay extends Container {
    private pauseBtn: Container;
    private pauseMenu: Container;
    private pausedLabel: Text;

    constructor(private readonly app: Application) {
        super();

        this.pauseBtn = this.makeButton('PAUSE', () => this.enterPause());
        this.pauseBtn.position.set(app.screen.width - 120, 16);
        this.addChild(this.pauseBtn);

        this.pauseMenu = new Container();
        this.pauseMenu.visible = false;
        const dim = new Graphics();
        dim.rect(0, 0, app.screen.width, app.screen.height);
        dim.fill({ color: 0x000000, alpha: 0.75 });
        dim.eventMode = 'static';
        this.pauseMenu.addChild(dim);

        this.pausedLabel = new Text({ text: 'PAUSED', style: new TextStyle({ ...btnStyle, fontSize: 36 }) });
        this.pausedLabel.anchor.set(0.5);
        this.pausedLabel.position.set(app.screen.width / 2, app.screen.height / 2 - 60);
        this.pauseMenu.addChild(this.pausedLabel);

        const resume = this.makeButton('RESUME', () => this.exitPause());
        resume.position.set(app.screen.width / 2 - 50, app.screen.height / 2 + 20);
        this.pauseMenu.addChild(resume);

        this.addChild(this.pauseMenu);
    }

    private makeButton(label: string, onClick: () => void): Container {
        const c = new Container();
        c.eventMode = 'static';
        c.cursor = 'pointer';
        const bg = new Graphics();
        bg.roundRect(0, 0, 100, 40, 8);
        bg.fill({ color: 0x111122, alpha: 0.95 });
        bg.stroke({ color: 0x00ffcc, width: 2 });
        const t = new Text({ text: label, style: btnStyle });
        t.anchor.set(0.5);
        t.position.set(50, 20);
        c.addChild(bg, t);
        c.on('pointerdown', (e) => {
            e.stopPropagation();
            onClick();
        });
        return c;
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
