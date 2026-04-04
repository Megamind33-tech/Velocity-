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
import { getVelocityCustomTexture, getVelocityUiTexture, type VelocityUiTextureKey } from '../velocityUiArt';
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';
import {
    kenneyAvatarPlate,
    kenneyButton,
    kenneyDockBar,
    kenneyHeroPanel,
    kenneyMissionCardFace,
    kenneyProgressBar,
    kenneyRowPanel,
    kenneyStatChip,
} from './kenneyLandscapeWidgets';
import {
    computeCardVerticalBands,
    fitBodyText,
    fitOneLineSmall,
    fitTitleText,
} from '../menuShared/missionCardLayout';
import { buildCommandDock, type CommandDockPalette } from '../menuShared/commandDock';
import { buildModeFilterStrip } from '../menuShared/modeFilterStrip';
import { mountHeroCommandLayout } from '../menuShared/heroCommandLayout';

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
    lockedFace: 0x070a12,
    lockedFaceElite: 0x0c0a10,
    lockedPlaque: 0x050810,
    lockedPlaqueElite: 0x100c08,
    lockedRim: 0x2a3d4a,
    lockedRimElite: 0x6a5228,
    dockDeck: 0x060912,
    dockDeckTop: 0x0d1522,
    dockDeckRim: 0x1e2f44,
    dockChannel: 0x020408,
    dockCellIdle: 0x080c14,
    dockCellIdleRim: 0x141c2a,
    dockCellActive: 0x0e1624,
    dockCellActiveRim: 0x00c4a8,
    dockBolt: 0x3d4f62,
};

const SURFACE_ROLE = {
    tabActive: { tint: 0xc5efff, text: 0xf8fbff, face: 0x19384a, rim: 0x79d9ff, cue: 0x9fe8ff },
    tabIdle: { tint: 0xd3deea, text: 0xa6b4c8, face: 0x0d1521, rim: 0x2b3a52 },
    missionPlayable: { rim: C.cyan, accent: 0x2df0d0 },
    missionCompleted: { rim: 0x62b9ff, accent: 0x8fd9ff },
    missionClaimable: { rim: C.gold, accent: 0xffef9d },
    missionLocked: { accent: 0x8194ac },
    missionEliteLocked: { accent: 0xf0c96a },
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
    const prestige = getVelocityCustomTexture('rank_prestige');
    if (prestige) {
        const em = new Sprite(prestige);
        em.anchor.set(1, 0);
        em.width = 20;
        em.height = 20;
        em.position.set(chipW - 6, 6);
        em.alpha = 0.9;
        c2.addChild(em);
    }
    c2.position.set(x0 + chipW + gap, 5);
    root.addChild(c2);

    const c3 =
        kenneyStatChip(icoGemPremium, 'PREMIUM', `${prog.unlockedCount}`, chipW, H - 4, PURPLE) ??
        vectorStatChip(icoGemPremium, 'PREMIUM', `${prog.unlockedCount}`, chipW, H - 4, PURPLE);
    const elite = getVelocityCustomTexture('rank_elite');
    if (elite) {
        const em = new Sprite(elite);
        em.anchor.set(1, 0);
        em.width = 20;
        em.height = 20;
        em.position.set(chipW - 6, 6);
        em.alpha = 0.9;
        c3.addChild(em);
    }
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
    const rankTex = label === 'BEST'
        ? getVelocityCustomTexture('rank_prestige')
        : label === 'PREMIUM'
          ? getVelocityCustomTexture('rank_elite')
          : undefined;
    if (rankTex) {
        const rank = new Sprite(rankTex);
        rank.anchor.set(1, 0);
        rank.width = 18;
        rank.height = 18;
        rank.position.set(w - 6, 5);
        rank.alpha = 0.88;
        root.addChild(rank);
    }
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
    const contentW = Math.max(260, cw - 44);
    const innerH = Math.max(110, cardH - 54);

    const pair = kenneyHeroPanel(cw, cardH);
    if (pair) {
        root.addChild(pair.root);
        const content = pair.content;
        const cmd = mountHeroCommandLayout(
            content,
            contentW,
            innerH,
            0,
            prog,
            rank,
            onFlyNow,
            { cyan: C.cyan, muted: C.muted, text: C.text, border: C.border, gold: C.gold },
            FONT_UI,
            {
                trunc,
                textStyle: style,
                icoRadar,
                icoWing,
                kenneyProgressBar,
                kenneyButton,
                fallbackPrimaryBtn,
            },
        );
        if (cmd.flyCta) cmd.flyCta.label = 'heroFlyCta';
        (root as Container & { heroCommandAnim?: typeof cmd }).heroCommandAnim = cmd;
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

export function buildModeTabs(
    cw: number,
    onSelect: (index: number) => void,
): { root: Container; setActive: (i: number) => void } {
    const strip = buildModeFilterStrip(cw, 58, FONT_UI, onSelect, {
        useKenneyTrack: true,
        channelGlow: false,
    });
    return { root: strip.root, setActive: strip.setActive };
}

function filterLevels(tab: number): LevelDefinition[] {
    const all = [...LEVEL_DEFINITIONS].sort((a, b) => a.id - b.id);
    if (tab === 0) return all;
    if (tab === 1) return all.filter((l) => l.id % 2 === 1);
    if (tab === 2) return all.filter((l) => l.id <= 5);
    if (tab === 3) return all.filter((l) => l.id >= 11);
    return all.filter((l) => l.id >= 16);
}

/** Gated row — Kenney face + same vertical band model as portrait. */
function buildLockedMissionRowLandscape(
    level: LevelDefinition,
    cw: number,
    rowH: number,
    primaryState: 'locked' | 'elite_locked',
    elite: boolean,
    contentTag: string,
): Container {
    const root = new Container();
    const U = unitFromViewport(cw, rowH);
    const plaqueW = Math.min(128, Math.max(108, Math.floor(cw * 0.26)));
    const leftRailW = Math.max(5, Math.floor(U * 0.55));
    const leftPad = Math.floor(U * 1.1);
    const emblemWellW = Math.max(44, Math.floor(U * 5.2));
    const zoneAEnd = leftPad + emblemWellW + GRID;
    const centerW = Math.max(160, cw - zoneAEnd - plaqueW - GRID * 3 - 16);
    const tx = zoneAEnd;
    const rewardValue = Math.max(primaryState === 'elite_locked' ? 140 : 90, level.gateCount * (primaryState === 'elite_locked' ? 24 : 18));
    const faceRole = primaryState === 'elite_locked' ? 'elite_locked' : 'locked';
    const kFace = kenneyMissionCardFace(cw, rowH, faceRole);
    if (kFace) root.addChild(kFace);
    else {
        const face = new Graphics();
        face.roundRect(0, 0, cw, rowH, 14);
        face.fill({ color: elite ? C.lockedFaceElite : C.lockedFace, alpha: 1 });
        face.stroke({ color: elite ? C.lockedRimElite : C.lockedRim, width: 1.5, alpha: elite ? 0.45 : 0.38 });
        root.addChild(face);
    }

    const spine = new Graphics();
    spine.roundRect(0, 8, leftRailW, rowH - 16, 2);
    spine.fill({ color: elite ? C.gold : C.muted, alpha: elite ? 0.5 : 0.38 });
    root.addChild(spine);

    const well = new Graphics();
    well.roundRect(leftPad, 10, emblemWellW, rowH - 20, 10);
    well.fill({ color: elite ? 0x0a0806 : 0x04060c, alpha: 1 });
    well.stroke({ color: elite ? C.gold : C.lockedRim, width: 1, alpha: elite ? 0.35 : 0.28 });
    root.addChild(well);

    const emX = leftPad + emblemWellW / 2;
    const emY = rowH / 2;
    const iconRFallback = Math.max(22, Math.floor(U * 2.6));
    const lockBadge = getVelocityCustomTexture('badge_locked');
    if (lockBadge) {
        const seal = new Sprite(lockBadge);
        seal.anchor.set(0.5);
        const sealS = Math.min(emblemWellW - 8, rowH - 32);
        seal.width = sealS;
        seal.height = sealS;
        seal.position.set(emX, emY);
        seal.alpha = elite ? 0.92 : 0.78;
        root.addChild(seal);
    } else {
        const ic = new Graphics();
        const lockColor = elite ? C.gold : C.muted;
        const ir = iconRFallback;
        ic.roundRect(emX - ir * 0.22, emY - ir * 0.02, ir * 0.44, ir * 0.30, 3);
        ic.stroke({ color: lockColor, width: 1.5, alpha: 0.55 });
        ic.arc(emX, emY - ir * 0.14, ir * 0.14, Math.PI, 0);
        ic.stroke({ color: lockColor, width: 1.5, alpha: 0.55 });
        root.addChild(ic);
    }

    const bands = computeCardVerticalBands(rowH, tx, centerW, elite);
    const title = fitTitleText(level.name, centerW, 0, {
        fontFamily: FONT_UI,
        fontWeight: '700',
        fill: elite ? 0xd4c4a8 : C.muted,
        letterSpacing: 0.2,
    }, 17, 12);
    title.position.set(tx, bands.titleY);
    root.addChild(title);

    const tag = fitOneLineSmall(contentTag, Math.min(100, centerW * 0.42), {
        fontFamily: FONT_UI,
        fontWeight: '700',
        fill: 0x6a7a8e,
        letterSpacing: 0.4,
        fontSize: 8,
    });
    tag.anchor.set(1, 0);
    tag.position.set(tx + centerW - 4, bands.titleY + 1);
    root.addChild(tag);

    if (elite) {
        const tierPlate = new Graphics();
        tierPlate.roundRect(tx, bands.tierY, Math.min(112, centerW - 4), bands.tierH, 6);
        tierPlate.fill({ color: C.lockedPlaqueElite, alpha: 0.88 });
        tierPlate.stroke({ color: C.gold, width: 1, alpha: 0.38 });
        root.addChild(tierPlate);
        const tier = fitOneLineSmall('ELITE ROUTE', centerW - 20, {
            fontFamily: FONT_UI,
            fontWeight: '800',
            fill: C.gold,
            letterSpacing: 1.0,
            fontSize: 9,
        });
        tier.position.set(tx + 8, bands.tierY + Math.max(1, (bands.tierH - tier.height) / 2));
        root.addChild(tier);
    }

    const subHint = level.learningObjectives[0]?.hint ?? `${level.gateCount} gates`;
    const sub = fitBodyText(subHint, centerW, bands.subMaxH, {
        fontFamily: FONT_UI,
        fontWeight: '500',
        fill: 0x5a6574,
    }, 13, 9);
    sub.position.set(tx, bands.subY);
    root.addChild(sub);

    const metaStr = primaryState === 'elite_locked' ? 'SEALED ROUTE' : 'GATED';
    const metaFill = primaryState === 'elite_locked' ? SURFACE_ROLE.missionEliteLocked.accent : SURFACE_ROLE.missionLocked.accent;
    const metaPlate = new Graphics();
    metaPlate.roundRect(tx, bands.metaY, Math.min(centerW - 4, 128), bands.metaH, 6);
    metaPlate.fill({ color: primaryState === 'elite_locked' ? 0x1a140c : 0x0a1218, alpha: 0.88 });
    metaPlate.stroke({ color: elite ? C.gold : C.lockedRim, width: 1, alpha: 0.35 });
    root.addChild(metaPlate);
    const meta = fitOneLineSmall(metaStr, centerW - 16, {
        fontFamily: FONT_UI,
        fontWeight: '800',
        fill: metaFill,
        letterSpacing: 0.8,
        fontSize: 9,
    });
    meta.position.set(tx + 8, bands.metaY + Math.max(1, (bands.metaH - meta.height) / 2));
    root.addChild(meta);

    const req =
        primaryState === 'elite_locked'
            ? `Breach Route ${Math.max(1, level.id - 1)} to open seal`
            : `Complete Route ${Math.max(1, level.id - 1)} for access`;
    const helper = fitBodyText(req, centerW, bands.helpH, {
        fontFamily: FONT_UI,
        fontWeight: '600',
        fill: 0x4a5568,
    }, 9, 8);
    helper.position.set(tx, bands.helpY);
    root.addChild(helper);

    const rewardRail = new Graphics();
    rewardRail.roundRect(tx - 2, bands.rewardY, centerW + 4, bands.rewardH, 7);
    rewardRail.fill({ color: elite ? 0x120e0a : 0x060a10, alpha: 0.9 });
    rewardRail.stroke({ color: elite ? C.gold : C.lockedRim, width: 1, alpha: 0.32 });
    root.addChild(rewardRail);
    const rewardBadge = getVelocityCustomTexture('badge_reward');
    if (rewardBadge) {
        const rb = new Sprite(rewardBadge);
        rb.anchor.set(0.5);
        rb.width = 14;
        rb.height = 14;
        rb.position.set(tx + 8, bands.rewardY + bands.rewardH / 2);
        rb.alpha = 0.82;
        root.addChild(rb);
    }
    const rewardStr =
        primaryState === 'elite_locked'
            ? `WITHHELD +${rewardValue} SIGNAL`
            : `BONUS +${rewardValue} SIGNAL`;
    const reward = fitOneLineSmall(rewardStr, centerW - 28, {
        fontFamily: FONT_UI,
        fontWeight: '700',
        fill: elite ? SURFACE_ROLE.missionEliteLocked.accent : SURFACE_ROLE.missionLocked.accent,
        letterSpacing: 0.45,
        fontSize: 9,
    });
    reward.position.set(tx + 20, bands.rewardY + Math.max(2, (bands.rewardH - reward.height) / 2));
    root.addChild(reward);

    const px = cw - plaqueW - 12;
    const py = 10;
    const ph = rowH - 20;
    const plaqueTex = getVelocityCustomTexture('frame_locked');
    if (plaqueTex) {
        const ps = new Sprite(plaqueTex);
        ps.width = plaqueW;
        ps.height = ph;
        ps.position.set(px, py);
        ps.alpha = elite ? 0.52 : 0.4;
        root.addChild(ps);
    }
    const plaque = new Graphics();
    plaque.roundRect(px, py, plaqueW, ph, 12);
    plaque.fill({ color: elite ? C.lockedPlaqueElite : C.lockedPlaque, alpha: plaqueTex ? 0.7 : 0.96 });
    plaque.stroke({ color: elite ? C.gold : C.lockedRim, width: 2, alpha: elite ? 0.55 : 0.5 });
    root.addChild(plaque);
    const plaqueInner = new Graphics();
    plaqueInner.roundRect(px + 4, py + 4, plaqueW - 8, ph - 8, 9);
    plaqueInner.stroke({ color: 0xffffff, width: 1, alpha: elite ? 0.06 : 0.04 });
    root.addChild(plaqueInner);

    const stateWord = primaryState === 'elite_locked' ? 'SEALED' : 'LOCKED';
    const stateMain = new Text({
        text: stateWord,
        style: style(12, '800', elite ? C.gold : 0x8fa3b8, 1.6),
    });
    stateMain.anchor.set(0.5, 0);
    stateMain.position.set(px + plaqueW / 2, py + Math.floor(ph * 0.26));
    root.addChild(stateMain);

    const stateSub = new Text({
        text: elite ? 'ELITE GATE' : 'NO ACCESS',
        style: style(8, '600', elite ? 0x7a6848 : 0x4d5a6a, 0.6),
    });
    stateSub.anchor.set(0.5, 0);
    stateSub.position.set(px + plaqueW / 2, py + Math.floor(ph * 0.5));
    root.addChild(stateSub);

    const riv1 = new Graphics();
    riv1.circle(px + 10, py + 12, 2);
    riv1.fill({ color: C.dockBolt, alpha: 0.5 });
    root.addChild(riv1);
    const riv2 = new Graphics();
    riv2.circle(px + plaqueW - 10, py + ph - 12, 2);
    riv2.fill({ color: C.dockBolt, alpha: 0.5 });
    root.addChild(riv2);

    return root;
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

    if (isLocked) {
        return buildLockedMissionRowLandscape(level, cw, rowH, primaryState, elite, contentTag);
    }

    const playFaceRole = primaryState === 'claimable' ? 'claimable' : 'playable';
    const kPlayFace = kenneyMissionCardFace(cw, rowH, playFaceRole);
    if (kPlayFace) {
        kPlayFace.alpha = primaryState === 'claimable' ? 0.98 : 0.96;
        root.addChild(kPlayFace);
    } else if (primaryState === 'claimable') {
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
    } else {
        const plate = kenneyRowPanel(cw, rowH);
        if (plate) root.addChild(plate);
        else {
            const bg = new Graphics();
            bg.roundRect(0, 0, cw, rowH, 14);
            bg.fill({ color: C.surface, alpha: 1 });
            bg.stroke({ color: C.border, width: 1, alpha: 0.5 });
            root.addChild(bg);
        }
    }
    if (primaryState === 'claimable') {
        const crown = new Graphics();
        crown.roundRect(5, 0, cw - 10, 3, 1);
        crown.fill({ color: SURFACE_ROLE.missionClaimable.rim, alpha: 0.55 });
        root.addChild(crown);
    }
    const leftSpine = new Graphics();
    leftSpine.roundRect(0, 0, 6, rowH, 3);
    leftSpine.fill({
        color:
            primaryState === 'claimable'
                ? SURFACE_ROLE.missionClaimable.rim
                : SURFACE_ROLE.missionPlayable.rim,
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

    const icBg = new Graphics();
    if (primaryState === 'claimable') {
        icBg.circle(icX, icY, iconR);
        icBg.fill({ color: 0x13100c, alpha: 1 });
        icBg.stroke({ color: SURFACE_ROLE.missionClaimable.rim, width: 2, alpha: 0.68 });
    } else {
        icBg.circle(icX, icY, iconR);
        icBg.fill({ color: C.surface2, alpha: 1 });
        icBg.stroke({
            color: completed ? SURFACE_ROLE.missionCompleted.rim : elite ? C.gold : SURFACE_ROLE.missionPlayable.rim,
            width: 2,
            alpha: 0.55,
        });
    }
    root.addChild(icBg);
    const icGlyph = new Graphics();
    icoRadar(icGlyph, icX, icY, iconR * 0.55);
    root.addChild(icGlyph);

    const tagReserve = Math.min(120, Math.floor(textMax * 0.38));
    const bands = computeCardVerticalBands(rowH, tx, textMax, elite);

    const title = fitTitleText(level.name, textMax, tagReserve, {
        fontFamily: FONT_UI,
        fontWeight: '700',
        fill: C.text,
        letterSpacing: 0.2,
    }, 17, 12);
    title.position.set(tx, bands.titleY);
    root.addChild(title);

    const tag = fitOneLineSmall(contentTag, tagReserve - 6, {
        fontFamily: FONT_UI,
        fontWeight: '700',
        fill: 0x9dc1df,
        letterSpacing: 0.35,
        fontSize: 8,
    });
    tag.anchor.set(1, 0);
    tag.position.set(tx + textMax - 4, bands.titleY + 1);
    root.addChild(tag);

    const subHint = level.learningObjectives[0]?.hint ?? `${level.gateCount} gates`;
    const sub = fitBodyText(subHint, textMax - 4, bands.subMaxH, {
        fontFamily: FONT_UI,
        fontWeight: '500',
        fill: primaryState === 'claimable' ? 0xe8d7a7 : C.muted,
    }, 13, 9);
    sub.position.set(tx, bands.subY);
    root.addChild(sub);

    let metaStr = '';
    let metaFill: number = SURFACE_ROLE.missionPlayable.accent;
    if (primaryState === 'claimable') {
        metaStr = 'READY TO CLAIM';
        metaFill = SURFACE_ROLE.missionClaimable.accent;
    } else if (elite && completed) {
        metaStr = 'ELITE ✓';
        metaFill = C.gold;
    } else if (elite) {
        metaStr = 'ELITE';
        metaFill = C.gold;
    } else if (completed) {
        metaStr = 'CLEARED';
        metaFill = SURFACE_ROLE.missionCompleted.accent;
    } else {
        metaStr = 'REWARD';
        metaFill = SURFACE_ROLE.missionPlayable.accent;
    }
    const metaPlate = new Graphics();
    metaPlate.roundRect(tx, bands.metaY, Math.min(textMax - 4, 140), bands.metaH, 6);
    metaPlate.fill({ color: primaryState === 'claimable' ? 0x22180d : 0x09131d, alpha: 0.78 });
    metaPlate.stroke({
        color: primaryState === 'claimable' ? C.gold : C.border,
        width: 1,
        alpha: 0.32,
    });
    root.addChild(metaPlate);
    const meta = fitOneLineSmall(metaStr, textMax - 16, {
        fontFamily: FONT_UI,
        fontWeight: '800',
        fill: metaFill,
        letterSpacing: 0.55,
        fontSize: 9,
    });
    meta.position.set(tx + 8, bands.metaY + Math.max(1, (bands.metaH - meta.height) / 2));
    root.addChild(meta);

    const helper = fitBodyText(
        completed ? 'Replay for a better score' : 'Available now',
        textMax,
        bands.helpH,
        { fontFamily: FONT_UI, fontWeight: '600', fill: 0x6f8096 },
        9,
        8,
    );
    helper.position.set(tx, bands.helpY);
    root.addChild(helper);

    const rewardRail = new Graphics();
    rewardRail.roundRect(tx - 4, bands.rewardY, Math.max(120, textMax + 8), bands.rewardH, 7);
    rewardRail.fill({ color: primaryState === 'claimable' ? 0x231b0f : 0x081019, alpha: 0.78 });
    rewardRail.stroke({
        color: primaryState === 'claimable' ? C.gold : C.border,
        width: 1,
        alpha: 0.36,
    });
    root.addChild(rewardRail);
    const rewardGem = new Graphics();
    rewardGem.circle(tx + 6, bands.rewardY + bands.rewardH / 2, 5);
    rewardGem.fill({
        color: primaryState === 'claimable' ? C.gold : SURFACE_ROLE.missionPlayable.accent,
        alpha: 0.9,
    });
    rewardGem.circle(tx + 6, bands.rewardY + bands.rewardH / 2, 8);
    rewardGem.stroke({
        color: primaryState === 'claimable' ? C.gold : SURFACE_ROLE.missionPlayable.rim,
        width: 1,
        alpha: 0.45,
    });
    root.addChild(rewardGem);
    const rewardBadge = getVelocityCustomTexture('badge_reward');
    if (rewardBadge) {
        const rb = new Sprite(rewardBadge);
        rb.anchor.set(0.5);
        rb.width = 14;
        rb.height = 14;
        rb.position.set(tx + 6, bands.rewardY + bands.rewardH / 2);
        rb.alpha = 0.85;
        root.addChild(rb);
    }
    const rewardLine = `MISSION REWARD +${rewardValue} SIGNAL`;
    const rewardFill =
        primaryState === 'claimable'
            ? SURFACE_ROLE.missionClaimable.accent
            : completed
              ? SURFACE_ROLE.missionCompleted.accent
              : SURFACE_ROLE.missionPlayable.accent;
    const reward = fitOneLineSmall(rewardLine, textMax - 28, {
        fontFamily: FONT_UI,
        fontWeight: '700',
        fill: rewardFill,
        letterSpacing: 0.45,
        fontSize: 9,
    });
    reward.position.set(tx + 18, bands.rewardY + Math.max(2, (bands.rewardH - reward.height) / 2));
    root.addChild(reward);

    const bx = cw - btnW - 12;
    const by = (rowH - btnH) / 2;
    const actionDock = new Graphics();
    actionDock.roundRect(actionDockX, 8, btnW + 12, rowH - 16, 10);
    actionDock.fill({ color: 0x0a1119, alpha: 0.46 });
    actionDock.stroke({
        color: primaryState === 'claimable' ? C.gold : C.cyan,
        width: 1,
        alpha: primaryState === 'claimable' ? 0.44 : 0.28,
    });
    actionDock.roundRect(actionDockX + 8, 11, btnW - 2, 2, 1);
    actionDock.fill({ color: primaryState === 'claimable' ? C.gold : C.cyan, alpha: 0.28 });
    root.addChild(actionDock);
    const frameTex = primaryState === 'claimable' ? getVelocityCustomTexture('frame_premium') : undefined;
    if (frameTex) {
        const frame = new Sprite(frameTex);
        frame.width = btnW + 18;
        frame.height = rowH - 10;
        frame.position.set(actionDockX - 3, 5);
        frame.alpha = 0.72;
        root.addChild(frame);
    }

    const btn =
        kenneyButton(primaryState === 'claimable' ? 'CLAIM' : 'PLAY', btnW, btnH, 'button_accent', true, () => onPlay(level.id)) ??
        fallbackPrimaryBtn(btnW, btnH, primaryState === 'claimable' ? 'CLAIM' : 'PLAY', () => onPlay(level.id));
    btn.position.set(bx, by);
    root.addChild(btn);

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
    rowHOverride?: number,
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
    root.addChild(maskG);

    const scrollLayer = new Container();
    scrollLayer.mask = maskG;
    root.addChild(scrollLayer);

    let scrollY = 0;
    const U = unitFromViewport(cw, listH);
    const rowH =
        rowHOverride ??
        Math.max(96, Math.floor(U * 11.5));
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
    const H = 84;
    const palette: CommandDockPalette = {
        dockDeck: C.dockDeck,
        dockDeckRim: C.dockDeckRim,
        dockDeckTop: C.dockDeckTop,
        dockChannel: C.dockChannel,
        dockBolt: C.dockBolt,
        dockCellIdle: C.dockCellIdle,
        dockCellIdleRim: C.dockCellIdleRim,
        dockCellActive: C.dockCellActive,
        dockCellActiveRim: C.dockCellActiveRim,
        accentCyan: C.cyan,
        inactiveIconTint: 0xa8b4c4,
        labelIdle: 0x4a5666,
    };
    const kUnder = kenneyDockBar(cw, H);
    const dock = buildCommandDock(
        cw,
        H,
        palette,
        FONT_UI,
        [
            { label: 'HOME', onTap: () => { navIndexBySlot?.(0); onHome(); }, draw: icoHome },
            {
                label: 'MISSIONS',
                onTap: () => {
                    navIndexBySlot?.(1);
                    gameFlow().openMissionSelect();
                },
                draw: icoMap,
            },
            {
                label: 'HANGAR',
                onTap: () => { navIndexBySlot?.(2); ui.showScreen('store', true); },
                draw: icoHangar,
            },
            {
                label: 'STORE',
                onTap: () => { navIndexBySlot?.(3); ui.showScreen('store', true); },
                draw: icoStore,
            },
        ],
        kUnder,
        0.55,
    );
    return { root: dock.root, setActive: dock.setActive, labels: dock.labels };
}
