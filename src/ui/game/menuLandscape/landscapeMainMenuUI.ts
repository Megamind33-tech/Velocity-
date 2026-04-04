/**
 * Landscape main menu — Kenney UI Pack + Velocity cyan identity.
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
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';
import {
    kenneyAvatarPlate,
    kenneyButton,
    kenneyDockBar,
    kenneyHeroPanel,
    kenneyProgressBar,
    kenneyRowPanel,
    kenneyStatChip,
    kenneyTabTrack,
} from './kenneyLandscapeWidgets';

const GRID = 8;
const TAB_BS = VELOCITY_UI_SLICE.button;
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

const SURFACE_ROLE = {
    tabActive: { tint: 0xc5efff, text: 0xf8fbff, face: 0x19384a, rim: 0x79d9ff, cue: 0x9fe8ff },
    tabIdle: { tint: 0xd3deea, text: 0xa6b4c8, face: 0x0d1521, rim: 0x2b3a52 },
    missionPlayable: { rim: C.cyan, accent: 0x2df0d0 },
    missionCompleted: { rim: 0x62b9ff, accent: 0x8fd9ff },
    missionClaimable: { rim: C.gold, accent: 0xffef9d },
    missionLocked: { accent: 0x8194ac },
    missionEliteLocked: { accent: 0xf0c96a },
    bottomNavActive: { tint: 0x9fe9ff, label: 0xeeffff, face: 0x133348, rim: 0x72d8ff },
    bottomNavIdle: { tint: 0x8ea1ba, label: 0x95a8c0, face: 0x09111b, rim: 0x25344b },
} as const;

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

function unitFromViewport(width: number, height: number): number {
    return Math.max(8, Math.min(14, Math.min(width, height) * 0.009));
}

// ─── Vector fallbacks (icons) ───────────────────────────────────────────────

function icoProfile(g: Graphics, cx: number, cy: number, s: number): void {
    g.circle(cx, cy - s * 0.08, s * 0.32);
    g.stroke({ color: C.cyan, width: 2, alpha: 0.9 });
    g.arc(cx, cy + s * 0.42, s * 0.38, Math.PI * 1.12, Math.PI * 1.88);
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
function icoBarsSignal(g: Graphics, cx: number, cy: number, s: number): void {
    const w = s * 0.12;
    const xs = [cx - s * 0.28, cx, cx + s * 0.28];
    const hs = [s * 0.22, s * 0.38, s * 0.3];
    xs.forEach((x, i) => {
        const h = hs[i];
        g.rect(x - w / 2, cy + s * 0.12 - h, w, h);
        g.fill({ color: C.cyan, alpha: 0.85 });
    });
}
function icoStarBadge(g: Graphics, cx: number, cy: number, s: number): void {
    const n = 4;
    const ro = s * 0.32;
    const ri = s * 0.14;
    for (let i = 0; i < n * 2; i++) {
        const a = (i * Math.PI) / n - Math.PI / 2;
        const r = i % 2 === 0 ? ro : ri;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
    }
    g.closePath();
    g.fill({ color: C.gold, alpha: 0.9 });
}
function icoGemPremium(g: Graphics, cx: number, cy: number, s: number): void {
    g.moveTo(cx, cy - s * 0.32);
    g.lineTo(cx + s * 0.26, cy - s * 0.06);
    g.lineTo(cx + s * 0.18, cy + s * 0.28);
    g.lineTo(cx - s * 0.18, cy + s * 0.28);
    g.lineTo(cx - s * 0.26, cy - s * 0.06);
    g.closePath();
    g.fill({ color: 0xcc88ff, alpha: 0.88 });
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
function icoLockSmall(g: Graphics, cx: number, cy: number, s: number): void {
    g.roundRect(cx - s * 0.2, cy - s * 0.02, s * 0.4, s * 0.3, 3);
    g.stroke({ color: C.muted, width: 2, alpha: 0.85 });
    g.arc(cx, cy - s * 0.12, s * 0.12, Math.PI, 0);
    g.stroke({ color: C.muted, width: 2, alpha: 0.85 });
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
    const H = 64;
    const root = new Container();
    const gap = GRID;
    const rail = new Graphics();
    rail.roundRect(0, 2, cw, H - 2, 14);
    rail.fill({ color: 0x09121d, alpha: 0.68 });
    rail.stroke({ color: 0x2c3f58, width: 1, alpha: 0.52 });
    rail.roundRect(10, 4, cw - 20, 2, 1);
    rail.fill({ color: C.cyan, alpha: 0.16 });
    root.addChild(rail);

    let chipW = Math.floor((cw - 66 - gap * 3) / 3);
    chipW = Math.max(108, chipW);

    const av = kenneyAvatarPlate(56, onProfile);
    root.addChild(av);

    const x0 = 60 + gap;
    const CYAN   = GAME_COLORS.primary;          // 0x00ffcc
    const GOLD   = GAME_COLORS.accent_gold;      // 0xffcc00
    const PURPLE = 0xbb88ff;

    const c1 =
        kenneyStatChip(icoBarsSignal, 'SIGNAL', `${prog.maxUnlocked}`, chipW, H - 4, CYAN) ??
        vectorStatChip(icoBarsSignal, 'SIGNAL', `${prog.maxUnlocked}`, chipW, H - 4, CYAN);
    c1.position.set(x0, 5);
    root.addChild(c1);

    const c2 =
        kenneyStatChip(icoStarBadge, 'BEST', String(bestScore), chipW, H - 4, GOLD) ??
        vectorStatChip(icoStarBadge, 'BEST', String(bestScore), chipW, H - 4, GOLD);
    c2.position.set(x0 + chipW + gap, 5);
    root.addChild(c2);

    const c3 =
        kenneyStatChip(icoGemPremium, 'PREMIUM', `${prog.unlockedCount}`, chipW, H - 4, PURPLE) ??
        vectorStatChip(icoGemPremium, 'PREMIUM', `${prog.unlockedCount}`, chipW, H - 4, PURPLE);
    c3.position.set(x0 + (chipW + gap) * 2, 5);
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
    accentColor = C.text,
): Container {
    const root = new Container();
    // Body — layered surface
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, R_CHIP);
    bg.fill({ color: C.surface2, alpha: 1 });
    bg.stroke({ color: C.border, width: 1.5, alpha: 0.55 });
    root.addChild(bg);
    const lower = new Graphics();
    lower.roundRect(4, Math.floor(h * 0.5), w - 8, Math.floor(h * 0.42), R_CHIP - 4);
    lower.fill({ color: 0x0a121c, alpha: 0.78 });
    root.addChild(lower);
    // Inner bevel highlight
    const bevel = new Graphics();
    bevel.roundRect(2, 2, w - 4, Math.floor(h * 0.42), R_CHIP - 2);
    bevel.fill({ color: 0xffffff, alpha: 0.04 });
    root.addChild(bevel);
    // Accent top strip
    const strip = new Graphics();
    strip.roundRect(6, 0, w - 12, 3, 1);
    strip.fill({ color: accentColor, alpha: 0.50 });
    root.addChild(strip);
    // Icon
    const ig = new Graphics();
    draw(ig, 20, h / 2 + 2, 16);
    root.addChild(ig);
    // Label — muted, subordinate
    const lb = new Text({
        text: label.toUpperCase(),
        style: style(9, '600', C.muted, 1),
    });
    lb.position.set(40, 8);
    root.addChild(lb);
    // Value — accent color, dominant
    const vt = new Text({
        text: val,
        style: new TextStyle({
            fontFamily: GAME_FONTS.standard,
            fontSize: 16,
            fontWeight: '800',
            fill: accentColor,
            dropShadow: { alpha: 0.45, blur: 2, color: 0x000000, distance: 1 },
        }),
    });
    vt.position.set(40, 24);
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

        const btnH = 48;   // was 40 — taller CTA has more visual authority
        /** class chip + gap + FLY NOW — no mic row */
        const rowBudget = Math.max(160, contentW - GRID * 2);
        // FLY NOW gets 50% minimum — dominant primary action
        let flyW = Math.min(220, Math.max(120, Math.floor(rowBudget * 0.50)));
        let clsW = rowBudget - flyW - GRID;
        if (clsW < 120) {
            clsW = 120;
            flyW = Math.min(200, Math.max(96, rowBudget - clsW - GRID));
        }
        clsW = Math.min(Math.floor(rowBudget * 0.62), clsW);
        flyW = rowBudget - clsW - GRID;

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

        // ── Speed streak motif behind title ────────────────────────────────
        const streakMot = new Graphics();
        const smy = 16;
        [[0, 72, 0.13], [10, 55, 0.09], [20, 80, 0.11], [30, 40, 0.06], [40, 62, 0.08]].forEach(([dy, len, a]) => {
            const sx = contentW * 0.58 + dy * 0.3;
            streakMot.moveTo(sx, smy + dy);
            streakMot.lineTo(sx + len, smy + dy - len * 0.05);
            streakMot.stroke({ color: C.cyan, width: 1, alpha: a });
        });
        content.addChild(streakMot);
        const continuitySeam = new Graphics();
        continuitySeam.roundRect(0, innerH - 2, contentW - 2, 2, 1);
        continuitySeam.fill({ color: C.cyan, alpha: 0.22 });
        content.addChild(continuitySeam);
        const continuityShadow = new Graphics();
        continuityShadow.roundRect(0, innerH - 1, contentW - 2, 6, 2);
        continuityShadow.fill({ color: 0x07101b, alpha: 0.34 });
        content.addChild(continuityShadow);

        const title = new Text({
            text: 'VELOCITY',
            style: new TextStyle({
                fontFamily: FONT_UI,
                fontSize: 32,
                fontWeight: '800',
                fill: C.text,
                letterSpacing: 3,
                dropShadow: { alpha: 0.6, blur: 5, color: C.cyan, distance: 0 },
                stroke: { color: 0x000000, width: 1 },
            }),
        });
        title.position.set(ox, 0);
        content.addChild(title);

        const sub = new Text({
            text: 'VOICE-POWERED FLIGHT',
            style: style(11, '600', C.muted, 1.5),
        });
        sub.position.set(ox, 40);
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
        const rg = new Graphics();
        rg.circle(emblemX, emblemY, 26);
        rg.stroke({ color: C.cyan, width: 1.5, alpha: 0.35 });
        icoRadar(rg, emblemX, emblemY, 18);
        content.addChild(rg);

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

        const cls = new Container();
        // Body
        const cb = new Graphics();
        cb.roundRect(0, 0, clsW, useBtnH, 12);
        cb.fill({ color: 0x080e16, alpha: 1 });
        cb.stroke({ color: C.gold, width: 1.5, alpha: 0.50 });
        cls.addChild(cb);
        // Inner bevel
        const cbevel = new Graphics();
        cbevel.roundRect(2, 2, clsW - 4, Math.floor(useBtnH * 0.42), 10);
        cbevel.fill({ color: 0xffffff, alpha: 0.04 });
        cls.addChild(cbevel);
        // Gold top strip
        const cstrip = new Graphics();
        cstrip.roundRect(6, 0, clsW - 12, 3, 1);
        cstrip.fill({ color: C.gold, alpha: 0.55 });
        cls.addChild(cstrip);
        const wingX = 14;
        const textPad = 34;
        const wg = new Graphics();
        icoWing(wg, wingX, useBtnH / 2, 12);
        cls.addChild(wg);
        const clab = new Text({
            text: trunc(`CLASS: ${rank.toUpperCase()}`, Math.max(8, Math.floor((clsW - textPad - 8) / 7))),
            style: style(12, '700', C.gold),
        });
        clab.position.set(textPad, Math.floor((useBtnH - 13) / 2));
        cls.addChild(clab);
        cls.position.set(ox, rowY);
        content.addChild(cls);

        const flyX = ox + clsW + GRID;
        // Accent (yellow/gold) chrome — structurally unique; all other surfaces are blue/grey.
        // This makes FLY NOW the only warm-toned shape in the composition: instant focal pull.
        const fly =
            kenneyButton('FLY NOW', flyW, useBtnH, 'button_accent', false, onFlyNow) ??
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
    const fly = fallbackPrimaryBtn(Math.min(200, cw - 40), 40, 'FLY NOW', onFlyNow);
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
    const H = 58;
    const root = new Container();
    const U = unitFromViewport(cw, H * 5);
    const track = kenneyTabTrack(cw, H);
    if (track) root.addChild(track);
    else {
        const g = new Graphics();
        g.roundRect(0, 0, cw, H, 12);
        g.fill({ color: C.surface2, alpha: 1 });
        root.addChild(g);
    }

    const n = TAB_LABELS.length;
    const innerPad = Math.max(GRID + 2, Math.floor(U));
    const tabGap = Math.max(4, Math.floor(U * 0.45));
    const tabW = Math.floor((cw - innerPad * 2 - tabGap * (n - 1)) / n);
    const buttons: Container[] = [];
    // Nine-slice needs tabW >= 116px (56+56 corner budget); fall back to vector for narrow
    const useKenney = tabW >= 116 && !!getVelocityUiTexture('button_primary') && !!getVelocityUiTexture('button_secondary');

    for (let i = 0; i < n; i++) {
        const b = new Container();
        b.position.set(innerPad + i * (tabW + tabGap), 7);
        const idx = i;
        const idleSlot = new Graphics();
        idleSlot.roundRect(0, 1, tabW - 6, H - 16, Math.max(10, Math.floor(U * 0.9)));
        idleSlot.fill({ color: SURFACE_ROLE.tabIdle.face, alpha: 0.85 });
        idleSlot.stroke({ color: SURFACE_ROLE.tabIdle.rim, width: 1, alpha: 0.7 });
        b.addChild(idleSlot);

        const activePlate = new Graphics();
        activePlate.visible = false;
        activePlate.roundRect(2, 0, tabW - 10, H - 17, Math.max(10, Math.floor(U)));
        activePlate.fill({ color: SURFACE_ROLE.tabActive.face, alpha: 0.84 });
        activePlate.stroke({ color: SURFACE_ROLE.tabActive.rim, width: 1.4, alpha: 0.52 });
        activePlate.roundRect(8, 2, tabW - 22, 2, 1);
        activePlate.fill({ color: SURFACE_ROLE.tabActive.cue, alpha: 0.65 });
        b.addChild(activePlate);

        if (useKenney) {
            const spr = new NineSliceSprite({
                texture: getVelocityUiTexture('button_secondary')!,
                leftWidth: TAB_BS.L,
                rightWidth: TAB_BS.R,
                topHeight: TAB_BS.T,
                bottomHeight: TAB_BS.B,
                width: tabW - 10,
                height: H - 18,
            });
            spr.position.set(2, 0);
            spr.alpha = 0.86;
            b.addChild(spr);
        } else {
            const gr = new Graphics();
            gr.roundRect(2, 0, tabW - 10, H - 18, 10);
            gr.fill({ color: 0x0b131f, alpha: 0.84 });
            b.addChild(gr);
        }

        const t = new Text({ text: TAB_LABELS[i], style: style(13, '700', SURFACE_ROLE.tabIdle.text) });
        t.anchor.set(0.5);
        t.position.set((tabW - 6) / 2, (H - 18) / 2 + 1);
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
            const idle = b.children[0] as Graphics;
            const plate = b.children[1] as Graphics;
            const bg0 = b.children[2];
            const tx = b.children[3] as Text;
            const on = i === active;
            plate.visible = on;
            idle.alpha = on ? 0.22 : 0.92;
            if (useKenney && bg0 instanceof NineSliceSprite) {
                const k = on ? 'button_primary' : 'button_secondary';
                bg0.texture = getVelocityUiTexture(k)!;
                bg0.leftWidth = TAB_BS.L;
                bg0.rightWidth = TAB_BS.R;
                bg0.topHeight = TAB_BS.T;
                bg0.bottomHeight = TAB_BS.B;
                bg0.tint = on ? SURFACE_ROLE.tabActive.tint : SURFACE_ROLE.tabIdle.tint;
                bg0.alpha = on ? 0.97 : 0.74;
                tx.style = on ? style(13, '800', SURFACE_ROLE.tabActive.text, 0.2) : style(13, '700', SURFACE_ROLE.tabIdle.text, 0.2);
            } else if (bg0 instanceof Graphics) {
                bg0.clear();
                bg0.roundRect(2, 0, tabW - 10, H - 18, 10);
                bg0.fill({
                    color: on ? SURFACE_ROLE.tabActive.face : SURFACE_ROLE.tabIdle.face,
                    alpha: on ? 0.96 : 0.78,
                });
                tx.style = on ? style(13, '800', SURFACE_ROLE.tabActive.text, 0.2) : style(13, '700', SURFACE_ROLE.tabIdle.text, 0.2);
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
    const U = unitFromViewport(cw, rowH);
    const unlocked = isLevelUnlocked(level.id);
    const completed = unlocked && level.id < maxUnlocked;
    const claimable = unlocked && level.id === maxUnlocked;
    const elite = level.id >= 18;
    const contentTag = level.id >= 16 ? 'EVENT OPS' : level.id >= 11 ? 'FLEET RUN' : level.id <= 5 ? 'TRAINING' : 'MISSION';
    const primaryState: 'claimable' | 'playable' | 'locked' | 'elite_locked' =
        claimable ? 'claimable' : unlocked ? 'playable' : elite ? 'elite_locked' : 'locked';
    const isLocked = primaryState === 'locked' || primaryState === 'elite_locked';
    const rewardValue = Math.max(primaryState === 'elite_locked' ? 140 : 90, level.gateCount * (primaryState === 'elite_locked' ? 24 : 18));

    // ── Card plate — state-differentiated surface ─────────────────────────────
    if (primaryState === 'claimable') {
        const plate = kenneyRowPanel(cw, rowH);
        if (plate) {
            plate.alpha = 0.96;
            root.addChild(plate);
        } else {
            const bg = new Graphics();
            bg.roundRect(0, 0, cw, rowH, 14);
            bg.fill({ color: 0x16120d, alpha: 1 });
            bg.stroke({ color: SURFACE_ROLE.missionClaimable.rim, width: 1.6, alpha: 0.64 });
            root.addChild(bg);
        }
        const crown = new Graphics();
        crown.roundRect(5, 0, cw - 10, 3, 1);
        crown.fill({ color: SURFACE_ROLE.missionClaimable.rim, alpha: 0.55 });
        root.addChild(crown);
    } else if (unlocked) {
        const plate = kenneyRowPanel(cw, rowH);
        if (plate) root.addChild(plate);
        else {
            const bg = new Graphics();
            bg.roundRect(0, 0, cw, rowH, 14);
            bg.fill({ color: C.surface, alpha: 1 });
            bg.stroke({ color: C.border, width: 1, alpha: 0.5 });
            root.addChild(bg);
        }
    } else if (elite) {
        // ELITE LOCKED: warm dark — aspirational, premium sealed
        const bg = new Graphics();
        bg.roundRect(0, 0, cw, rowH, 14);
        bg.fill({ color: 0x0e0c10, alpha: 1 });
        bg.stroke({ color: C.gold, width: 1, alpha: 0.28 });
        root.addChild(bg);
        // Gold top ambient
        const eg = new Graphics();
        eg.roundRect(4, 0, cw - 8, 2, 1);
        eg.fill({ color: C.gold, alpha: 0.14 });
        root.addChild(eg);
    } else {
        // REGULAR LOCKED: cold dark
        const bg = new Graphics();
        bg.roundRect(0, 0, cw, rowH, 14);
        bg.fill({ color: 0x060a10, alpha: 1 });
        bg.stroke({ color: C.muted, width: 1, alpha: 0.22 });
        root.addChild(bg);
    }
    const leftSpine = new Graphics();
    leftSpine.roundRect(0, 0, 6, rowH, 3);
    leftSpine.fill({
        color:
            primaryState === 'claimable'
                ? SURFACE_ROLE.missionClaimable.rim
                : primaryState === 'playable'
                  ? SURFACE_ROLE.missionPlayable.rim
                  : primaryState === 'elite_locked'
                    ? C.gold
                    : C.muted,
        alpha: primaryState === 'playable' ? 0.35 : 0.45,
    });
    root.addChild(leftSpine);

    const iconR = Math.max(24, Math.floor(U * 2.8));
    const icX = 14 + iconR;
    const icY = rowH / 2;
    const btnW = 114;
    const btnH = 46;
    const actionDockX = cw - btnW - 24;
    const tx = Math.floor(U * 1.7) + iconR * 2 + Math.floor(U * 1.6);
    const contentW = Math.max(180, actionDockX - tx - 10);
    const textMax = contentW - 14;

    const contentShell = new Graphics();
    contentShell.roundRect(tx - 8, 9, contentW + 6, rowH - 18, 11);
    contentShell.fill({ color: isLocked ? 0x080f19 : 0x0c1521, alpha: isLocked ? 0.62 : 0.5 });
    contentShell.stroke({
        color: primaryState === 'claimable' ? C.gold : primaryState === 'playable' ? C.cyan : C.border,
        width: 1,
        alpha: primaryState === 'playable' ? 0.28 : 0.2,
    });
    root.addChild(contentShell);

    const titleBand = new Graphics();
    titleBand.roundRect(tx - 4, 12, contentW - 8, 22, 6);
    titleBand.fill({
        color: primaryState === 'claimable' ? 0x22180f : primaryState === 'elite_locked' ? 0x1d1610 : 0x101b2a,
        alpha: 0.72,
    });
    root.addChild(titleBand);
    // Icon badge — state-specific treatment
    const icBg = new Graphics();
    if (primaryState === 'claimable') {
        icBg.circle(icX, icY, iconR);
        icBg.fill({ color: 0x13100c, alpha: 1 });
        icBg.stroke({ color: SURFACE_ROLE.missionClaimable.rim, width: 2, alpha: 0.68 });
    } else if (unlocked) {
        icBg.circle(icX, icY, iconR);
        icBg.fill({ color: C.surface2, alpha: 1 });
        icBg.stroke({
            color: completed ? SURFACE_ROLE.missionCompleted.rim : elite ? C.gold : SURFACE_ROLE.missionPlayable.rim,
            width: 2,
            alpha: 0.55,
        });
    } else if (elite) {
        icBg.circle(icX, icY, iconR);
        icBg.fill({ color: 0x0a0908, alpha: 1 });
        icBg.stroke({ color: C.gold, width: 1.5, alpha: 0.40 });
        icBg.circle(icX, icY, iconR - 6);
        icBg.stroke({ color: C.gold, width: 1, alpha: 0.15 });
    } else {
        icBg.circle(icX, icY, iconR);
        icBg.fill({ color: 0x060a10, alpha: 1 });
        icBg.stroke({ color: C.muted, width: 1, alpha: 0.32 });
        icBg.circle(icX, icY, iconR - 6);
        icBg.stroke({ color: C.muted, width: 1, alpha: 0.10 });
    }
    root.addChild(icBg);
    const icGlyph = new Graphics();
    if (unlocked) icoRadar(icGlyph, icX, icY, iconR * 0.55);
    else {
        // Lock glyph — gold for elite, muted for regular
        const lockColor = elite ? C.gold : C.muted;
        const lockAlpha = elite ? 0.55 : 0.50;
        icGlyph.roundRect(icX - iconR * 0.22, icY - iconR * 0.02, iconR * 0.44, iconR * 0.30, 3);
        icGlyph.stroke({ color: lockColor, width: 1.5, alpha: lockAlpha });
        icGlyph.arc(icX, icY - iconR * 0.14, iconR * 0.14, Math.PI, 0);
        icGlyph.stroke({ color: lockColor, width: 1.5, alpha: lockAlpha });
    }
    root.addChild(icGlyph);

    const title = new Text({
        text: trunc(level.name, Math.max(8, Math.floor(textMax / 7.5))),
        style: style(17, '700', unlocked ? C.text : primaryState === 'elite_locked' ? 0xc7b793 : C.muted),
    });
    title.position.set(tx, 12);
    root.addChild(title);
    const tag = new Text({
        text: contentTag,
        style: style(9, '700', unlocked ? 0x9dc1df : 0x7c8da1, 0.8),
    });
    tag.anchor.set(1, 0);
    tag.position.set(tx + contentW - 14, 15);
    root.addChild(tag);

    const subHint =
        level.learningObjectives[0]?.hint ?? `${level.gateCount} gates`;
    const sub = new Text({
        text: trunc(subHint, Math.max(8, Math.floor(textMax / 6))),
        style: style(13, '500', primaryState === 'claimable' ? 0xe8d7a7 : C.muted),
    });
    sub.position.set(tx, 38);
    root.addChild(sub);

    // Primary state pill (single dominant message zone)
    let metaStr = '';
    if (primaryState === 'claimable') metaStr = 'READY TO CLAIM';
    else if (primaryState === 'playable') metaStr = 'PLAYABLE';
    else if (primaryState === 'elite_locked') metaStr = 'ELITE SEALED';
    else metaStr = 'LOCKED';
    if (metaStr) {
        const meta = new Text({
            text: metaStr,
            style: style(
                10,
                '700',
                primaryState === 'claimable'
                    ? SURFACE_ROLE.missionClaimable.accent
                    : primaryState === 'playable'
                        ? SURFACE_ROLE.missionPlayable.accent
                        : primaryState === 'elite_locked'
                          ? SURFACE_ROLE.missionEliteLocked.accent
                          : SURFACE_ROLE.missionLocked.accent,
            ),
        });
        const metaPlate = new Graphics();
        const mw = Math.min(textMax - 8, Math.ceil(meta.width + 12));
        metaPlate.roundRect(tx - 4, 56, mw, 16, 6);
        metaPlate.fill({
            color: primaryState === 'claimable' ? 0x22180d : primaryState === 'elite_locked' ? 0x1b1510 : 0x09131d,
            alpha: 0.74,
        });
        root.addChild(metaPlate);
        meta.anchor.set(0, 0);
        meta.position.set(tx, 58);
        root.addChild(meta);
    }
    // Subordinate helper line (never competes with primary state pill)
    const helper = new Text({
        text:
            primaryState === 'elite_locked'
                ? `Unlock Route ${level.id - 1} to breach seal`
                : primaryState === 'locked'
                  ? `Complete Route ${Math.max(1, level.id - 1)} to unlock`
                  : completed
                    ? 'Completed · replay for better score'
                    : 'Available now',
        style: style(9, '600', 0x6f8096, 0.4),
    });
    helper.position.set(tx, 76);
    root.addChild(helper);

    const rewardRail = new Graphics();
    rewardRail.roundRect(tx - 6, rowH - 27, contentW - 12, 19, 7);
    rewardRail.fill({ color: primaryState === 'claimable' ? 0x231b0f : 0x081019, alpha: 0.75 });
    rewardRail.stroke({
        color: primaryState === 'claimable' ? C.gold : primaryState === 'elite_locked' ? C.gold : C.border,
        width: 1,
        alpha: 0.36,
    });
    root.addChild(rewardRail);
    const rewardGem = new Graphics();
    rewardGem.circle(tx + 6, rowH - 18, 5);
    rewardGem.fill({
        color: primaryState === 'elite_locked' || primaryState === 'claimable' ? C.gold : SURFACE_ROLE.missionPlayable.accent,
        alpha: 0.9,
    });
    rewardGem.circle(tx + 6, rowH - 18, 8);
    rewardGem.stroke({
        color: primaryState === 'elite_locked' || primaryState === 'claimable' ? C.gold : SURFACE_ROLE.missionPlayable.rim,
        width: 1,
        alpha: 0.45,
    });
    root.addChild(rewardGem);
    const reward = new Text({
        text:
            primaryState === 'elite_locked'
                ? `SEALED CACHE +${rewardValue} SIGNAL`
                : primaryState === 'locked'
                  ? `UNLOCK BONUS +${rewardValue} SIGNAL`
                  : `MISSION REWARD +${rewardValue} SIGNAL`,
        style: style(
            10,
            '700',
            primaryState === 'claimable'
                ? SURFACE_ROLE.missionClaimable.accent
                : primaryState === 'locked'
                  ? SURFACE_ROLE.missionLocked.accent
                  : primaryState === 'elite_locked'
                    ? SURFACE_ROLE.missionEliteLocked.accent
                    : completed
                      ? SURFACE_ROLE.missionCompleted.accent
                      : SURFACE_ROLE.missionPlayable.accent,
            0.8,
        ),
    });
    reward.position.set(tx + 16, rowH - 22);
    root.addChild(reward);

    const bx = cw - btnW - 12;
    const by = (rowH - btnH) / 2;
    const actionDock = new Graphics();
    actionDock.roundRect(actionDockX, 8, btnW + 12, rowH - 16, 10);
    actionDock.fill({ color: isLocked ? 0x0c1118 : 0x0a1119, alpha: isLocked ? 0.68 : 0.46 });
    actionDock.stroke({
        color: primaryState === 'claimable' ? C.gold : unlocked ? C.cyan : C.muted,
        width: 1,
        alpha: primaryState === 'claimable' ? 0.44 : 0.28,
    });
    actionDock.roundRect(actionDockX + 8, 11, btnW - 2, 2, 1);
    actionDock.fill({ color: primaryState === 'claimable' ? C.gold : unlocked ? C.cyan : C.muted, alpha: 0.28 });
    root.addChild(actionDock);

    if (unlocked) {
        const btn =
            kenneyButton(primaryState === 'claimable' ? 'CLAIM' : 'PLAY', btnW, btnH, 'button_accent', true, () => onPlay(level.id)) ??
            fallbackPrimaryBtn(btnW, btnH, primaryState === 'claimable' ? 'CLAIM' : 'PLAY', () => onPlay(level.id));
        btn.position.set(bx, by);
        root.addChild(btn);
    } else {
        const lock = new Container();
        const tex = getVelocityUiTexture('button_secondary');
        const canNineSlice = !!tex && btnW >= 116;
        if (canNineSlice) {
            const spr = new NineSliceSprite({
                texture: tex!,
                leftWidth: TAB_BS.L,
                rightWidth: TAB_BS.R,
                topHeight: TAB_BS.T,
                bottomHeight: TAB_BS.B,
                width: btnW,
                height: btnH,
            });
            spr.alpha = 0.45;
            spr.tint = 0x4a5565;
            lock.addChild(spr);
        } else {
            const lb = new Graphics();
            lb.roundRect(0, 0, btnW, btnH, 10);
            lb.fill({ color: 0x0d1520, alpha: 1 });
            lb.stroke({ color: 0x334455, width: 1, alpha: 0.6 });
            // Cross-hatch texture
            const hatch = new Graphics();
            hatch.setStrokeStyle({ width: 1, color: 0x223344, alpha: 0.35 });
            for (let hx = 0; hx < btnW; hx += 10) {
                hatch.moveTo(hx, 0); hatch.lineTo(hx, btnH);
            }
            hatch.stroke();
            lock.addChild(lb);
            lock.addChild(hatch);
        }
        const lt = new Text({ text: elite ? 'SEALED' : 'LOCKED', style: style(10, '700', elite ? 0xb89a62 : 0x7a8ea7) });
        lt.anchor.set(0.5);
        lt.position.set(btnW / 2, btnH / 2 - 6);
        lock.addChild(lt);
        const lsub = new Text({
            text: elite ? 'PREMIUM ROUTE' : 'COMPLETE PREVIOUS',
            style: style(8, '600', elite ? 0x7b6a49 : 0x5b6d82, 0.6),
        });
        lsub.anchor.set(0.5);
        lsub.position.set(btnW / 2, btnH / 2 + 8);
        lock.addChild(lsub);
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
    const listFrame = new Graphics();
    listFrame.roundRect(0, 0, cw, listH, 14);
    listFrame.fill({ color: 0x08131f, alpha: 0.28 });
    listFrame.stroke({ color: 0x2e435f, width: 1, alpha: 0.26 });
    listFrame.roundRect(8, 2, cw - 16, 2, 1);
    listFrame.fill({ color: C.cyan, alpha: 0.14 });
    root.addChild(listFrame);

    const maskG = new Graphics();
    maskG.rect(0, 0, cw, listH);
    maskG.fill({ color: 0xffffff, alpha: 1 });
    maskG.visible = false;
    root.addChild(maskG);

    const scrollLayer = new Container();
    scrollLayer.mask = maskG;
    root.addChild(scrollLayer);

    let scrollY = 0;
    const U = unitFromViewport(cw, listH);
    const rowH = Math.max(96, Math.floor(U * 11.5));
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
    const H = 82;
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
        vec: (g: Graphics, cx: number, cy: number, s: number) => void;
    }[] = [
        { label: 'Home', slot: 0, onTap: () => { navIndexBySlot?.(0); onHome(); }, vec: icoHome },
        {
            label: 'Missions',
            slot: 1,
            onTap: () => {
                navIndexBySlot?.(1);
                gameFlow().openMissionSelect();
            },
            vec: icoMap,
        },
        {
            label: 'Hangar',
            slot: 2,
            onTap: () => { navIndexBySlot?.(2); ui.showScreen('store', true); },
            vec: icoHangar,
        },
        {
            label: 'Store',
            slot: 3,
            onTap: () => { navIndexBySlot?.(3); ui.showScreen('store', true); },
            vec: icoStore,
        },
    ];

    const n = items.length;
    const U = unitFromViewport(cw, H);
    const inset = Math.max(8, Math.floor(U * 0.7));
    const slotW = cw / n;
    const labels: Text[] = [];
    const glyphs: Graphics[] = [];
    const activePlates: Graphics[] = [];

    items.forEach((it, i) => {
        const slot = new Container();
        slot.position.set(i * slotW, 0);
        slot.eventMode = 'static';
        slot.cursor = 'pointer';

        const slotBase = new Graphics();
        slotBase.roundRect(inset * 0.35, 8, slotW - inset * 0.7, H - 18, 14);
        slotBase.fill({ color: SURFACE_ROLE.bottomNavIdle.face, alpha: 0.7 });
        slotBase.stroke({ color: SURFACE_ROLE.bottomNavIdle.rim, width: 1, alpha: 0.5 });
        slot.addChild(slotBase);

        const activeBg = new Graphics();
        activeBg.visible = false;
        activeBg.roundRect(inset * 0.35 + 2, 9, slotW - inset * 0.7 - 4, H - 22, 12);
        activeBg.fill({ color: SURFACE_ROLE.bottomNavActive.face, alpha: 0.76 });
        activeBg.stroke({ color: SURFACE_ROLE.bottomNavActive.rim, width: 1.25, alpha: 0.66 });
        activeBg.roundRect(slotW / 2 - 18, 10, 36, 2, 1);
        activeBg.fill({ color: SURFACE_ROLE.bottomNavActive.tint, alpha: 0.74 });
        slot.addChild(activeBg);
        activePlates.push(activeBg);

        const cx = slotW / 2;
        const vg = new Graphics();
        it.vec(vg, cx, H / 2 - 12, 22);
        slot.addChild(vg);
        glyphs.push(vg);

        const t = new Text({ text: it.label, style: style(11, '700', SURFACE_ROLE.bottomNavIdle.label, 0.2) });
        t.anchor.set(0.5, 0);
        t.position.set(cx, H / 2 + 12);
        slot.addChild(t);
        labels.push(t);

        pressable(slot, it.onTap);
        root.addChild(slot);
    });

    function setActive(i: number): void {
        labels.forEach((t, idx) => {
            const on = idx === i;
            t.style = on
                ? style(11, '800', SURFACE_ROLE.bottomNavActive.label, 0.2)
                : style(11, '700', SURFACE_ROLE.bottomNavIdle.label, 0.2);
            glyphs[idx].tint = on ? SURFACE_ROLE.bottomNavActive.tint : SURFACE_ROLE.bottomNavIdle.tint;
            activePlates[idx].visible = on;
        });
    }
    setActive(0);
    return { root, setActive, labels };
}
