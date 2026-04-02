import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GAME_UI } from './theme/GameUITheme';
import { createMenuButton } from './gameUiPrimitives';
import { MenuBackdrop } from './MenuBackdrop';

export interface MainMenuHandlers {
    onPlay: () => void;
    onStats: () => void;
}

/**
 * Title + primary navigation — arcade / rhythm presentation (not web forms).
 */
export class MainMenuRoot extends Container {
    readonly backdrop: MenuBackdrop;
    private panel = new Graphics();
    private title!: Text;
    private tagline!: Text;
    private btnPlay!: Container;
    private btnStats!: Container;
    private safeTop = 0;

    constructor(
        _app: Application,
        private readonly handlers: MainMenuHandlers
    ) {
        super();
        this.backdrop = new MenuBackdrop();
        this.addChild(this.backdrop);
        this.addChild(this.panel);
        this.buildTexts();
        this.eventMode = 'static';
    }

    private buildTexts(): void {
        this.title = new Text({
            text: 'VELOCITY',
            style: new TextStyle({
                fontFamily: GAME_UI.fontTitle,
                fontSize: 42,
                fontWeight: '400',
                fill: '#ffffff',
                letterSpacing: 4,
                dropShadow: { blur: 0, color: '#00f0ff', distance: 0, alpha: 1 },
            }),
        });
        this.title.anchor.set(0.5, 0);

        this.tagline = new Text({
            text: 'VOCAL ARCADE',
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 13,
                fontWeight: '600',
                fill: '#8899cc',
                letterSpacing: 6,
            }),
        });
        this.tagline.anchor.set(0.5, 0);

        this.addChild(this.title, this.tagline);
    }

    layout(width: number, height: number, safeTop: number): void {
        this.safeTop = safeTop;
        this.backdrop.layout(width, height);

        const bw = Math.min(280, width - 40);
        const bh = Math.max(GAME_UI.minTouchPx, 52);
        const gap = 14;
        const titleY = safeTop + Math.min(72, height * 0.08);

        this.title.position.set(width / 2, titleY);
        this.tagline.position.set(width / 2, titleY + this.title.height + 6);

        if (this.btnPlay) {
            this.removeChild(this.btnPlay);
            this.removeChild(this.btnStats);
        }
        this.btnPlay = createMenuButton('PLAY', bw, bh, () => this.handlers.onPlay(), { primary: true });
        this.btnStats = createMenuButton('STATS', bw, bh, () => this.handlers.onStats());

        const stackH = bh * 2 + gap;
        const startY = Math.max(titleY + 100, height * 0.42 - stackH / 2);
        this.btnPlay.position.set((width - bw) / 2, startY);
        this.btnStats.position.set((width - bw) / 2, startY + bh + gap);

        this.addChild(this.btnPlay, this.btnStats);

        this.panel.clear();
        const pw = Math.min(320, width - 24);
        const ph = 118;
        const px = (width - pw) / 2;
        const py = titleY - 12;
        this.panel.roundRect(px, py, pw, ph, 16);
        this.panel.fill({ color: GAME_UI.bgPanel, alpha: 0.35 });
        this.panel.stroke({ width: 2, color: GAME_UI.strokeNeon, alpha: 0.5 });
    }

    show(): void {
        this.visible = true;
        this.backdrop.activate();
    }

    hide(): void {
        this.visible = false;
        this.backdrop.deactivate();
    }
}
