/**
 * Premium landscape main menu — PixiJS (rhythm-game style IA).
 * Zones: top bar, hero card, mode tabs, scrollable mission list, bottom nav.
 */

import {
    Container,
    FederatedPointerEvent,
    Graphics,
    Text,
    TextStyle,
} from 'pixi.js';
import { GAME_COLORS } from '../GameUITheme';
import { getMainMenuProgress, getMenuHighScore, isLevelUnlocked } from '../../../data/localProgress';
import { LEVEL_DEFINITIONS, type LevelDefinition } from '../../../data/levelDefinitions';
import { getPilotRank } from '../menuLayoutHelpers';
import { gameFlow } from '../gameFlowBridge';
import type { GameUIManager } from '../GameUIManager';

const GRID = 8;
const R_CARD = 22;
const R_ROW = 16;
const R_CHIP = 12;

const FONT_UI = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const FONT_DISPLAY = '"Segoe UI", system-ui, -apple-system, sans-serif';

const C = {
    surface:  0x0f1624,
    surface2: 0x141c2e,
    surfaceHi: 0x1a2438,
    border:   0x243044,
    text:     0xf0f4fa,
    muted:    0x9aa8bc,
    cyan:     GAME_COLORS.primary,
    gold:     GAME_COLORS.accent_gold,
};

function style(
    size: number,
    weight: '400' | '500' | '600' | '700' | '800',
    fill: number,
    letterSpacing = 0,
): TextStyle {
    return new TextStyle({
        fontFamily: FONT_UI,
        fontSize: size,
        fontWeight: weight,
        fill,
        letterSpacing,
    });
}

function pressable(root: Container, onUp: () => void): void {
    root.eventMode = 'static';
    root.cursor = 'pointer';
    const stop = (e: FederatedPointerEvent) => e.stopPropagation();
    root.on('pointerdown', (e: FederatedPointerEvent) => {
        stop(e);
        root.scale.set(0.97);
    });
    root.on('pointerup', (e: FederatedPointerEvent) => {
        stop(e);
        root.scale.set(1);
        onUp();
    });
    root.on('pointerupoutside', () => root.scale.set(1));
    root.on('pointercancel', () => root.scale.set(1));
}

// ─── Icons (unified stroke ~2px) ─────────────────────────────────────────────

function icoProfile(g: Graphics, cx: number, cy: number, s: number): void {
    g.circle(cx, cy - s * 0.08, s * 0.32);
    g.stroke({ color: C.cyan, width: 2, alpha: 0.9 });
    g.arc(cx, cy + s * 0.42, s * 0.38, Math.PI * 1.12, Math.PI * 1.88);
    g.stroke({ color: C.cyan, width: 2, alpha: 0.9 });
}
function icoBolt(g: Graphics, cx: number, cy: number, s: number): void {
    g.moveTo(cx + s * 0.12, cy - s * 0.38);
    g.lineTo(cx - s * 0.08, cy - s * 0.02);
    g.lineTo(cx + s * 0.06, cy - s * 0.02);
    g.lineTo(cx - s * 0.18, cy + s * 0.4);
    g.lineTo(cx + s * 0.1, cy - s * 0.02);
    g.closePath();
    g.stroke({ color: C.cyan, width: 2, alpha: 0.9 });
}
function icoCoin(g: Graphics, cx: number, cy: number, s: number): void {
    g.circle(cx, cy, s * 0.36);
    g.stroke({ color: C.gold, width: 2, alpha: 0.95 });
    g.circle(cx, cy, s * 0.2);
    g.stroke({ color: C.gold, width: 1.5, alpha: 0.55 });
}
function icoGem(g: Graphics, cx: number, cy: number, s: number): void {
    g.moveTo(cx, cy - s * 0.36);
    g.lineTo(cx + s * 0.3, cy - s * 0.06);
    g.lineTo(cx + s * 0.2, cy + s * 0.3);
    g.lineTo(cx - s * 0.2, cy + s * 0.3);
    g.lineTo(cx - s * 0.3, cy - s * 0.06);
    g.closePath();
    g.stroke({ color: 0xcc88ff, width: 2, alpha: 0.9 });
}
function icoGear(g: Graphics, cx: number, cy: number, s: number): void {
    const n = 6;
    const ri = s * 0.18;
    const ro = s * 0.36;
    for (let i = 0; i < n; i++) {
        const a0 = ((i - 0.5) * 2 * Math.PI) / n;
        const a1 = (i * 2 * Math.PI) / n;
        const a2 = ((i + 0.5) * 2 * Math.PI) / n;
        if (i === 0) g.moveTo(cx + Math.cos(a0) * ri, cy + Math.sin(a0) * ri);
        else g.lineTo(cx + Math.cos(a0) * ri, cy + Math.sin(a0) * ri);
        g.lineTo(cx + Math.cos(a1) * ro, cy + Math.sin(a1) * ro);
        g.lineTo(cx + Math.cos(a2) * ri, cy + Math.sin(a2) * ri);
    }
    g.closePath();
    g.stroke({ color: C.muted, width: 2, alpha: 0.95 });
    g.circle(cx, cy, s * 0.12);
    g.stroke({ color: C.muted, width: 1.5, alpha: 0.8 });
}
function icoMic(g: Graphics, cx: number, cy: number, s: number): void {
    g.roundRect(cx - s * 0.1, cy - s * 0.26, s * 0.2, s * 0.34, 3);
    g.stroke({ color: C.cyan, width: 2, alpha: 0.9 });
    g.arc(cx, cy + s * 0.18, s * 0.2, 0.25, Math.PI - 0.25);
    g.stroke({ color: C.cyan, width: 2, alpha: 0.9 });
}
function icoWing(g: Graphics, cx: number, cy: number, s: number): void {
    g.moveTo(cx, cy - s * 0.12);
    g.lineTo(cx - s * 0.38, cy + s * 0.22);
    g.lineTo(cx - s * 0.1, cy + s * 0.06);
    g.moveTo(cx, cy - s * 0.12);
    g.lineTo(cx + s * 0.38, cy + s * 0.22);
    g.lineTo(cx + s * 0.1, cy + s * 0.06);
    g.stroke({ color: C.gold, width: 2, alpha: 0.85 });
}
function icoRadar(g: Graphics, cx: number, cy: number, r: number): void {
    g.circle(cx, cy, r);
    g.stroke({ color: C.cyan, width: 2, alpha: 0.85 });
    g.circle(cx, cy, r * 0.55);
    g.stroke({ color: C.cyan, width: 1.2, alpha: 0.4 });
    g.moveTo(cx, cy);
    g.lineTo(cx + r * 0.72, cy - r * 0.32);
    g.stroke({ color: C.cyan, width: 1.5, alpha: 0.75 });
}
function icoHome(g: Graphics, cx: number, cy: number, s: number): void {
    g.moveTo(cx, cy - s * 0.32);
    g.lineTo(cx + s * 0.34, cy - s * 0.04);
    g.lineTo(cx + s * 0.34, cy + s * 0.3);
    g.lineTo(cx - s * 0.34, cy + s * 0.3);
    g.lineTo(cx - s * 0.34, cy - s * 0.04);
    g.closePath();
    g.stroke({ color: C.cyan, width: 2, alpha: 0.9 });
}
function icoMap(g: Graphics, cx: number, cy: number, s: number): void {
    g.roundRect(cx - s * 0.32, cy - s * 0.26, s * 0.26, s * 0.52, 2);
    g.roundRect(cx - s * 0.02, cy - s * 0.32, s * 0.34, s * 0.38, 2);
    g.stroke({ color: C.cyan, width: 2, alpha: 0.9 });
}
function icoHangar(g: Graphics, cx: number, cy: number, s: number): void {
    g.moveTo(cx - s * 0.36, cy + s * 0.22);
    g.lineTo(cx - s * 0.36, cy - s * 0.04);
    g.lineTo(cx, cy - s * 0.32);
    g.lineTo(cx + s * 0.36, cy - s * 0.04);
    g.lineTo(cx + s * 0.36, cy + s * 0.22);
    g.stroke({ color: C.cyan, width: 2, alpha: 0.9 });
}
function icoStore(g: Graphics, cx: number, cy: number, s: number): void {
    g.moveTo(cx - s * 0.3, cy + s * 0.22);
    g.lineTo(cx + s * 0.3, cy + s * 0.22);
    g.moveTo(cx, cy - s * 0.28);
    g.lineTo(cx, cy + s * 0.22);
    g.stroke({ color: C.gold, width: 2, alpha: 0.9 });
}

function chip(
    draw: (g: Graphics, cx: number, cy: number, s: number) => void,
    label: string,
    val: string,
    w: number,
    h: number,
    accent: number,
): Container {
    const root = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, R_CHIP);
    bg.fill({ color: C.surface2, alpha: 1 });
    bg.stroke({ color: accent, width: 1, alpha: 0.4 });
    root.addChild(bg);
    const ig = new Graphics();
    draw(ig, 18, h / 2, 18);
    root.addChild(ig);
    const lb = new Text({ text: label, style: style(11, '600', C.muted) });
    lb.position.set(40, 6);
    root.addChild(lb);
    const vt = new Text({ text: val, style: style(13, '700', C.text) });
    vt.position.set(40, 20);
    root.addChild(vt);
    return root;
}

export type TopBarRefs = {
    energyText: Text;
    bestText: Text;
    premiumText: Text;
};

export function buildTopUtilityBar(
    cw: number,
    onProfile: () => void,
    onSettings: () => void,
    prog: ReturnType<typeof getMainMenuProgress>,
    bestScore: number,
): { root: Container; refs: TopBarRefs } {
    const H = 60;
    const root = new Container();
    const gap = GRID;
    const gearW = 52;

    const av = new Container();
    const avBg = new Graphics();
    avBg.circle(28, 28, 26);
    avBg.fill({ color: C.surface2, alpha: 1 });
    avBg.stroke({ color: C.cyan, width: 2, alpha: 0.55 });
    av.addChild(avBg);
    const avG = new Graphics();
    icoProfile(avG, 28, 28, 38);
    av.addChild(avG);
    pressable(av, onProfile);
    root.addChild(av);

    const chipW = Math.floor((cw - 56 - gearW - gap * 5) / 3);
    const x0 = 56 + gap;

    const c1 = chip(icoBolt, 'SIGNAL', `${prog.maxUnlocked}`, chipW, H - 4, C.cyan);
    c1.position.set(x0, 2);
    root.addChild(c1);

    const c2 = chip(icoCoin, 'BEST', String(bestScore), chipW, H - 4, C.gold);
    c2.position.set(x0 + chipW + gap, 2);
    root.addChild(c2);

    const c3 = chip(icoGem, 'PREMIUM', `${prog.unlockedCount}`, chipW, H - 4, 0xcc88ff);
    c3.position.set(x0 + (chipW + gap) * 2, 2);
    root.addChild(c3);

    const gear = new Container();
    const gb = new Graphics();
    gb.roundRect(0, 0, gearW, H, R_CHIP);
    gb.fill({ color: C.surface2, alpha: 1 });
    gb.stroke({ color: C.border, width: 1, alpha: 0.85 });
    gear.addChild(gb);
    const gg = new Graphics();
    icoGear(gg, gearW / 2, H / 2, 22);
    gear.addChild(gg);
    gear.position.set(cw - gearW, 2);
    pressable(gear, onSettings);
    root.addChild(gear);

    return {
        root,
        refs: {
            energyText: c1.children[3] as Text,
            bestText: c2.children[3] as Text,
            premiumText: c3.children[3] as Text,
        },
    };
}

function primaryBtn(w: number, h: number, label: string, onClick: () => void): Container {
    const root = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 14);
    bg.fill({ color: C.cyan, alpha: 1 });
    bg.stroke({ color: 0xffffff, width: 1, alpha: 0.15 });
    root.addChild(bg);
    const t = new Text({ text: label, style: style(15, '800', 0x001a16) });
    t.anchor.set(0.5);
    t.position.set(w / 2, h / 2);
    root.addChild(t);
    pressable(root, onClick);
    return root;
}

function secondaryBtn(w: number, h: number, label: string, onClick: () => void): Container {
    const root = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 12);
    bg.fill({ color: C.surfaceHi, alpha: 1 });
    bg.stroke({ color: C.cyan, width: 2, alpha: 0.55 });
    root.addChild(bg);
    const t = new Text({ text: label, style: style(14, '700', C.cyan) });
    t.anchor.set(0.5);
    t.position.set(w / 2, h / 2);
    root.addChild(t);
    pressable(root, onClick);
    return root;
}

function utilityChip(
    label: string,
    w: number,
    h: number,
    accent: number,
    iconFn?: (g: Graphics, cx: number, cy: number, s: number) => void,
): Container {
    const root = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, h / 2);
    bg.fill({ color: C.surface2, alpha: 1 });
    bg.stroke({ color: accent, width: 1, alpha: 0.45 });
    root.addChild(bg);
    if (iconFn) {
        const ig = new Graphics();
        iconFn(ig, 14, h / 2, 12);
        root.addChild(ig);
    }
    const t = new Text({ text: label, style: style(12, '600', C.text) });
    t.anchor.set(0, 0.5);
    t.position.set(iconFn ? 28 : 12, h / 2);
    root.addChild(t);
    return root;
}

export function buildHeroFlightCard(
    cw: number,
    cardH: number,
    prog: ReturnType<typeof getMainMenuProgress>,
    rank: string,
    onFlyNow: () => void,
    onTrain: () => void,
): Container {
    const root = new Container();
    const pad = GRID * 2;
    const bg = new Graphics();
    bg.roundRect(0, 0, cw, cardH, R_CARD);
    bg.fill({ color: C.surface, alpha: 1 });
    bg.stroke({ color: C.cyan, width: 1.5, alpha: 0.25 });
    root.addChild(bg);
    const glow = new Graphics();
    glow.roundRect(1, 1, cw - 2, cardH - 2, R_CARD - 1);
    glow.stroke({ color: C.cyan, width: 1, alpha: 0.08 });
    root.addChild(glow);

    const title = new Text({
        text: 'VELOCITY',
        style: new TextStyle({
            fontFamily: FONT_DISPLAY,
            fontSize: 34,
            fontWeight: '800',
            fill: C.text,
            letterSpacing: 3,
        }),
    });
    title.position.set(pad, pad);
    root.addChild(title);

    const sub = new Text({ text: 'Voice-Powered Flight', style: style(15, '600', C.muted) });
    sub.position.set(pad, pad + 42);
    root.addChild(sub);

    const tag = new Text({
        text: 'Precision • Pitch • Signal',
        style: style(13, '500', 0x66bbaa),
    });
    tag.position.set(pad, pad + 64);
    root.addChild(tag);

    const micChip = utilityChip('Mic live', 100, 30, 0x22aa66, icoMic);
    micChip.position.set(pad, cardH - 46);

    const classChip = utilityChip(`Class: ${rank}`, 132, 30, C.gold, icoWing);
    classChip.position.set(pad + 108, cardH - 46);

    root.addChild(micChip, classChip);

    const progLabel = new Text({
        text: `Route progress   ${prog.unlockedCount} / ${prog.totalLevels}`,
        style: style(13, '600', C.muted),
    });
    progLabel.position.set(pad, cardH - 72);
    root.addChild(progLabel);

    const barW = Math.min(280, cw * 0.35);
    const barX = pad;
    const barY = cardH - 58;
    const barBg = new Graphics();
    barBg.roundRect(barX, barY, barW, 8, 4);
    barBg.fill({ color: C.surface2, alpha: 1 });
    root.addChild(barBg);
    const p = prog.totalLevels > 0 ? prog.unlockedCount / prog.totalLevels : 0;
    const barFill = new Graphics();
    barFill.roundRect(barX + 2, barY + 2, Math.max(4, (barW - 4) * p), 4, 2);
    barFill.fill({ color: C.cyan, alpha: 0.85 });
    root.addChild(barFill);

    const radarX = cw - pad - 72;
    const radarY = pad + 8;
    const rad = new Graphics();
    icoRadar(rad, radarX + 36, radarY + 36, 34);
    root.addChild(rad);

    const bw = 140;
    const bh = 50;
    const train = secondaryBtn(bw, bh, 'TRAIN', onTrain);
    train.position.set(cw - pad - bw * 2 - GRID, cardH - pad - bh);
    const fly = primaryBtn(bw + 24, bh, 'FLY NOW', onFlyNow);
    fly.position.set(cw - pad - bw - 24, cardH - pad - bh);
    root.addChild(train, fly);

    return root;
}

const TAB_LABELS = ['Missions', 'Routes', 'Training', 'Fleet', 'Events'] as const;

export function buildModeTabs(
    cw: number,
    onSelect: (index: number) => void,
): { root: Container; setActive: (i: number) => void } {
    const H = 46;
    const root = new Container();
    const track = new Graphics();
    track.roundRect(0, 0, cw, H, 12);
    track.fill({ color: C.surface2, alpha: 1 });
    track.stroke({ color: C.border, width: 1, alpha: 0.6 });
    root.addChild(track);

    const n = TAB_LABELS.length;
    const innerPad = GRID;
    const tabW = Math.floor((cw - innerPad * 2) / n);
    const buttons: Container[] = [];
    const bgs: Graphics[] = [];

    for (let i = 0; i < n; i++) {
        const b = new Container();
        b.position.set(innerPad + i * tabW, GRID * 0.5);

        const g = new Graphics();
        g.roundRect(0, 0, tabW - 4, H - GRID, 10);
        g.fill({ color: 0x000000, alpha: 0.02 });
        b.addChild(g);
        bgs.push(g);

        const t = new Text({ text: TAB_LABELS[i], style: style(14, '600', C.muted) });
        t.anchor.set(0.5);
        t.position.set((tabW - 4) / 2, (H - GRID) / 2);
        b.addChild(t);

        const idx = i;
        b.eventMode = 'static';
        b.cursor = 'pointer';
        pressable(b, () => {
            onSelect(idx);
            paint(idx);
        });
        buttons.push(b);
        root.addChild(b);
    }

    function paint(active: number): void {
        buttons.forEach((b, i) => {
            const g = bgs[i];
            g.clear();
            g.roundRect(0, 0, tabW - 4, H - GRID, 10);
            if (i === active) {
                g.fill({ color: C.cyan, alpha: 0.92 });
                g.stroke({ color: C.cyan, width: 1, alpha: 0.45 });
            } else {
                g.fill({ color: 0x0a121c, alpha: 0.6 });
                g.stroke({ color: C.border, width: 1, alpha: 0.25 });
            }
            const tx = b.children[1] as Text;
            tx.style = i === active ? style(14, '800', 0x001810) : style(14, '600', C.muted);
        });
    }
    paint(0);
    return { root, setActive: paint };
}

function filterLevels(tab: number): LevelDefinition[] {
    const all = [...LEVEL_DEFINITIONS].sort((a, b) => a.id - b.id);
    if (tab === 0) return all;
    if (tab === 1) return all.filter((l) => l.id % 2 === 1);
    if (tab === 2) return all.filter((l) => l.id <= 5);
    if (tab === 3) return all.filter((l) => l.id >= 11);
    return all.filter((l) => l.id >= 16);
}

function missionRow(
    level: LevelDefinition,
    cw: number,
    rowH: number,
    onPlay: (id: number) => void,
    maxUnlocked: number,
): Container {
    const root = new Container();
    const unlocked = isLevelUnlocked(level.id);
    const completed = unlocked && level.id < maxUnlocked;
    const elite = level.id >= 18;

    const bg = new Graphics();
    bg.roundRect(0, 0, cw, rowH, R_ROW);
    bg.fill({ color: C.surface, alpha: 1 });
    bg.stroke({ color: unlocked ? C.border : 0x333344, width: 1, alpha: 0.8 });
    root.addChild(bg);

    const iconR = 28;
    const icX = 16 + iconR;
    const icY = rowH / 2;
    const icBg = new Graphics();
    icBg.circle(icX, icY, iconR);
    icBg.fill({ color: C.surface2, alpha: 1 });
    icBg.stroke({ color: unlocked ? C.cyan : C.muted, width: 2, alpha: unlocked ? 0.5 : 0.25 });
    root.addChild(icBg);
    const ic = new Graphics();
    icoBolt(ic, icX, icY, 22);
    root.addChild(ic);

    const tx = 16 + iconR * 2 + 16;
    const title = new Text({
        text: level.name,
        style: style(17, '700', unlocked ? C.text : C.muted),
    });
    title.position.set(tx, 14);
    root.addChild(title);

    const subHint =
        level.learningObjectives[0]?.hint ?? `Sector ${level.id} · ${level.gateCount} gates`;
    const sub = new Text({
        text: subHint.length > 52 ? `${subHint.slice(0, 50)}…` : subHint,
        style: style(13, '500', C.muted),
    });
    sub.position.set(tx, 36);
    root.addChild(sub);

    let metaStr = elite ? 'ELITE' : completed ? 'CLEARED' : unlocked ? 'Reward' : 'Locked';
    if (elite && unlocked) metaStr = 'ELITE · Reward';
    const meta = new Text({ text: metaStr, style: style(12, '700', elite ? C.gold : unlocked ? C.gold : C.muted) });
    meta.anchor.set(1, 0);
    meta.position.set(cw - 120, 18);
    root.addChild(meta);

    const btnW = 100;
    const btnH = 46;
    const bx = cw - btnW - 14;
    const by = (rowH - btnH) / 2;

    if (unlocked) {
        const btn = primaryBtn(btnW, btnH, 'PLAY', () => onPlay(level.id));
        btn.position.set(bx, by);
        root.addChild(btn);
    } else {
        const lock = new Container();
        const lb = new Graphics();
        lb.roundRect(0, 0, btnW, btnH, 12);
        lb.fill({ color: C.surface2, alpha: 1 });
        lb.stroke({ color: C.muted, width: 1, alpha: 0.35 });
        lock.addChild(lb);
        const lt = new Text({ text: 'LOCKED', style: style(13, '700', C.muted) });
        lt.anchor.set(0.5);
        lt.position.set(btnW / 2, btnH / 2);
        lock.addChild(lt);
        lock.position.set(bx, by);
        root.addChild(lock);
    }

    return root;
}

export type MissionListBundle = {
    root: Container;
    scrollLayer: Container;
    rebuild: (tab: number) => void;
    setScrollY: (y: number) => void;
    getScrollY: () => number;
    maxScroll: () => number;
};

export function buildMissionList(
    cw: number,
    listH: number,
    onPlayLevel: (id: number) => void,
    getProgress: () => ReturnType<typeof getMainMenuProgress>,
): MissionListBundle {
    const root = new Container();
    const maskG = new Graphics();
    maskG.rect(0, 0, cw, listH);
    maskG.fill({ color: 0xffffff, alpha: 1 });
    root.addChild(maskG);

    const scrollLayer = new Container();
    scrollLayer.y = 0;
    scrollLayer.mask = maskG;
    root.addChild(scrollLayer);

    let scrollY = 0;
    const rowH = 88;
    const gap = GRID;

    function maxScroll(): number {
        const total = scrollLayer.children.length * (rowH + gap) - gap;
        return Math.max(0, total - listH);
    }

    function setScrollY(y: number): void {
        scrollY = Math.max(0, Math.min(maxScroll(), y));
        scrollLayer.y = -scrollY;
    }

    function rebuild(tab: number): void {
        scrollLayer.removeChildren();
        const levels = filterLevels(tab);
        const prog = getProgress();
        levels.forEach((lv, i) => {
            const row = missionRow(lv, cw, rowH, onPlayLevel, prog.maxUnlocked);
            row.position.set(0, i * (rowH + gap));
            scrollLayer.addChild(row);
        });
        setScrollY(0);
    }

    rebuild(0);

    return { root, scrollLayer, rebuild, setScrollY, getScrollY: () => scrollY, maxScroll };
}

export function buildBottomNavDock(
    cw: number,
    ui: GameUIManager,
    onHome: () => void,
    navIndexBySlot?: (slot: number) => void,
): { root: Container; setActive: (i: number) => void; labels: Text[] } {
    const H = 68;
    const root = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, cw, H, 16);
    bg.fill({ color: C.surface, alpha: 0.98 });
    bg.stroke({ color: C.border, width: 1, alpha: 0.7 });
    root.addChild(bg);

    const items: { label: string; slot: number; onTap: () => void; draw: (g: Graphics, cx: number, cy: number, s: number) => void }[] = [
        { label: 'Home', slot: 0, onTap: () => { navIndexBySlot?.(0); onHome(); }, draw: icoHome },
        {
            label: 'Missions',
            slot: 1,
            onTap: () => {
                navIndexBySlot?.(1);
                gameFlow().openMissionSelect();
            },
            draw: icoMap,
        },
        { label: 'Hangar', slot: 2, onTap: () => { navIndexBySlot?.(2); ui.showScreen('store', true); }, draw: icoHangar },
        { label: 'Store', slot: 3, onTap: () => { navIndexBySlot?.(3); ui.showScreen('store', true); }, draw: icoStore },
        { label: 'Profile', slot: 4, onTap: () => { navIndexBySlot?.(4); ui.showScreen('settings', true); }, draw: icoProfile },
    ];

    const n = items.length;
    const slotW = cw / n;
    const labels: Text[] = [];

    items.forEach((it, i) => {
        const slot = new Container();
        slot.position.set(i * slotW, 0);
        slot.eventMode = 'static';
        slot.cursor = 'pointer';

        const cx = slotW / 2;
        const ig = new Graphics();
        it.draw(ig, cx, H / 2 - 10, 22);
        ig.eventMode = 'none';
        slot.addChild(ig);

        const t = new Text({ text: it.label, style: style(11, '600', C.muted) });
        t.anchor.set(0.5, 0);
        t.position.set(cx, H / 2 + 12);
        t.eventMode = 'none';
        slot.addChild(t);
        labels.push(t);

        const hit = new Graphics();
        hit.rect(0, 0, slotW, H);
        hit.fill({ color: 0xffffff, alpha: 0.001 });
        hit.eventMode = 'static';
        slot.addChild(hit);

        pressable(slot, it.onTap);
        root.addChild(slot);
    });

    function setActive(i: number): void {
        labels.forEach((t, idx) => {
            t.style = idx === i ? style(11, '800', C.cyan) : style(11, '600', C.muted);
        });
    }
    setActive(0);
    return { root, setActive, labels };
}
