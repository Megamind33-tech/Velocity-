import { Application, Container, Graphics, Rectangle, Text, TextStyle } from 'pixi.js';
import { Song } from '../data/songs';
import { GAME_UI } from './theme/GameUITheme';
import { createMenuButton } from './gameUiPrimitives';
import { MenuBackdrop } from './MenuBackdrop';
import { getSafeAreaInsets } from './safeArea';

interface SongRowParts {
    container: Container;
    bg: Graphics;
    w: number;
    h: number;
    title: Text;
    meta: Text;
}

export interface SongSelectHandlers {
    onBack: () => void;
    /** User confirmed the highlighted track — proceed to mic gate. */
    onConfirm: (song: Song) => void;
}

/**
 * Data-driven track list (Prompt C) — same arcade shell as menu/stats.
 */
export class SongSelectRoot extends Container {
    readonly backdrop: MenuBackdrop;
    private panel = new Graphics();
    private header!: Text;
    private hint!: Text;
    private listRoot = new Container();
    private rows: SongRowParts[] = [];
    private songs: Song[] = [];
    private selectedIndex = 0;
    private btnBack!: Container;
    private btnConfirm!: Container;

    constructor(
        private readonly app: Application,
        private readonly handlers: SongSelectHandlers
    ) {
        super();
        this.backdrop = new MenuBackdrop();
        this.addChild(this.backdrop);
        this.addChild(this.panel);
        this.addChild(this.listRoot);

        this.header = new Text({
            text: 'SELECT TRACK',
            style: new TextStyle({
                fontFamily: GAME_UI.fontTitle,
                fontSize: 22,
                fill: '#ffffff',
                letterSpacing: 4,
            }),
        });
        this.header.anchor.set(0.5, 0);
        this.addChild(this.header);

        this.hint = new Text({
            text: 'Tap a row · Confirm to continue',
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 11,
                fill: '#8899cc',
                letterSpacing: 1,
            }),
        });
        this.hint.anchor.set(0.5, 0);
        this.addChild(this.hint);

        this.btnBack = createMenuButton('BACK', 108, 46, () => this.handlers.onBack());
        this.btnConfirm = createMenuButton('FLY', 120, 46, () => this.confirmSelection(), { primary: true });
        this.addChild(this.btnBack, this.btnConfirm);
    }

    setTracks(songs: Song[]): void {
        this.songs = songs;
        for (const r of this.rows) {
            this.listRoot.removeChild(r.container);
            r.container.destroy();
        }
        this.rows = [];
        const firstOpen = songs.findIndex((s) => s.unlocked !== false);
        this.selectedIndex = firstOpen >= 0 ? firstOpen : 0;

        for (let i = 0; i < songs.length; i++) {
            const row = this.makeRow(songs[i], i);
            this.rows.push(row);
            this.listRoot.addChild(row.container);
        }
        this.refreshRowStyles();
    }

    private makeRow(song: Song, index: number): SongRowParts {
        const row = new Container();
        const locked = song.unlocked === false;
        row.eventMode = 'static';
        row.cursor = locked ? 'default' : 'pointer';

        const w = 300;
        const h = 56;
        const bg = new Graphics();
        row.addChild(bg);

        const nameStyle = new TextStyle({
            fontFamily: GAME_UI.fontBody,
            fontSize: 15,
            fontWeight: '700',
            fill: '#ffffff',
            letterSpacing: 0.5,
        });
        const metaStyle = new TextStyle({
            fontFamily: GAME_UI.fontBody,
            fontSize: 12,
            fontWeight: '600',
            fill: '#8899cc',
        });

        const title = new Text({ text: song.name.toUpperCase(), style: nameStyle });
        title.position.set(14, 10);
        const meta = new Text({ text: '', style: metaStyle });
        meta.position.set(14, 32);

        row.addChild(title, meta);

        row.hitArea = new Rectangle(0, 0, w, h);

        row.on('pointertap', (e) => {
            e.stopPropagation();
            if (this.songs[index].unlocked === false) return;
            this.selectedIndex = index;
            this.refreshRowStyles();
        });

        return { container: row, bg, w, h, title, meta };
    }

    private refreshRowStyles(): void {
        for (let i = 0; i < this.rows.length; i++) {
            const { bg, w, h, title, meta } = this.rows[i];
            const song = this.songs[i];
            const locked = song.unlocked === false;
            const sel = i === this.selectedIndex && !locked;
            title.style.fill = locked ? '#554466' : '#ffffff';
            meta.text = locked ? 'LOCKED' : `${song.bpm} BPM · ${song.notes.length} GATES`;
            meta.style.fill = locked ? '#554466' : '#8899cc';
            bg.clear();
            bg.roundRect(0, 0, w, h, 10);
            if (locked) {
                bg.fill({ color: 0x0a0818, alpha: 0.9 });
                bg.stroke({ width: 1, color: 0x332244, alpha: 0.6 });
            } else {
                bg.fill({ color: sel ? 0x1a1035 : 0x120c22, alpha: sel ? 0.95 : 0.75 });
                bg.stroke({
                    width: sel ? 3 : 1,
                    color: sel ? GAME_UI.strokeCyan : GAME_UI.strokeNeon,
                    alpha: sel ? 1 : 0.35,
                });
            }
        }
    }

    private confirmSelection(): void {
        const song = this.songs[this.selectedIndex];
        if (song && song.unlocked !== false) this.handlers.onConfirm(song);
    }

    layout(width: number, height: number, safeTop: number): void {
        this.backdrop.layout(width, height);

        const rowW = 300;
        const pw = Math.min(340, width - 24);
        const listTop = safeTop + 52;
        const listLeft = (width - rowW) / 2;
        const rowH = 56;
        const rowGap = 10;
        const listH = this.rows.length * (rowH + rowGap) - rowGap;
        const panelH = listH + 88;
        const py = listTop - 36;

        this.panel.clear();
        this.panel.roundRect(listLeft - 8, py, pw + 16, panelH, 16);
        this.panel.fill({ color: GAME_UI.bgPanel, alpha: 0.92 });
        this.panel.stroke({ width: 2, color: GAME_UI.strokeNeon, alpha: 0.85 });

        this.header.position.set(width / 2, safeTop + 14);
        this.hint.position.set(width / 2, safeTop + 38);

        let y = 0;
        for (const { container } of this.rows) {
            container.position.set(listLeft, listTop + y);
            y += rowH + rowGap;
        }

        const { bottom } = getSafeAreaInsets();
        this.btnBack.position.set(16, height - this.btnBack.height - 12 - bottom);
        this.btnConfirm.position.set(width - this.btnConfirm.width - 16, height - this.btnConfirm.height - 12 - bottom);
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
