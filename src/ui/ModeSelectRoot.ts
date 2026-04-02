import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GAME_UI } from './theme/GameUITheme';
import { createMenuButton } from './gameUiPrimitives';
import { MenuBackdrop } from './MenuBackdrop';
import { GAME_MODES, MODE_LABEL, MODE_BLURB, UNLOCK_HELP, type GameMode } from '../data/gameModes';
import { ModeProgress } from '../player/ModeProgress';
import { getSafeAreaInsets } from './safeArea';

export interface ModeSelectHandlers {
    onPick: (mode: GameMode) => void;
    onBack: () => void;
}

/**
 * Four-mode hub — locked modes show requirement text (no skipping).
 */
export class ModeSelectRoot extends Container {
    readonly backdrop: MenuBackdrop;
    private header!: Text;
    private rows: Container[] = [];
    private btnBack: Container;

    constructor(
        private readonly app: Application,
        private readonly handlers: ModeSelectHandlers
    ) {
        super();
        this.backdrop = new MenuBackdrop();
        this.addChild(this.backdrop);

        this.header = new Text({
            text: 'CHOOSE MODE',
            style: new TextStyle({
                fontFamily: GAME_UI.fontTitle,
                fontSize: 22,
                fill: '#ffffff',
                letterSpacing: 4,
            }),
        });
        this.header.anchor.set(0.5, 0);
        this.addChild(this.header);

        this.btnBack = createMenuButton('BACK', 108, 46, () => this.handlers.onBack());
        this.addChild(this.btnBack);

        for (const mode of GAME_MODES) {
            const row = this.makeRow(mode);
            this.rows.push(row);
            this.addChild(row);
        }
    }

    private makeRow(mode: GameMode): Container {
        const c = new Container();
        const open = ModeProgress.canPlayMode(mode);
        const w = 300;
        const h = open ? 62 : 72;

        const bg = new Graphics();
        bg.roundRect(0, 0, w, h, 10);
        bg.fill({ color: open ? 0x120c22 : 0x0a0814, alpha: 0.92 });
        bg.stroke({
            width: open ? 2 : 1,
            color: open ? GAME_UI.strokeCyan : 0x332244,
            alpha: open ? 0.9 : 0.45,
        });

        const title = new Text({
            text: MODE_LABEL[mode],
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 14,
                fontWeight: '700',
                fill: open ? '#ffffff' : '#554466',
                letterSpacing: 2,
            }),
        });
        title.position.set(12, 8);

        const blurb = new Text({
            text: MODE_BLURB[mode],
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 9,
                fill: open ? '#8899cc' : '#443355',
                wordWrap: true,
                wordWrapWidth: w - 24,
            }),
        });
        blurb.position.set(12, 28);

        const lock = new Text({
            text: open ? '' : `LOCKED — ${UNLOCK_HELP[mode]}`,
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 8,
                fill: '#ff6699',
                wordWrap: true,
                wordWrapWidth: w - 24,
            }),
        });
        lock.position.set(12, open ? 52 : 48);

        c.addChild(bg, title, blurb, lock);
        c.eventMode = 'static';
        c.cursor = open ? 'pointer' : 'default';
        if (open) {
            c.on('pointertap', (e) => {
                e.stopPropagation();
                this.handlers.onPick(mode);
            });
        }
        return c;
    }

    refreshLocks(): void {
        for (let i = 0; i < GAME_MODES.length; i++) {
            const old = this.rows[i];
            this.removeChild(old);
            old.destroy();
            const row = this.makeRow(GAME_MODES[i]);
            this.rows[i] = row;
            this.addChild(row);
        }
    }

    layout(width: number, height: number, safeTop: number): void {
        this.backdrop.layout(width, height);
        this.header.position.set(width / 2, safeTop + 12);
        let y = safeTop + 52;
        const x = (width - 300) / 2;
        const rowStep = 82;
        for (const row of this.rows) {
            row.position.set(x, y);
            y += rowStep;
        }
        const { bottom } = getSafeAreaInsets();
        this.btnBack.position.set(12, height - this.btnBack.height - 12 - bottom);
    }

    show(): void {
        this.visible = true;
        this.refreshLocks();
        this.backdrop.activate();
    }

    hide(): void {
        this.visible = false;
        this.backdrop.deactivate();
    }
}
