/**
 * Landscape main menu — Kenney UI Pack sci-fi chrome + Velocity cyan identity.
 * Falls back to vector shapes only if textures are not preloaded.
 */

import {
    Container,
    FederatedPointerEvent,
    Graphics,
    NineSliceSprite,
    Sprite,
    Text,
    TextStyle,
} from 'pixi.js';
import { GAME_COLORS, GAME_FONTS } from '../GameUITheme';
import { getMainMenuProgress, isLevelUnlocked } from '../../../data/localProgress';
import { LEVEL_DEFINITIONS, type LevelDefinition } from '../../../data/levelDefinitions';
import { gameFlow } from '../gameFlowBridge';
import type { GameUIManager } from '../GameUIManager';
import { getVelocityUiTexture, type VelocityUiTextureKey } from '../velocityUiArt';
import {
    kenneyAvatarPlate,
    kenneyButton,
    kenneyDockBar,
    kenneyHeroPanel,
    kenneyProgressBar,
    kenneyRowPanel,
    kenneyStatChip,
    kenneyTabTrack,
    spriteIcon,
} from './kenneyLandscapeWidgets';

const GRID = 8;
const R_CHIP = 12;

const FONT_UI = GAME_FONTS.standard;

const C = {
    surface:  0x0f1624,
    surface2: 0x141c2e,
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

function trunc(s: string, max: number): string {
    if (s.length <= max) return s;
    return `${s.slice(0, max - 1)}…`;
}

// ─── Vector fallbacks (icons) ───────────────────────────────────────────────

function icoProfile(g: Graphics, cx: number, cy: number, s: number): void {
    g.circle(cx, cy - s * 0.08, s * 0.32);
    g.stroke({ color: C.cyan, width: 2, alpha: 0.9 });
    g.arc(cx, cy + s * 0.42, s * 0.38, Math.PI * 1.12, Math.PI * 1.88);
    g.stroke({ color: C.cyan, width: 2, alpha: 0.9 });
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

function fallbackPrimaryBtn(w: number, h: number, label: string, onClick: () => void): Container {
    const root = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 12);
    bg.fill({ color: C.cyan, alpha: 1 });
    root.addChild(bg);
    const t = new Text({ text: label, style: style(15, '800', 0x001810) });
    t.anchor.set(0.5);
    t.position.set(w / 2, h / 2);
    root.addChild(t);
    pressable(root, onClick);
    return root;
}

function fallbackSecondaryBtn(w: number, h: number, label: string, onClick: () => void): Container {
    const root = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 10);
    bg.fill({ color: C.surface2, alpha: 1 });
    bg.stroke({ color: C.cyan, width: 2, alpha: 0.5 });
    root.addChild(bg);
    const t = new Text({ text: label, style: style(14, '700', C.cyan) });
    t.anchor.set(0.5);
    t.position.set(w / 2, h / 2);
    root.addChild(t);
    pressable(root, onClick);
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
    prog: ReturnType<typeof getMainMenuProgress>,
    bestScore: number,
    onPremiumTap?: () => void,
): { root: Container; refs: TopBarRefs } {
    const H = 60;
    const root = new Container();
    const gap = GRID;

    let chipW = Math.floor((cw - 60 - gap * 3) / 3);
    chipW = Math.max(100, chipW);

    const av = kenneyAvatarPlate(56, onProfile);
    if (av) {
        const ic = spriteIcon('menu_profile_star_outline', 22, C.cyan);
        if (ic) {
            ic.position.set(28, 28);
            av.addChild(ic);
        } else {
            const g = new Graphics();
            icoProfile(g, 28, 28, 34);
            av.addChild(g);
        }
        root.addChild(av);
    } else {
        const fb = new Container();
        const c = new Graphics();
        c.circle(28, 28, 26);
        c.fill({ color: C.surface2, alpha: 1 });
        c.stroke({ color: C.cyan, width: 2, alpha: 0.55 });
        fb.addChild(c);
        const g = new Graphics();
        icoProfile(g, 28, 28, 34);
        fb.addChild(g);
        pressable(fb, onProfile);
        root.addChild(fb);
    }

    const x0 = 60 + gap;
    const c1 =
        kenneyStatChip('menu_sector_circle', 'SIGNAL', `${prog.maxUnlocked}`, chipW, H - 4, C.cyan) ??
        vectorStatChip(icoRadar, 'SIGNAL', `${prog.maxUnlocked}`, chipW, H - 4);
    c1.position.set(x0, 2);
    root.addChild(c1);

    const c2 =
        kenneyStatChip('menu_best_star', 'BEST', String(bestScore), chipW, H - 4, C.gold) ??
        vectorStatChip(icoRadar, 'BEST', String(bestScore), chipW, H - 4);
    c2.position.set(x0 + chipW + gap, 2);
    root.addChild(c2);

    const c3 =
        kenneyStatChip('menu_rewards_star_outline', 'PREMIUM', `${prog.unlockedCount}`, chipW, H - 4, 0xdd99ff) ??
        vectorStatChip(icoRadar, 'PREMIUM', `${prog.unlockedCount}`, chipW, H - 4);
    c3.position.set(x0 + (chipW + gap) * 2, 2);
    if (onPremiumTap) {
        c3.eventMode = 'static';
        c3.cursor = 'pointer';
        pressable(c3, onPremiumTap);
    }
    root.addChild(c3);

    return {
        root,
        refs: {
            energyText: c1.children[c1.children.length - 1] as Text,
            bestText: c2.children[c2.children.length - 1] as Text,
            premiumText: c3.children[c3.children.length - 1] as Text,
        },
    };
}

function vectorStatChip(
    draw: (g: Graphics, cx: number, cy: number, s: number) => void,
    label: string,
    val: string,
    w: number,
    h: number,
): Container {
    const root = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, R_CHIP);
    bg.fill({ color: C.surface2, alpha: 1 });
    bg.stroke({ color: C.border, width: 1, alpha: 0.5 });
    root.addChild(bg);
    const ig = new Graphics();
    draw(ig, 18, h / 2, 16);
    root.addChild(ig);
    const lb = new Text({ text: label, style: style(11, '600', C.muted) });
    lb.position.set(40, 6);
    root.addChild(lb);
    const vt = new Text({ text: val, style: style(13, '700', C.text) });
    vt.position.set(40, 22);
    root.addChild(vt);
    return root;
}

export function buildHeroFlightCard(
    cw: number,
    cardH: number,
    prog: ReturnType<typeof getMainMenuProgress>,
    rank: string,
    onFlyNow: () => void,
): Container {
    const root = new Container();
    /** Usable width inside framed content (inset 10 + content offset ~12 each side). */
    const contentW = Math.max(260, cw - 44);
    /** Vertical space inside `content` (frame insets + label offset). */
    const innerH = Math.max(110, cardH - 54);
    const rightEmblem = 64;
    const leftTitleMax = Math.max(160, contentW - rightEmblem - GRID * 2);

    const pair = kenneyHeroPanel(cw, cardH);
    if (pair) {
        root.addChild(pair.root);
        const content = pair.content;
        const ox = 0;

        const btnH = 44;
        const micW = 96;
        /** mic + gap + class + gap + fly ≤ contentW */
        const budget = Math.max(120, contentW - micW - GRID * 2);
        let flyW = Math.min(200, Math.max(96, Math.floor(budget * 0.58)));
        let clsW = budget - flyW;
        if (clsW < 64) {
            clsW = 64;
            flyW = Math.min(200, Math.max(88, budget - clsW));
        }
        if (clsW > 148) clsW = 148;
        flyW = budget - clsW;

        const bottomPad = 8;
        let rowY = innerH - btnH - bottomPad;
        const barH = 14;
        let barY = rowY - 12 - barH;
        let progLblY = barY - 14;
        const subBottom = 36 + 18;
        const tagY = 58;
        const showTag = progLblY >= tagY + 20;
        /** Keep route copy below subtitle — never stack on the title block. */
        const minProgY = subBottom + (showTag ? 22 : 10);
        if (progLblY < minProgY) {
            progLblY = minProgY;
            barY = progLblY + 14;
            const minRowY = barY + barH + 8;
            if (rowY < minRowY) rowY = minRowY;
        }
        let useBtnH = btnH;
        if (rowY + useBtnH + bottomPad > innerH) {
            useBtnH = Math.max(36, innerH - bottomPad - rowY);
        }
        if (rowY + useBtnH + bottomPad > innerH) {
            rowY = Math.max(0, innerH - useBtnH - bottomPad);
            barY = Math.min(barY, rowY - 8 - barH);
            progLblY = barY - 14;
            if (progLblY < minProgY) {
                progLblY = minProgY;
                barY = progLblY + 14;
                rowY = Math.max(rowY, barY + barH + 6);
                useBtnH = Math.max(34, innerH - bottomPad - rowY);
            }
        }

        const title = new Text({
            text: 'VELOCITY',
            style: new TextStyle({
                fontFamily: FONT_UI,
                fontSize: 30,
                fontWeight: '800',
                fill: C.text,
                letterSpacing: 2,
            }),
        });
        title.position.set(ox, 0);
        content.addChild(title);

        const sub = new Text({
            text: 'Voice-Powered Flight',
            style: style(14, '600', C.muted),
        });
        sub.position.set(ox, 36);
        content.addChild(sub);

        if (showTag) {
            const tag = new Text({
                text: 'Precision · Pitch · Signal',
                style: style(12, '500', 0x55bbaa),
            });
            tag.position.set(ox, tagY);
            content.addChild(tag);
        }

        const emblemX = ox + contentW - rightEmblem / 2;
        const emblemY = 34;
        const radSpr = spriteIcon('menu_radar_center', 48, 0xffeedd);
        if (radSpr) {
            radSpr.position.set(emblemX, emblemY);
            content.addChild(radSpr);
        } else {
            const rg = new Graphics();
            icoRadar(rg, emblemX, emblemY, 22);
            content.addChild(rg);
        }

        const prog01 = prog.totalLevels > 0 ? prog.unlockedCount / prog.totalLevels : 0;
        const progLbl = new Text({
            text: `Routes  ${prog.unlockedCount} / ${prog.totalLevels}`,
            style: style(12, '600', C.muted),
        });
        progLbl.position.set(ox, progLblY);
        content.addChild(progLbl);

        const barW = Math.min(leftTitleMax, contentW - rightEmblem - GRID * 2);
        const kBar = kenneyProgressBar(barW, barH);
        if (kBar) {
            kBar.position.set(ox, barY);
            kBar.setProgress(prog01);
            content.addChild(kBar);
        } else {
            const bbg = new Graphics();
            bbg.roundRect(ox, barY, barW, 10, 5);
            bbg.fill({ color: 0x0a1018, alpha: 1 });
            bbg.stroke({ color: C.border, width: 1, alpha: 0.6 });
            content.addChild(bbg);
            const f = new Graphics();
            f.roundRect(ox + 2, barY + 2, Math.max(4, (barW - 4) * prog01), 6, 3);
            f.fill({ color: C.cyan, alpha: 0.9 });
            content.addChild(f);
        }

        const mic = new Container();
        const mb = new Graphics();
        mb.roundRect(0, 0, micW, useBtnH, 12);
        mb.fill({ color: 0x080e16, alpha: 1 });
        mb.stroke({ color: 0x33aa66, width: 1.5, alpha: 0.65 });
        mic.addChild(mb);
        const mlab = new Text({ text: 'Mic live', style: style(12, '700', C.text) });
        mlab.position.set(32, Math.floor((useBtnH - 14) / 2));
        mic.addChild(mlab);
        const mg = new Graphics();
        icoMic(mg, 15, useBtnH / 2, 13);
        mic.addChild(mg);
        mic.position.set(ox, rowY);
        content.addChild(mic);

        const cls = new Container();
        const cb = new Graphics();
        cb.roundRect(0, 0, clsW, useBtnH, 12);
        cb.fill({ color: 0x080e16, alpha: 1 });
        cb.stroke({ color: C.gold, width: 1.5, alpha: 0.55 });
        cls.addChild(cb);
        const clab = new Text({
            text: trunc(`Class: ${rank}`, 16),
            style: style(12, '700', C.text),
        });
        clab.position.set(32, Math.floor((useBtnH - 14) / 2));
        cls.addChild(clab);
        const wg = new Graphics();
        icoWing(wg, 15, useBtnH / 2, 13);
        cls.addChild(wg);
        cls.position.set(ox + micW + GRID, rowY);
        content.addChild(cls);

        const flyX = ox + micW + GRID + clsW + GRID;
        const fly =
            kenneyButton('FLY NOW', flyW, useBtnH, 'button_primary', false, onFlyNow) ??
            fallbackPrimaryBtn(flyW, useBtnH, 'FLY NOW', onFlyNow);
        fly.label = 'heroFlyCta';
        fly.position.set(flyX, rowY);
        content.addChild(fly);

        return root;
    }

    const fb = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, cw, cardH, 20);
    bg.fill({ color: 0x050a12, alpha: 1 });
    bg.stroke({ color: C.cyan, width: 1.5, alpha: 0.45 });
    fb.addChild(bg);
    const t0 = new Text({
        text: 'VELOCITY',
        style: new TextStyle({ fontFamily: FONT_UI, fontSize: 30, fontWeight: '800', fill: C.text }),
    });
    t0.position.set(20, 18);
    fb.addChild(t0);
    const fly = fallbackPrimaryBtn(Math.min(200, cw - 40), 44, 'FLY NOW', onFlyNow);
    fly.label = 'heroFlyCta';
    fly.position.set(cw - fly.width - 20, cardH - 56);
    fb.addChild(fly);
    return fb;
}

const TAB_LABELS = ['Missions', 'Routes', 'Training', 'Fleet', 'Events'] as const;

export function buildModeTabs(
    cw: number,
    onSelect: (index: number) => void,
): { root: Container; setActive: (i: number) => void } {
    const H = 48;
    const root = new Container();
    const track = kenneyTabTrack(cw, H);
    if (track) root.addChild(track);
    else {
        const g = new Graphics();
        g.roundRect(0, 0, cw, H, 12);
        g.fill({ color: C.surface2, alpha: 1 });
        root.addChild(g);
    }

    const n = TAB_LABELS.length;
    const innerPad = GRID;
    const tabW = Math.floor((cw - innerPad * 2) / n);
    const buttons: Container[] = [];
    const useKenney = !!getVelocityUiTexture('button_primary') && !!getVelocityUiTexture('button_secondary');
    const KS = { L: 56, R: 56, T: 20, B: 20 };

    for (let i = 0; i < n; i++) {
        const b = new Container();
        b.position.set(innerPad + i * tabW, 6);
        const idx = i;

        if (useKenney) {
            const spr = new NineSliceSprite({
                texture: getVelocityUiTexture('button_secondary')!,
                leftWidth: KS.L,
                rightWidth: KS.R,
                topHeight: KS.T,
                bottomHeight: KS.B,
                width: tabW - 6,
                height: H - 12,
            });
            spr.alpha = 0.85;
            b.addChild(spr);
        } else {
            const gr = new Graphics();
            gr.roundRect(0, 0, tabW - 6, H - 12, 10);
            gr.fill({ color: 0x0a121c, alpha: 0.85 });
            b.addChild(gr);
        }

        const t = new Text({ text: TAB_LABELS[i], style: style(13, '600', C.muted) });
        t.anchor.set(0.5);
        t.position.set((tabW - 6) / 2, (H - 12) / 2);
        b.addChild(t);

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
            const tx = b.children[1] as Text;
            const bg0 = b.children[0];
            if (useKenney && bg0 instanceof NineSliceSprite) {
                bg0.texture = getVelocityUiTexture(i === active ? 'button_primary' : 'button_secondary')!;
                bg0.tint = i === active ? 0x22ddcc : 0xffffff;
                bg0.alpha = i === active ? 0.95 : 0.82;
                tx.style = i === active ? style(13, '800', 0x001810) : style(13, '600', C.muted);
            } else if (bg0 instanceof Graphics) {
                bg0.clear();
                bg0.roundRect(0, 0, tabW - 6, H - 12, 10);
                bg0.fill({
                    color: i === active ? C.cyan : 0x0a121c,
                    alpha: i === active ? 0.92 : 0.8,
                });
                tx.style = i === active ? style(13, '800', 0x001810) : style(13, '600', C.muted);
            }
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

    const plate = kenneyRowPanel(cw, rowH);
    if (plate) root.addChild(plate);
    else {
        const bg = new Graphics();
        bg.roundRect(0, 0, cw, rowH, 14);
        bg.fill({ color: C.surface, alpha: 1 });
        bg.stroke({ color: C.border, width: 1, alpha: 0.5 });
        root.addChild(bg);
    }

    const iconR = 26;
    const icX = 14 + iconR;
    const icY = rowH / 2;
    const nodeTex = unlocked ? 'node_unlocked' : 'node_locked';
    const ns = spriteIcon(nodeTex, iconR * 2, unlocked ? C.cyan : 0x888899);
    if (ns) {
        ns.position.set(icX, icY);
        root.addChild(ns);
    } else {
        const icBg = new Graphics();
        icBg.circle(icX, icY, iconR);
        icBg.fill({ color: C.surface2, alpha: 1 });
        icBg.stroke({ color: unlocked ? C.cyan : C.muted, width: 2, alpha: 0.45 });
        root.addChild(icBg);
    }

    const btnW = 108;
    const btnH = 48;
    const tx = 14 + iconR * 2 + 14;
    const textMax = cw - tx - btnW - 20 - 72;

    const title = new Text({
        text: trunc(level.name, Math.floor(textMax / 10)),
        style: style(17, '700', unlocked ? C.text : C.muted),
    });
    title.position.set(tx, 12);
    root.addChild(title);

    const subHint =
        level.learningObjectives[0]?.hint ?? `${level.gateCount} gates`;
    const sub = new Text({
        text: trunc(subHint, Math.floor(textMax / 7)),
        style: style(13, '500', C.muted),
    });
    sub.position.set(tx, 36);
    root.addChild(sub);

    let metaStr = elite ? 'ELITE' : completed ? 'DONE' : unlocked ? 'Reward' : 'Locked';
    const meta = new Text({
        text: metaStr,
        style: style(11, '700', elite ? C.gold : unlocked ? C.gold : C.muted),
    });
    meta.anchor.set(1, 0);
    meta.position.set(cw - btnW - 18, 14);
    root.addChild(meta);

    const bx = cw - btnW - 12;
    const by = (rowH - btnH) / 2;

    if (unlocked) {
        const btn =
            kenneyButton('PLAY', btnW, btnH, 'button_accent', true, () => onPlay(level.id)) ??
            fallbackPrimaryBtn(btnW, btnH, 'PLAY', () => onPlay(level.id));
        btn.position.set(bx, by);
        root.addChild(btn);
    } else {
        const lock = new Container();
        const tex = getVelocityUiTexture('button_secondary');
        if (tex) {
            const spr = new NineSliceSprite({
                texture: tex,
                leftWidth: 56,
                rightWidth: 56,
                topHeight: 20,
                bottomHeight: 20,
                width: btnW,
                height: btnH,
            });
            spr.alpha = 0.45;
            spr.tint = 0x444455;
            lock.addChild(spr);
        } else {
            const lb = new Graphics();
            lb.roundRect(0, 0, btnW, btnH, 10);
            lb.fill({ color: C.surface2, alpha: 0.6 });
            lock.addChild(lb);
        }
        const lt = new Text({ text: 'LOCKED', style: style(13, '700', C.muted) });
        lt.anchor.set(0.5);
        lt.position.set(btnW / 2, btnH / 2);
        lock.addChild(lt);
        lock.position.set(bx, by);
        lock.eventMode = 'none';
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
    scrollLayer.mask = maskG;
    root.addChild(scrollLayer);

    let scrollY = 0;
    const rowH = 92;
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
    const H = 70;
    const root = new Container();
    const bar = kenneyDockBar(cw, H);
    if (bar) root.addChild(bar);
    else {
        const bg = new Graphics();
        bg.roundRect(0, 0, cw, H, 16);
        bg.fill({ color: C.surface, alpha: 0.98 });
        root.addChild(bg);
    }

    const items: {
        label: string;
        slot: number;
        onTap: () => void;
        icon: VelocityUiTextureKey;
        tint: number;
        vec: (g: Graphics, cx: number, cy: number, s: number) => void;
    }[] = [
        { label: 'Home', slot: 0, onTap: () => { navIndexBySlot?.(0); onHome(); }, icon: 'icon_star', tint: C.gold, vec: icoHome },
        {
            label: 'Missions',
            slot: 1,
            onTap: () => {
                navIndexBySlot?.(1);
                gameFlow().openMissionSelect();
            },
            icon: 'menu_routes_repeat',
            tint: C.cyan,
            vec: icoMap,
        },
        {
            label: 'Hangar',
            slot: 2,
            onTap: () => { navIndexBySlot?.(2); ui.showScreen('store', true); },
            icon: 'node_unlocked',
            tint: C.cyan,
            vec: icoHangar,
        },
        {
            label: 'Store',
            slot: 3,
            onTap: () => { navIndexBySlot?.(3); ui.showScreen('store', true); },
            icon: 'menu_store_icon',
            tint: C.gold,
            vec: icoStore,
        },
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
        const sp = spriteIcon(it.icon, 26, it.tint);
        if (sp) {
            sp.position.set(cx, H / 2 - 8);
            slot.addChild(sp);
        } else {
            const vg = new Graphics();
            it.vec(vg, cx, H / 2 - 8, 22);
            slot.addChild(vg);
        }

        const t = new Text({ text: it.label, style: style(11, '600', C.muted) });
        t.anchor.set(0.5, 0);
        t.position.set(cx, H / 2 + 14);
        slot.addChild(t);
        labels.push(t);

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
