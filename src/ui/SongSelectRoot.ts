import { Application, Container, Graphics, Rectangle, Text, TextStyle } from 'pixi.js';
import type { Song } from '../data/songs';
import { VOCAL_STAGES, STAGE_LABEL, type VocalStage } from '../data/vocalStages';
import { getRegionById, type TourRegionId } from '../data/worldTour';
import { GAME_UI } from './theme/GameUITheme';
import { createMenuButton } from './gameUiPrimitives';
import { MenuBackdrop } from './MenuBackdrop';
import { getSafeAreaInsets } from './safeArea';
import { CareerProgress } from '../player/CareerProgress';
import { toUnlockRules } from '../player/songUnlock';

type ListItem =
    | { kind: 'header'; stage: VocalStage }
    | { kind: 'song'; song: Song };

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
    onConfirm: (song: Song) => void;
    /** After credit unlock, parent may refresh visible list */
    onUnlockApplied?: () => void;
}

/**
 * Tiered vocal career: stages, star gates, secret tracks, bonus-credit unlock.
 */
export class SongSelectRoot extends Container {
    readonly backdrop: MenuBackdrop;
    private panel = new Graphics();
    private header!: Text;
    private hint!: Text;
    private starsLine!: Text;
    private listClip = new Container();
    private listMask = new Graphics();
    private listRoot = new Container();
    private scrollY = 0;
    private maxScroll = 0;
    private dragStartY = 0;
    private scrollStart = 0;
    private dragging = false;
    private headerNodes: Container[] = [];
    private rows: SongRowParts[] = [];
    private items: ListItem[] = [];
    private selectedSong: Song | null = null;
    private btnBack!: Container;
    private btnConfirm!: Container;
    private btnUnlock!: Container;

    constructor(
        private readonly app: Application,
        private readonly handlers: SongSelectHandlers
    ) {
        super();
        this.backdrop = new MenuBackdrop();
        this.addChild(this.backdrop);
        this.addChild(this.panel);
        this.listClip.addChild(this.listMask, this.listRoot);
        this.listRoot.mask = this.listMask;
        this.addChild(this.listClip);
        this.listClip.eventMode = 'static';
        this.listClip.on('pointerdown', (e) => {
            this.dragging = true;
            this.dragStartY = e.global.y;
            this.scrollStart = this.scrollY;
        });
        this.listClip.on('pointermove', (e) => {
            if (!this.dragging) return;
            const dy = e.global.y - this.dragStartY;
            this.scrollY = Math.min(0, Math.max(this.maxScroll, this.scrollStart + dy));
            this.listRoot.y = this.scrollY;
        });
        this.listClip.on('pointerup', () => {
            this.dragging = false;
        });
        this.listClip.on('pointerupoutside', () => {
            this.dragging = false;
        });

        this.header = new Text({
            text: 'PICK YOUR CHART',
            style: new TextStyle({
                fontFamily: GAME_UI.fontTitle,
                fontSize: 20,
                fill: '#ffffff',
                letterSpacing: 3,
            }),
        });
        this.header.anchor.set(0.5, 0);
        this.addChild(this.header);

        this.hint = new Text({
            text: 'Stars unlock charts · Credits open secrets',
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 10,
                fill: '#8899cc',
                letterSpacing: 0.5,
                wordWrap: true,
                wordWrapWidth: 300,
                align: 'center',
            }),
        });
        this.hint.anchor.set(0.5, 0);
        this.addChild(this.hint);

        this.starsLine = new Text({
            text: '',
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 12,
                fontWeight: '700',
                fill: '#ffdd44',
                letterSpacing: 1,
            }),
        });
        this.starsLine.anchor.set(0.5, 0);
        this.addChild(this.starsLine);

        this.btnBack = createMenuButton('BACK', 108, 46, () => this.handlers.onBack());
        this.btnConfirm = createMenuButton('FLY', 120, 46, () => this.confirmSelection(), { primary: true });
        this.btnUnlock = createMenuButton('UNLOCK', 140, 46, () => this.tryCreditUnlock());
        this.btnUnlock.visible = false;
        this.addChild(this.btnBack, this.btnConfirm, this.btnUnlock);
    }

    /**
     * @param mapRegion — world tour stop: filter by `song.regionId` (musical locale).
     */
    setTracks(visibleSongs: Song[], opts?: { mapRegion?: TourRegionId | null }): void {
        this.clearList();

        const pool =
            opts?.mapRegion != null
                ? visibleSongs.filter((s) => s.regionId === opts.mapRegion)
                : visibleSongs;

        if (opts?.mapRegion != null) {
            const reg = getRegionById(opts.mapRegion);
            this.header.text = reg ? reg.label : 'TOUR STOP';
            this.hint.text = reg ? reg.vocalFocus : 'Regional vocal focus';
        } else {
            this.header.text = 'PICK YOUR CHART';
            this.hint.text = 'Stars unlock charts · Credits open secrets';
        }

        const items: ListItem[] = [];
        for (const stage of VOCAL_STAGES) {
            const list = pool
                .filter((s) => s.stage === stage)
                .sort((a, b) => a.orderInStage - b.orderInStage);
            if (list.length === 0) continue;
            items.push({ kind: 'header', stage });
            for (const song of list) items.push({ kind: 'song', song });
        }
        this.items = items;

        for (const item of items) {
            if (item.kind === 'header') {
                const h = this.makeStageHeader(item.stage);
                this.headerNodes.push(h);
                this.listRoot.addChild(h);
            } else {
                const row = this.makeRow(item.song);
                this.rows.push(row);
                this.listRoot.addChild(row.container);
            }
        }

        const firstPlayable = pool.find((s) => CareerProgress.canPlaySong(toUnlockRules(s)));
        this.selectedSong = firstPlayable ?? pool[0] ?? null;
        this.refreshAll();
        this.refreshHudLine();
    }

    private clearList(): void {
        for (const h of this.headerNodes) {
            this.listRoot.removeChild(h);
            h.destroy();
        }
        this.headerNodes = [];
        for (const r of this.rows) {
            this.listRoot.removeChild(r.container);
            r.container.destroy();
        }
        this.rows = [];
        this.items = [];
    }

    private makeStageHeader(stage: VocalStage): Container {
        const c = new Container();
        const t = new Text({
            text: STAGE_LABEL[stage],
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 11,
                fontWeight: '700',
                fill: '#00f0ff',
                letterSpacing: 3,
            }),
        });
        t.position.set(0, 0);
        const line = new Graphics();
        line.moveTo(0, 18);
        line.lineTo(300, 18);
        line.stroke({ width: 1, color: GAME_UI.strokeNeon, alpha: 0.45 });
        c.addChild(t, line);
        return c;
    }

    private makeRow(song: Song): SongRowParts {
        const row = new Container();
        row.eventMode = 'static';

        const w = 300;
        const h = 56;
        const bg = new Graphics();
        row.addChild(bg);

        const nameStyle = new TextStyle({
            fontFamily: GAME_UI.fontBody,
            fontSize: 14,
            fontWeight: '700',
            fill: '#ffffff',
            letterSpacing: 0.5,
        });
        const metaStyle = new TextStyle({
            fontFamily: GAME_UI.fontBody,
            fontSize: 11,
            fontWeight: '600',
            fill: '#8899cc',
        });

        const title = new Text({ text: '', style: nameStyle });
        title.position.set(12, 8);
        const meta = new Text({ text: '', style: metaStyle });
        meta.position.set(12, 28);

        row.addChild(title, meta);
        row.hitArea = new Rectangle(0, 0, w, h);

        row.on('pointertap', (e) => {
            e.stopPropagation();
            this.selectedSong = song;
            this.refreshAll();
        });

        return { container: row, bg, w, h, title, meta };
    }

    private refreshRowVisuals(): void {
        let ri = 0;
        for (const item of this.items) {
            if (item.kind !== 'song') continue;
            const song = item.song;
            const row = this.rows[ri++];
            if (!row) break;
            const rules = toUnlockRules(song);
            const playable = CareerProgress.canPlaySong(rules);
            const sel = this.selectedSong?.id === song.id;

            const sub = song.displaySubtitle ? ` · ${song.displaySubtitle}` : '';
            row.title.text = `${song.name.toUpperCase()}${sub}`;

            if (playable) {
                row.title.style.fill = '#ffffff';
                row.meta.style.fill = '#8899cc';
                row.meta.text = `${song.bpm} BPM · ${song.notes.length} GATES · SPD ×${song.cruiseSpeedMultiplier.toFixed(2)}`;
                row.container.cursor = 'pointer';
            } else {
                row.title.style.fill = '#665577';
                row.meta.style.fill = '#ff6699';
                const need = song.starsRequired;
                row.meta.text = `NEED ${need}★  (YOU ${CareerProgress.getStars()}★)`;
                if (song.bonusUnlockCost != null) {
                    row.meta.text += `  ·  ${song.bonusUnlockCost} CREDITS`;
                }
                row.container.cursor = 'default';
            }

            row.bg.clear();
            row.bg.roundRect(0, 0, row.w, row.h, 10);
            if (!playable) {
                row.bg.fill({ color: 0x0a0818, alpha: 0.92 });
                row.bg.stroke({ width: 1, color: 0x442233, alpha: 0.7 });
            } else if (sel) {
                row.bg.fill({ color: 0x1a1035, alpha: 0.95 });
                row.bg.stroke({ width: 3, color: GAME_UI.strokeCyan, alpha: 1 });
            } else {
                row.bg.fill({ color: 0x120c22, alpha: 0.78 });
                row.bg.stroke({ width: 1, color: GAME_UI.strokeNeon, alpha: 0.35 });
            }
        }
    }

    private refreshUnlockButton(): void {
        if (!this.selectedSong) {
            this.btnUnlock.visible = false;
            return;
        }
        const rules = toUnlockRules(this.selectedSong);
        const canCredit = CareerProgress.canUnlockWithCredits(rules);
        this.btnUnlock.visible = canCredit;
    }

    private refreshAll(): void {
        this.refreshRowVisuals();
        this.refreshUnlockButton();
        this.refreshHudLine();
    }

    refreshProgress(): void {
        this.refreshAll();
    }

    private refreshHudLine(): void {
        const s = CareerProgress.getStars();
        const c = CareerProgress.getBonusCredits();
        this.starsLine.text = `★ ${s}   ·   CREDITS ${c}`;
    }

    private tryCreditUnlock(): void {
        if (!this.selectedSong) return;
        const rules = toUnlockRules(this.selectedSong);
        if (!CareerProgress.tryUnlockWithCredits(rules)) return;
        this.handlers.onUnlockApplied?.();
        this.refreshAll();
    }

    private confirmSelection(): void {
        if (!this.selectedSong) return;
        const rules = toUnlockRules(this.selectedSong);
        if (!CareerProgress.canPlaySong(rules)) return;
        this.handlers.onConfirm(this.selectedSong);
    }

    layout(width: number, height: number, safeTop: number): void {
        this.backdrop.layout(width, height);

        const rowW = 300;
        const pw = Math.min(340, width - 24);
        const rowH = 56;
        const rowGap = 8;
        const headerStep = 22;
        let contentH = 0;
        for (const item of this.items) {
            contentH += item.kind === 'header' ? headerStep : rowH + rowGap;
        }
        const listTop = safeTop + 78;
        const listLeft = (width - rowW) / 2;
        const py = listTop - 28;
        const { bottom } = getSafeAreaInsets();
        const footY = height - 52 - bottom;
        const clipTop = listTop - 4;
        const clipH = Math.max(120, footY - clipTop - 58);

        this.maxScroll = Math.min(0, clipH - contentH);
        this.scrollY = Math.max(this.maxScroll, Math.min(0, this.scrollY));
        this.listRoot.y = this.scrollY;

        this.listClip.position.set(0, clipTop);
        this.listMask.clear();
        this.listMask.rect(0, 0, width, clipH);
        this.listMask.fill({ color: 0xffffff });

        this.panel.clear();
        this.panel.roundRect(listLeft - 8, py, pw + 16, clipTop - py + clipH + 12, 16);
        this.panel.fill({ color: GAME_UI.bgPanel, alpha: 0.92 });
        this.panel.stroke({ width: 2, color: GAME_UI.strokeNeon, alpha: 0.85 });

        this.header.position.set(width / 2, safeTop + 10);
        this.hint.position.set(width / 2, safeTop + 34);
        this.starsLine.position.set(width / 2, safeTop + 54);

        let y = 0;
        let hi = 0;
        let ri = 0;
        for (const item of this.items) {
            if (item.kind === 'header') {
                const hc = this.headerNodes[hi++];
                hc.position.set(listLeft, y);
                y += headerStep;
            } else {
                const row = this.rows[ri++];
                row.container.position.set(listLeft, y);
                y += rowH + rowGap;
            }
        }

        this.btnBack.position.set(12, footY);
        this.btnConfirm.position.set(width - this.btnConfirm.width - 12, footY);
        this.btnUnlock.position.set(width / 2 - this.btnUnlock.width / 2, footY - 54);
    }

    show(): void {
        this.visible = true;
        this.refreshHudLine();
        this.backdrop.activate();
    }

    hide(): void {
        this.visible = false;
        this.backdrop.deactivate();
    }
}
