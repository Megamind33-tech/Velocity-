import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GAME_UI } from './theme/GameUITheme';
import { createMenuButton } from './gameUiPrimitives';

export interface MicGateHandlers {
    onEnableMic: () => Promise<void>;
    onBack: () => void;
}

/**
 * Minimal pre-run mic gate — one clear CTA, rhythm-game styling (not a wall of text).
 */
export class MicGateOverlay extends Container {
    private dim: Graphics;
    private card: Graphics;
    private title!: Text;
    private hint!: Text;
    private btn!: Container;
    private btnBack!: Container;
    private deny!: Text;

    constructor(
        private readonly app: Application,
        private readonly handlers: MicGateHandlers
    ) {
        super();
        this.eventMode = 'static';

        this.dim = new Graphics();
        this.dim.eventMode = 'static';
        this.addChild(this.dim);

        this.card = new Graphics();
        this.addChild(this.card);

        this.title = new Text({
            text: 'READY',
            style: new TextStyle({
                fontFamily: GAME_UI.fontTitle,
                fontSize: 26,
                fill: '#ffffff',
                letterSpacing: 4,
            }),
        });
        this.title.anchor.set(0.5, 0);
        this.addChild(this.title);

        this.hint = new Text({
            text: 'Voice steers up / down · Cruise is auto',
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 12,
                fill: '#8899cc',
                letterSpacing: 0.5,
                wordWrap: true,
                wordWrapWidth: 280,
                align: 'center',
            }),
        });
        this.hint.anchor.set(0.5, 0);
        this.addChild(this.hint);

        this.btn = createMenuButton('ENABLE MIC', 220, 52, async () => {
            await this.handlers.onEnableMic();
        }, { primary: true });
        this.addChild(this.btn);

        this.btnBack = createMenuButton('BACK', 100, 40, () => {
            this.visible = false;
            this.deny.visible = false;
            this.handlers.onBack();
        });
        this.addChild(this.btnBack);

        this.deny = new Text({
            text: '',
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 12,
                fill: '#ff3355',
                align: 'center',
            }),
        });
        this.deny.anchor.set(0.5, 0);
        this.deny.visible = false;
        this.addChild(this.deny);
    }

    layout(width: number, height: number, safeTop: number): void {
        this.dim.clear();
        this.dim.rect(0, 0, width, height);
        this.dim.fill({ color: GAME_UI.bgDeep, alpha: 0.88 });

        const cw = Math.min(300, width - 32);
        const ch = 168;
        const cx = (width - cw) / 2;
        const cy = safeTop + (height - safeTop) * 0.38;

        this.card.clear();
        this.card.roundRect(cx, cy, cw, ch, 18);
        this.card.fill({ color: GAME_UI.bgPanel, alpha: 0.97 });
        this.card.stroke({ width: 2, color: GAME_UI.strokeCyan, alpha: 0.9 });

        this.title.position.set(width / 2, cy + 22);
        this.hint.position.set(width / 2, cy + 58);
        this.btn.position.set((width - 220) / 2, cy + 98);
        this.btnBack.position.set(cx + 12, cy + ch + 14);
        this.deny.position.set(width / 2, cy + ch + 58);
    }

    showDenied(): void {
        this.deny.text = 'Mic blocked — check browser settings';
        this.deny.visible = true;
    }

    clearDenied(): void {
        this.deny.visible = false;
        this.deny.text = '';
    }
}
