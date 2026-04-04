/**
 * SECTIONS C–F — Portrait mission console (PixiJS v8 + TypeScript)
 * Component architecture + full screen build + motion tick + state styling.
 */

import {
    Container,
    FederatedPointerEvent,
    Graphics,
    NineSliceSprite,
    Text,
    TextStyle,
} from 'pixi.js';
import { GAME_FONTS } from '../GameUITheme';
import { getMainMenuProgress, isLevelUnlocked } from '../../../data/localProgress';
import { LEVEL_DEFINITIONS, type LevelDefinition } from '../../../data/levelDefinitions';
import { gameFlow } from '../gameFlowBridge';
import type { GameUIManager } from '../GameUIManager';
import { getVelocityUiTexture } from '../velocityUiArt';
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';

const PORTRAIT_TAB_BS = VELOCITY_UI_SLICE.button;
import { kenneyButton, kenneyDockBar, kenneyProgressBar } from '../menuLandscape/kenneyLandscapeWidgets';
import { P_COLORS, P_ICON, P_MOTION, P_OPACITY, P_RADIUS, P_SHADOW, P_SPACE, P_TYPO, P_Z } from './missionPortraitTokens';
import {
    drawIconHangar,
    drawIconHome,
    drawIconLock,
    drawIconMap,
    drawIconProfile,
    drawIconRouteNode,
    drawIconStore,
    drawIconWing,
} from './missionPortraitIcons';

const FONT = GAME_FONTS.standard;

function ts(
    spec: { fontSize: number; lineHeight?: number; fontWeight: string; letterSpacing?: number },
    fill: number,
): TextStyle {
    return new TextStyle({
        fontFamily: FONT,
        fontSize: spec.fontSize,
        fontWeight: spec.fontWeight as '400' | '500' | '600' | '700' | '800',
        fill,
        letterSpacing: spec.letterSpacing ?? 0,
    });
}

function pressable(root: Container, onUp: () => void): void {
    root.eventMode = 'static';
    root.cursor = 'pointer';
    const stop = (e: FederatedPointerEvent) => e.stopPropagation();
    root.on('pointerdown', (e) => {
        stop(e);
        root.scale.set(0.97);
    });
    root.on('pointerup', (e) => {
        stop(e);
        root.scale.set(1);
        onUp();
    });
    root.on('pointerupoutside', () => root.scale.set(1));
    root.on('pointercancel', () => root.scale.set(1));
}

function trunc(s: string, max: number): string {
    return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

// ─── C. COMPONENT ARCHITECTURE (implemented below) ─────────────────────────
// AmbientBackground(w,h): props none; parallax grid + stars; tick updates alpha/pos
// StatusStrip: props cw, model, callbacks
// StatusChip: label, value, accent, w, h
// FeaturedMissionCard: featured, rank, prog, onFly, cw, cardH — returns { root, layers }
// RouteProgress: bar + sweep line ref
// LiveMicChip, RankChip, PrimaryCTAButton, RewardBadge — inline in Featured
// SegmentTabs: tabs, activeIndex, onSelect, cw
// MissionList: scroll mask, rows
// MissionCard: level row
// LockedButton / PLAY via kenney
// BottomDockNav: 4 items
// DockNavItem: icon + label + selected

export type PortraitAnimHandles = {
    heroGlow: Graphics;
    heroMotif: Graphics;
    rankGlow: Graphics;
    routeSweep: Graphics;
    rewardShimmer: Graphics;
    tabGlows: Graphics[];
    dockCradles: Graphics[];
    cardIdle: { root: Container; phase: number }[];
};

export type PortraitMissionBundle = {
    root: Container;
    tick: (t: number) => void;
    rebuildList: (tabIndex: number) => void;
    setTabActive: (i: number) => void;
    setNavActive: (i: number) => void;
    setScrollY: (y: number) => void;
    getScrollY: () => number;
    maxScroll: () => number;
    topRefs: { signal: Text; best: Text; premium: Text };
    flyCta: Container | null;
};

function filterLevels(tab: number): LevelDefinition[] {
    const all = [...LEVEL_DEFINITIONS].sort((a, b) => a.id - b.id);
    if (tab === 0) return all;
    if (tab === 1) return all.filter((l) => l.id % 2 === 1);
    if (tab === 2) return all.filter((l) => l.id <= 5);
    if (tab === 3) return all.filter((l) => l.id >= 11);
    return all.filter((l) => l.id >= 16);
}

function buildAmbientBackground(w: number, h: number): { root: Container; tick: (t: number) => void } {
    const root = new Container();
    root.zIndex = P_Z.ambient;
    root.sortableChildren = true;

    // ── Base fill — very dark, space-like ───────────────────────────────────
    const base = new Graphics();
    base.rect(0, 0, w, h);
    base.fill({ color: P_COLORS.bgBase, alpha: 1 });
    root.addChild(base);

    // ── Deep horizon glow — world integration anchor ────────────────────────
    const horizonY = h * 0.52;
    const hglow = new Graphics();
    hglow.rect(0, horizonY - 1, w, 1);
    hglow.fill({ color: P_COLORS.accentCyan, alpha: 0.07 });
    hglow.ellipse(w * 0.5, horizonY, w * 0.7, 18);
    hglow.fill({ color: P_COLORS.accentCyan, alpha: 0.05 });
    root.addChild(hglow);

    // ── Perspective grid — angled lines converging to horizon (suggests depth/speed) ──
    const grid = new Graphics();
    const horizon = { x: w * 0.5, y: h * 0.4 };
    const numLines = 10;
    const spread = w * 1.4;
    for (let i = 0; i <= numLines; i++) {
        const bx = (i / numLines) * spread - spread * 0.2;
        grid.moveTo(horizon.x + (bx - horizon.x) * 0.01, horizon.y);
        grid.lineTo(bx, h + 20);
        grid.stroke({ color: P_COLORS.accentCyan, width: 1, alpha: 0.05 });
    }
    // Horizontal cross-lines (near/far perspective)
    for (let j = 0; j < 6; j++) {
        const t2 = 0.12 + j * 0.15;
        const y2 = horizon.y + (h + 20 - horizon.y) * t2;
        grid.moveTo(0, y2);
        grid.lineTo(w, y2);
        grid.stroke({ color: P_COLORS.accentCyan, width: 1, alpha: 0.03 + j * 0.008 });
    }
    root.addChild(grid);

    // ── Velocity streaks — horizontal speed blur lines ───────────────────────
    const streaks = new Graphics();
    let seed2 = 0xab1234cd;
    const rnd2 = () => {
        seed2 = (seed2 * 1664525 + 1013904223) >>> 0;
        return seed2 / 0xffffffff;
    };
    for (let i = 0; i < 18; i++) {
        const sy = rnd2() * h;
        const sx = rnd2() * w * 0.6;
        const len = 18 + rnd2() * 55;
        const a = 0.04 + rnd2() * 0.08;
        streaks.moveTo(sx, sy);
        streaks.lineTo(sx + len, sy);
        streaks.stroke({ color: P_COLORS.accentCyan, width: rnd2() > 0.7 ? 1.5 : 1, alpha: a });
    }
    root.addChild(streaks);

    // ── Stars — varied size + brightness ─────────────────────────────────────
    const stars = new Graphics();
    let seed = 0x9e3779b9;
    const rnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 0xffffffff;
    };
    for (let i = 0; i < 90; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const bright = rnd() > 0.9;
        const big = rnd() > 0.94;
        const a = bright ? 0.35 + rnd() * 0.4 : 0.08 + rnd() * 0.22;
        const r = big ? 2 : rnd() > 0.75 ? 1.5 : 1;
        stars.circle(x, y, r);
        stars.fill({ color: bright ? 0xe8f4ff : 0xaaccff, alpha: a });
    }
    root.addChild(stars);

    // ── Upper vignette ────────────────────────────────────────────────────────
    const vign = new Graphics();
    vign.rect(0, 0, w, h * 0.08);
    vign.fill({ color: 0x000000, alpha: 0.22 });
    root.addChild(vign);

    const tick = (t: number): void => {
        const drift = Math.sin(t * 0.06) * 5;
        grid.alpha = 0.85 + Math.sin(t * 0.28) * 0.15;
        grid.position.set(drift * 0.18, drift * 0.08);
        streaks.alpha = 0.85 + Math.sin(t * 0.45 + 1.2) * 0.15;
        hglow.alpha = 0.75 + Math.sin(t * 0.6) * 0.25;
    };

    return { root, tick };
}

function buildStatusChip(
    label: string,
    value: string,
    w: number,
    h: number,
    accent: 'cyan' | 'gold' | 'purple',
    drawIcon?: (g: Graphics, cx: number, cy: number, s: number) => void,
): Container {
    const root = new Container();

    const accentColor = accent === 'gold'
        ? P_COLORS.accentGold
        : accent === 'purple'
        ? P_COLORS.accentPurple
        : P_COLORS.accentCyan;
    const accentSoft = accent === 'gold'
        ? P_COLORS.accentGoldSoft
        : accent === 'purple'
        ? P_COLORS.accentPurpleSoft
        : P_COLORS.accentCyanSoft;

    // ── Background: Kenney nine-slice if available at this width, else layered vector ──
    const chipTex = getVelocityUiTexture('button_secondary');
    const BS = PORTRAIT_TAB_BS;
    const canNineSlice = !!chipTex && w >= 116;

    if (canNineSlice) {
        const spr = new NineSliceSprite({
            texture: chipTex!,
            leftWidth: BS.L, rightWidth: BS.R,
            topHeight: BS.T, bottomHeight: BS.B,
            width: w, height: h,
        });
        spr.tint = accent === 'gold' ? 0xede6cc : accent === 'purple' ? 0xdccff0 : 0xcce4f0;
        spr.alpha = 0.90;
        root.addChild(spr);
    } else {
        // Outer body
        const g = new Graphics();
        g.roundRect(0, 0, w, h, P_RADIUS.chip);
        g.fill({ color: P_COLORS.bgPanel, alpha: 1 });
        g.stroke({ color: accentSoft, width: 1.5, alpha: 0.55 });
        root.addChild(g);
        // Inner highlight bevel — gives the chip physical lift
        const bevel = new Graphics();
        bevel.roundRect(2, 2, w - 4, Math.floor(h * 0.45), P_RADIUS.chip - 2);
        bevel.fill({ color: 0xffffff, alpha: P_OPACITY.chipBevel });
        root.addChild(bevel);
        // Bottom shadow strip
        const shadow = new Graphics();
        shadow.roundRect(2, h - 5, w - 4, 3, P_RADIUS.chip - 2);
        shadow.fill({ color: 0x000000, alpha: 0.18 });
        root.addChild(shadow);
    }

    // ── Accent indicator strip (top edge — 3px, with subtle glow) ─────────────
    const strip = new Graphics();
    strip.roundRect(6, 0, w - 12, 3, 1);
    strip.fill({ color: accentColor, alpha: 0.75 });
    root.addChild(strip);
    // Glow bloom under strip
    const stripGlow = new Graphics();
    stripGlow.roundRect(6, 0, w - 12, 6, 3);
    stripGlow.fill({ color: accentColor, alpha: 0.12 });
    root.addChild(stripGlow);

    // ── Icon — left of label (adds identity, breaks generic look) ─────────────
    const iconPad = 8;
    if (drawIcon) {
        const ig = new Graphics();
        drawIcon(ig, iconPad + 8, h / 2 + 4, 9);
        root.addChild(ig);
    }
    const textX = drawIcon ? iconPad + 20 : 10;

    // ── Label — 9px muted, clearly subordinate ─────────────────────────────────
    const lb = new Text({
        text: label.toUpperCase(),
        style: new TextStyle({
            fontFamily: FONT,
            fontSize: 9,
            fontWeight: '600',
            fill: P_COLORS.textMuted,
            letterSpacing: 1.2,
        }),
    });
    lb.position.set(textX, 6);
    root.addChild(lb);

    // ── Value — 17px bold in accent color — dominant visual target ─────────────
    const vt = new Text({
        text: value,
        style: new TextStyle({
            fontFamily: FONT,
            fontSize: 17,
            fontWeight: '800',
            fill: accentColor,
            dropShadow: { alpha: 0.55, blur: 3, color: 0x000000, distance: 1 },
        }),
    });
    vt.position.set(textX, h / 2 - 1);
    root.addChild(vt);

    return root;
}

// ── Chip icon draw helpers ─────────────────────────────────────────────────────

function drawChipSignal(g: Graphics, cx: number, cy: number, s: number): void {
    const ws = s * 0.18;
    const xs = [cx - s * 0.28, cx, cx + s * 0.28];
    const hs = [s * 0.30, s * 0.48, s * 0.60];
    xs.forEach((x, i) => {
        const hh = hs[i];
        g.roundRect(x - ws / 2, cy - hh / 2, ws, hh, 1);
        g.fill({ color: P_COLORS.accentCyan, alpha: 0.75 + i * 0.05 });
    });
}

function drawChipStar(g: Graphics, cx: number, cy: number, s: number): void {
    const n = 5;
    const ro = s * 0.48;
    const ri = s * 0.20;
    for (let i = 0; i < n * 2; i++) {
        const a = (i * Math.PI) / n - Math.PI / 2;
        const r = i % 2 === 0 ? ro : ri;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
    g.fill({ color: P_COLORS.accentGold, alpha: 0.85 });
}

function drawChipGem(g: Graphics, cx: number, cy: number, s: number): void {
    g.moveTo(cx, cy - s * 0.48);
    g.lineTo(cx + s * 0.36, cy - s * 0.08);
    g.lineTo(cx + s * 0.26, cy + s * 0.40);
    g.lineTo(cx - s * 0.26, cy + s * 0.40);
    g.lineTo(cx - s * 0.36, cy - s * 0.08);
    g.closePath();
    g.fill({ color: P_COLORS.accentPurple, alpha: 0.80 });
}

export type StatusStripProps = {
    cw: number;
    signalVal: string;
    bestVal: string;
    premiumVal: string;
    onProfile: () => void;
    onPremiumTap?: () => void;
};

function buildStatusStrip(p: StatusStripProps): { root: Container; signal: Text; best: Text; premium: Text } {
    const H = 52;
    const root = new Container();
    const gap = P_SPACE.s8;
    const side = 48;
    const chipCount = 3;
    const chipW = Math.floor((p.cw - side - gap * (chipCount + 1)) / chipCount);
    const wChip = Math.max(92, chipW);

    const av = new Container();
    const avBg = new Graphics();
    avBg.circle(side / 2, side / 2, side / 2 - 2);
    avBg.fill({ color: P_COLORS.bgPanel, alpha: 1 });
    avBg.stroke({ color: P_COLORS.strokeActive, width: 1.5, alpha: 0.45 });
    av.addChild(avBg);
    const avG = new Graphics();
    drawIconProfile(avG, side / 2, side / 2, P_ICON.strip);
    av.addChild(avG);
    pressable(av, p.onProfile);
    root.addChild(av);

    const x0 = side + gap;
    const c1 = buildStatusChip('SIGNAL', p.signalVal, wChip, H - 4, 'cyan', drawChipSignal);
    c1.position.set(x0, 2);
    root.addChild(c1);
    const c2 = buildStatusChip('BEST', p.bestVal, wChip, H - 4, 'gold', drawChipStar);
    c2.position.set(x0 + wChip + gap, 2);
    root.addChild(c2);
    const c3 = buildStatusChip('PREMIUM', p.premiumVal, wChip, H - 4, 'purple', drawChipGem);
    c3.position.set(x0 + (wChip + gap) * 2, 2);
    if (p.onPremiumTap) {
        c3.eventMode = 'static';
        c3.cursor = 'pointer';
        pressable(c3, p.onPremiumTap);
    }
    root.addChild(c3);

    return {
        root,
        signal: c1.children[c1.children.length - 1] as Text,
        best: c2.children[c2.children.length - 1] as Text,
        premium: c3.children[c3.children.length - 1] as Text,
    };
}

type FeaturedProps = {
    cw: number;
    cardH: number;
    title: string;
    subtitle: string;
    routesDone: number;
    routesTotal: number;
    rank: string;
    rewardStars: number;
    onFly: () => void;
};

function buildFeaturedMissionCard(p: FeaturedProps): {
    root: Container;
    anim: Pick<PortraitAnimHandles, 'heroGlow' | 'heroMotif' | 'rankGlow' | 'routeSweep' | 'rewardShimmer'>;
    flyCta: Container | null;
    routeBarW: number;
} {
    const root = new Container();
    const pad = P_SPACE.s16;
    const innerW = p.cw - pad * 2;

    // ── Drop shadow ─────────────────────────────────────────────────────────
    const shadow = new Graphics();
    shadow.roundRect(6, 8, p.cw, p.cardH, P_RADIUS.panel);
    shadow.fill({ color: P_COLORS.shadowDeep, alpha: 0.6 });
    root.addChild(shadow);

    // ── Card body — layered surface ──────────────────────────────────────────
    const body = new Graphics();
    body.roundRect(0, 0, p.cw, p.cardH, P_RADIUS.panel);
    body.fill({ color: P_COLORS.bgPanel, alpha: 1 });
    body.stroke({ color: P_COLORS.strokeSubtle, width: 1, alpha: 0.9 });
    root.addChild(body);

    // ── Inner bevel highlight — top edge lift ────────────────────────────────
    const ibevel = new Graphics();
    ibevel.roundRect(2, 2, p.cw - 4, Math.floor(p.cardH * 0.35), P_RADIUS.panel - 2);
    ibevel.fill({ color: 0xffffff, alpha: 0.025 });
    root.addChild(ibevel);

    // ── Atmospheric speed streak motif (upper-right quadrant) ─────────────────
    const heroMotif = new Graphics();
    const mx = p.cw * 0.68;
    const my = p.cardH * 0.22;
    // Long diagonal streaks — perspective angle, varied opacity
    const streakData = [
        { dy: 0,  len: 80, a: 0.14 },
        { dy: 11, len: 60, a: 0.10 },
        { dy: 20, len: 90, a: 0.12 },
        { dy: 30, len: 45, a: 0.07 },
        { dy: 40, len: 70, a: 0.09 },
        { dy: 52, len: 35, a: 0.05 },
        { dy: 62, len: 55, a: 0.08 },
    ];
    streakData.forEach(({ dy, len, a }) => {
        heroMotif.moveTo(mx, my + dy);
        heroMotif.lineTo(mx + len, my + dy - len * 0.06);
        heroMotif.stroke({ color: P_COLORS.accentCyan, width: 1, alpha: a });
    });
    root.addChild(heroMotif);

    // ── Chevron intake motif — fighter-jet identity mark ────────────────────
    const chevron = new Graphics();
    const chx = p.cw - 28;
    const chy = 14;
    [[0, 0], [8, 6], [0, 12]].forEach(([dx, dy], i) => {
        const x1 = chx - dx;
        const y1 = chy + dy;
        const x2 = chx - dx + 14;
        const y2 = chy + dy;
        chevron.moveTo(x1, y1);
        chevron.lineTo(x2, y2);
        chevron.stroke({ color: P_COLORS.accentGold, width: 1.5, alpha: 0.12 + i * 0.04 });
    });
    root.addChild(chevron);

    // ── Hero glow ring (animated) ────────────────────────────────────────────
    const heroGlow = new Graphics();
    heroGlow.roundRect(1, 1, p.cw - 2, p.cardH - 2, P_RADIUS.panel - 1);
    heroGlow.stroke({ color: P_COLORS.accentCyan, width: 2.5, alpha: 0.18 });
    root.addChild(heroGlow);

    const title = new Text({
        text: p.title,
        style: new TextStyle({
            fontFamily: FONT,
            fontSize: P_TYPO.heroTitle.fontSize,
            fontWeight: P_TYPO.heroTitle.fontWeight,
            fill: P_COLORS.textPrimary,
            letterSpacing: P_TYPO.heroTitle.letterSpacing,
            dropShadow: { alpha: 0.7, blur: 6, color: P_COLORS.accentCyan, distance: 0 },
            stroke: { color: 0x000000, width: 1 },
        }),
    });
    title.position.set(pad, pad);
    root.addChild(title);

    const sub = new Text({
        text: p.subtitle,
        style: new TextStyle({
            fontFamily: FONT,
            fontSize: P_TYPO.heroSubtitle.fontSize,
            fontWeight: P_TYPO.heroSubtitle.fontWeight,
            fill: P_COLORS.accentCyanSoft,
            letterSpacing: P_TYPO.heroSubtitle.letterSpacing,
        }),
    });
    sub.position.set(pad, pad + 38);
    root.addChild(sub);

    const routeY = pad + 62;
    const lbl = new Text({
        text: `Routes  ${p.routesDone} / ${p.routesTotal}`,
        style: ts(P_TYPO.meta, P_COLORS.textMuted),
    });
    lbl.position.set(pad, routeY);
    root.addChild(lbl);

    const barW = Math.min(innerW - 100, p.cw * 0.55);
    const barH = 12;
    const prog = p.routesTotal > 0 ? p.routesDone / p.routesTotal : 0;
    const kBar = kenneyProgressBar(barW, barH);
    if (kBar) {
        kBar.position.set(pad, routeY + 18);
        kBar.setProgress(prog);
        root.addChild(kBar);
    } else {
        const tr = new Graphics();
        tr.roundRect(pad, routeY + 18, barW, barH, 6);
        tr.fill({ color: P_COLORS.bgBase, alpha: 1 });
        tr.stroke({ color: P_COLORS.strokeSubtle, width: 1, alpha: 0.8 });
        root.addChild(tr);
        const fl = new Graphics();
        fl.roundRect(pad + 2, routeY + 20, Math.max(6, (barW - 4) * prog), barH - 4, 4);
        fl.fill({ color: P_COLORS.accentCyan, alpha: 0.9 });
        root.addChild(fl);
    }

    const routeSweep = new Graphics();
    routeSweep.position.set(pad, routeY + 18);
    root.addChild(routeSweep);

    const emblemR = 28;
    const ex = p.cw - pad - emblemR;
    const ey = pad + 28;
    const eg = new Graphics();
    // Outer ambient ring
    eg.circle(ex, ey, emblemR + 4);
    eg.fill({ color: P_COLORS.accentGold, alpha: 0.04 });
    // Middle ring
    eg.circle(ex, ey, emblemR);
    eg.stroke({ color: P_COLORS.accentGold, width: 1.5, alpha: 0.45 });
    // Inner ring
    eg.circle(ex, ey, emblemR - 7);
    eg.stroke({ color: P_COLORS.accentGoldSoft, width: 1, alpha: 0.30 });
    // Icon
    drawIconRouteNode(eg, ex, ey, emblemR * 0.45, { color: P_COLORS.accentGold, width: 2, alpha: 0.85 });
    root.addChild(eg);

    const rewardShimmer = new Graphics();
    rewardShimmer.position.set(ex - emblemR, ey - emblemR);
    root.addChild(rewardShimmer);

    const rowY = p.cardH - pad - 48;
    const chipH = 44;
    const rowInner = p.cw - pad * 2;
    // FLY NOW gets 46% of row — dominant primary action
    let flyW = Math.min(180, Math.max(120, Math.floor(rowInner * 0.46)));
    let rankW = rowInner - flyW - P_SPACE.s8;
    if (rankW < 140) {
        rankW = 140;
        flyW = Math.max(100, rowInner - rankW - P_SPACE.s8);
    }
    rankW = Math.min(rankW, rowInner - flyW - P_SPACE.s8);

    const rankRoot = new Container();
    // Body
    const rb = new Graphics();
    rb.roundRect(0, 0, rankW, chipH, P_RADIUS.chip);
    rb.fill({ color: P_COLORS.bgPanel, alpha: 1 });
    rb.stroke({ color: P_COLORS.strokeGold, width: 1.5, alpha: 0.50 });
    rankRoot.addChild(rb);
    // Inner highlight bevel
    const rbevel = new Graphics();
    rbevel.roundRect(2, 2, rankW - 4, Math.floor(chipH * 0.42), P_RADIUS.chip - 2);
    rbevel.fill({ color: 0xffffff, alpha: P_OPACITY.chipBevel });
    rankRoot.addChild(rbevel);
    // Gold top accent strip
    const rankStrip = new Graphics();
    rankStrip.roundRect(6, 0, rankW - 12, 3, 1);
    rankStrip.fill({ color: P_COLORS.accentGold, alpha: 0.6 });
    rankRoot.addChild(rankStrip);
    // Glow overlay (animated)
    const rankGlow = new Graphics();
    rankGlow.roundRect(0, 0, rankW, chipH, P_RADIUS.chip);
    rankGlow.stroke({ color: P_COLORS.accentGold, width: 2, alpha: 0.28 });
    rankRoot.addChild(rankGlow);
    // Wing icon
    const wingX = 14;
    const textPad = 34;
    const wg = new Graphics();
    drawIconWing(wg, wingX, chipH / 2, 12);
    rankRoot.addChild(wg);
    const rt = new Text({
        text: trunc(`CLASS: ${p.rank.toUpperCase()}`, Math.max(10, Math.floor((rankW - textPad - 8) / 7))),
        style: ts(P_TYPO.chip, P_COLORS.accentGold),
    });
    rt.position.set(textPad, Math.floor((chipH - 13) / 2));
    rankRoot.addChild(rt);
    rankRoot.position.set(pad, rowY);
    root.addChild(rankRoot);

    const starLbl = new Text({
        text: `${p.rewardStars}★ route bonus`,
        style: ts(P_TYPO.label, P_COLORS.accentGold),
    });
    starLbl.position.set(pad, rowY - 20);
    root.addChild(starLbl);

        // Gold accent — structurally unique warm tone in the card composition
        const fly =
            kenneyButton('FLY NOW', flyW, 44, 'button_accent', false, p.onFly) ?? buildFallbackFly(flyW, 44, p.onFly);
    fly.label = 'heroFlyCta';
    fly.position.set(p.cw - pad - flyW, rowY);
    root.addChild(fly);

    return {
        root,
        anim: { heroGlow, heroMotif, rankGlow, routeSweep, rewardShimmer },
        flyCta: fly,
        routeBarW: barW,
    };
}

function buildFallbackFly(w: number, h: number, onFly: () => void): Container {
    const c = new Container();
    const g = new Graphics();
    g.roundRect(0, 0, w, h, P_RADIUS.button);
    g.fill({ color: P_COLORS.accentCyan, alpha: 1 });
    g.stroke({ color: P_COLORS.textPrimary, width: 1, alpha: 0.12 });
    c.addChild(g);
    const t = new Text({ text: 'FLY NOW', style: ts(P_TYPO.button, P_COLORS.statePressed) });
    t.anchor.set(0.5);
    t.position.set(w / 2, h / 2);
    c.addChild(t);
    pressable(c, onFly);
    return c;
}

const TAB_LABELS       = ['Missions', 'Routes', 'Training', 'Fleet', 'Events'] as const;
/** Short versions used when tabW < 88 — same read, less ink */
const TAB_LABELS_SHORT = ['MISS.', 'ROUTE', 'TRAIN', 'FLEET', 'EVNT'] as const;

function buildSegmentTabs(
    cw: number,
    onSelect: (i: number) => void,
): { root: Container; setActive: (i: number) => void; tabGlows: Graphics[] } {
    const H = 50;
    const root = new Container();

    // Track background — vector only (panel fill would also corrupt at this width)
    const track = new Graphics();
    track.roundRect(0, 0, cw, H, P_RADIUS.chip);
    track.fill({ color: P_COLORS.bgBase, alpha: 1 });
    track.stroke({ color: P_COLORS.strokeSubtle, width: 1, alpha: 0.6 });
    root.addChild(track);

    const n = TAB_LABELS.length;
    const pad = P_SPACE.s6;
    const tabW = Math.floor((cw - pad * 2) / n);
    const innerW = tabW - 4;
    const innerH = H - 12;

    // Kenney nine-slice safe ONLY when innerW ≥ 116 (56+56 corner budget)
    const useK9 = innerW >= 116 &&
        !!getVelocityUiTexture('button_primary') &&
        !!getVelocityUiTexture('button_secondary');

    // Abbreviated labels when tabs are narrow
    const useShort = tabW < 88;
    const labels = useShort ? TAB_LABELS_SHORT : TAB_LABELS;
    // Font size: scale down when using short labels to guarantee fit
    const tabFontSize = useShort ? 9 : 10;

    const tabGlows: Graphics[] = [];
    const buttons: Container[] = [];

    for (let i = 0; i < n; i++) {
        const b = new Container();
        b.position.set(pad + i * tabW, 6);

        // Glow stroke (inactive = transparent, active = visible)
        const glow = new Graphics();
        tabGlows.push(glow);
        b.addChild(glow);

        // Background — nine-slice if safe, otherwise vector Graphics
        let bg: NineSliceSprite | Graphics;
        if (useK9) {
            const spr = new NineSliceSprite({
                texture: getVelocityUiTexture('button_secondary')!,
                leftWidth: PORTRAIT_TAB_BS.L,
                rightWidth: PORTRAIT_TAB_BS.R,
                topHeight: PORTRAIT_TAB_BS.T,
                bottomHeight: PORTRAIT_TAB_BS.B,
                width: innerW,
                height: innerH,
            });
            spr.alpha = 0.82;
            spr.tint = 0xd8e4f2;
            b.addChild(spr);
            bg = spr;
        } else {
            const gr = new Graphics();
            gr.roundRect(0, 0, innerW, innerH, 8);
            gr.fill({ color: P_COLORS.bgPanel, alpha: 1 });
            gr.stroke({ color: P_COLORS.strokeSubtle, width: 1, alpha: 0.5 });
            b.addChild(gr);
            bg = gr;
        }

        const t = new Text({
            text: labels[i].toUpperCase(),
            style: new TextStyle({
                fontFamily: FONT,
                fontSize: tabFontSize,
                fontWeight: '700',
                fill: P_COLORS.textSecondary,
                letterSpacing: useShort ? 0.5 : 0.8,
                align: 'center',
            }),
        });
        t.anchor.set(0.5);
        t.position.set(innerW / 2, innerH / 2);
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
            const on = i === active;

            // Glow ring for active tab
            const gw = tabGlows[i];
            gw.clear();
            if (on) {
                gw.roundRect(0, 0, innerW, innerH, 8);
                gw.stroke({ color: P_COLORS.accentCyan, width: 2, alpha: 0.65 });
                // Bottom indicator strip
                gw.roundRect(innerW * 0.2, innerH - 3, innerW * 0.6, 2, 1);
                gw.fill({ color: P_COLORS.accentCyan, alpha: 0.9 });
            }

            // Background surface
            const mid = b.children[1]; // glow=0, bg=1, text=2
            if (mid instanceof NineSliceSprite) {
                const k = on ? 'button_primary' : 'button_secondary';
                mid.texture = getVelocityUiTexture(k)!;
                mid.tint   = on ? 0xa8d8f8 : 0xd8e4f2;
                mid.alpha  = on ? 1.0 : 0.78;
            } else if (mid instanceof Graphics) {
                mid.clear();
                mid.roundRect(0, 0, innerW, innerH, 8);
                if (on) {
                    mid.fill({ color: P_COLORS.accentCyan, alpha: 0.18 });
                    mid.stroke({ color: P_COLORS.strokeActive, width: 1.5, alpha: 0.85 });
                } else {
                    mid.fill({ color: P_COLORS.bgPanel, alpha: 0.85 });
                    mid.stroke({ color: P_COLORS.strokeSubtle, width: 1, alpha: 0.4 });
                }
            }

            // Text
            const tx = b.children[2] as Text;
            tx.style = new TextStyle({
                fontFamily: FONT,
                fontSize: on ? tabFontSize + 1 : tabFontSize,
                fontWeight: on ? '800' : '600',
                fill: on ? P_COLORS.textPrimary : P_COLORS.textMuted,
                letterSpacing: useShort ? 0.5 : 0.8,
                align: 'center',
                dropShadow: on ? { alpha: 0.5, blur: 2, color: 0x000000, distance: 1 } : undefined,
            });
            tx.anchor.set(0.5);
            tx.position.set(innerW / 2, innerH / 2);
        });
    }

    paint(0);
    return { root, setActive: paint, tabGlows };
}

function buildMissionCardPortrait(
    level: LevelDefinition,
    cw: number,
    rowH: number,
    onPlay: (id: number) => void,
    maxUnlocked: number,
): Container {
    const root = new Container();
    const unlocked = isLevelUnlocked(level.id);
    const completed = unlocked && level.id < maxUnlocked;
    const claimable = unlocked && level.id === maxUnlocked;
    const elite = level.id >= 18;
    const primaryState: 'claimable' | 'playable' | 'locked' | 'elite_locked' =
        claimable ? 'claimable' : unlocked ? 'playable' : elite ? 'elite_locked' : 'locked';

    // ── Card surface — state-differentiated, not a uniform formula ──────────
    const g = new Graphics();
    g.roundRect(0, 0, cw, rowH, P_RADIUS.panel - 2);
    if (primaryState === 'claimable') {
        g.fill({ color: 0x17120d, alpha: 1 });
        g.stroke({ color: P_COLORS.accentGold, width: 1.5, alpha: 0.52 });
    } else if (unlocked) {
        g.fill({ color: P_COLORS.bgPanelActive, alpha: 1 });
        g.stroke({ color: P_COLORS.strokeActive, width: 1.5, alpha: 0.28 });
    } else if (elite) {
        // ELITE LOCKED: warm dark surface — premium, sealed, aspirational
        // Slightly warmer than regular locked — "this is something worth unlocking"
        g.fill({ color: 0x0e0c10, alpha: 1 });
        g.stroke({ color: P_COLORS.accentGoldSoft, width: 1, alpha: 0.38 });
    } else {
        // REGULAR LOCKED: cold dark surface — neutral, sealed
        g.fill({ color: P_COLORS.bgPanelLocked, alpha: P_OPACITY.lockedSurface });
        g.stroke({ color: P_COLORS.stateLocked, width: 1, alpha: P_OPACITY.lockedStroke });
    }
    root.addChild(g);

    // Inner bevel highlight
    const ridge = new Graphics();
    ridge.roundRect(2, 2, cw - 4, Math.floor(rowH * 0.4), P_RADIUS.panel - 4);
    ridge.fill({ color: 0xffffff, alpha: unlocked ? 0.02 : 0.01 });
    root.addChild(ridge);
    if (primaryState === 'claimable') {
        const topGold = new Graphics();
        topGold.roundRect(4, 0, cw - 8, 2, 1);
        topGold.fill({ color: P_COLORS.accentGold, alpha: 0.4 });
        root.addChild(topGold);
    }

    // ELITE LOCKED: faint gold ambient strip at top — premium designation
    if (!unlocked && elite) {
        const eliteGlow = new Graphics();
        eliteGlow.roundRect(4, 0, cw - 8, 2, 1);
        eliteGlow.fill({ color: P_COLORS.accentGold, alpha: 0.18 });
        root.addChild(eliteGlow);
    }

    // ── Left accent strip — state indicator bar, color-coded per state ────────
    const leftStrip = new Graphics();
    leftStrip.roundRect(0, 6, 3, rowH - 12, 1.5);
    if (unlocked) {
        const stripColor = elite ? P_COLORS.accentGold : completed ? P_COLORS.stateLive : P_COLORS.accentCyan;
        leftStrip.fill({ color: stripColor, alpha: 0.78 });
    } else if (elite) {
        // Elite locked: gold strip, reduced — "premium, not yet available"
        leftStrip.fill({ color: P_COLORS.accentGold, alpha: 0.30 });
    } else {
        // Regular locked: grey-blue, minimal
        leftStrip.fill({ color: P_COLORS.stateLocked, alpha: 0.28 });
    }
    root.addChild(leftStrip);

    const badge = new Graphics();
    const icX = 18 + P_ICON.emblem;
    const icY = rowH / 2;
    if (unlocked) {
        // ── UNLOCKED: double ring + ambient glow ────────────────────────────
        const glowColor = elite ? P_COLORS.accentGold : P_COLORS.accentCyan;
        badge.circle(icX, icY, P_ICON.emblem + 4);
        badge.fill({ color: glowColor, alpha: 0.05 });
        badge.circle(icX, icY, P_ICON.emblem);
        badge.fill({ color: P_COLORS.bgElevated, alpha: 1 });
        badge.circle(icX, icY, P_ICON.emblem);
        badge.stroke({ color: elite ? P_COLORS.accentGold : P_COLORS.accentCyanSoft, width: 2, alpha: 0.55 });
        badge.circle(icX, icY, P_ICON.emblem - 5);
        badge.stroke({ color: elite ? P_COLORS.accentGoldSoft : P_COLORS.accentCyanSoft, width: 1, alpha: 0.25 });
    } else if (elite) {
        // ── ELITE LOCKED: gold-tinted sealed badge — premium, aspirational ──
        badge.circle(icX, icY, P_ICON.emblem + 3);
        badge.fill({ color: P_COLORS.accentGold, alpha: 0.04 });
        badge.circle(icX, icY, P_ICON.emblem);
        badge.fill({ color: 0x0a0908, alpha: 1 }); // warm-dark fill
        badge.circle(icX, icY, P_ICON.emblem);
        badge.stroke({ color: P_COLORS.accentGoldSoft, width: 1.5, alpha: 0.50 });
        badge.circle(icX, icY, P_ICON.emblem - 6);
        badge.stroke({ color: P_COLORS.accentGoldSoft, width: 1, alpha: 0.18 });
    } else {
        // ── REGULAR LOCKED: cold sealed badge ─────────────────────────────
        badge.circle(icX, icY, P_ICON.emblem);
        badge.fill({ color: P_COLORS.bgBase, alpha: 1 });
        badge.circle(icX, icY, P_ICON.emblem);
        badge.stroke({ color: P_COLORS.stateLocked, width: 1, alpha: 0.42 });
        // Subtle concentric inner ring — "sealed" layering
        badge.circle(icX, icY, P_ICON.emblem - 6);
        badge.stroke({ color: P_COLORS.stateLocked, width: 1, alpha: 0.15 });
    }
    root.addChild(badge);

    const ic = new Graphics();
    if (unlocked) {
        // Route node icon for playable missions
        const iconColor = elite ? P_COLORS.accentGold : P_COLORS.accentCyan;
        drawIconRouteNode(ic, icX, icY, 10, { color: iconColor, width: 2, alpha: 0.90 });
    } else if (elite) {
        // Elite locked: gold lock — visually distinct from regular
        drawIconLock(ic, icX, icY, 14, { color: P_COLORS.accentGold, width: 1.5, alpha: 0.55 });
    } else {
        // Regular locked: muted grey lock — clearly unavailable
        drawIconLock(ic, icX, icY, 14, { color: P_COLORS.stateLocked, width: 1.5, alpha: 0.60 });
    }
    root.addChild(ic);

    const btnW = 104;
    const btnH = 44;
    const tx = icX + P_ICON.emblem + P_SPACE.s12;
    // Removed the unexplained 56px surplus — title now gets full available width
    const tw = Math.max(40, cw - tx - btnW - P_SPACE.s16 - 8);

    // Title — state-specific contrast:
    // unlocked: primary white; elite-locked: warm gold-tint grey (aspirational); regular-locked: muted
    const titleColor = unlocked
        ? P_COLORS.textPrimary
        : elite
        ? 0x9a8870   // warm-muted — "premium but withheld"
        : 0x6a7280;  // cold-muted — "sealed, not for you yet"
    const title = new Text({
        // Chars per pixel: 7.5 is accurate for Kenney Future at missionTitle size
        text: trunc(level.name, Math.max(10, Math.floor(tw / 7.5))),
        style: ts(P_TYPO.missionTitle, titleColor),
    });
    title.position.set(tx, P_SPACE.s8);
    root.addChild(title);

    const hint = level.learningObjectives[0]?.hint ?? `${level.gateCount} voice gates`;
    const subColor = unlocked ? P_COLORS.textMuted : 0x454e58;
    const sub = new Text({
        text: trunc(hint, Math.max(14, Math.floor(tw / 6))),
        style: ts(P_TYPO.missionBody, subColor),
    });
    sub.position.set(tx, P_SPACE.s8 + 20);
    root.addChild(sub);

    // ── State metadata badge — one clear non-competing message ───────────────
    // STATE PRIORITY (subordinate metadata only, locked button handles primary state):
    //   ELITE > COMPLETED > AVAILABLE/REWARD > (nothing for basic locked)
    // For locked cards: elite badge IS shown (aspirational value signal), nothing else.
    // For unlocked cards: show completion or reward status.
    let metaStr = '';
    let metaColor = P_COLORS.accentCyanSoft;
    if (primaryState === 'claimable') {
        metaStr = 'READY TO CLAIM';
        metaColor = P_COLORS.accentGold;
    } else if (elite && unlocked && completed) {
        metaStr = '★ ELITE  ✓';
        metaColor = P_COLORS.accentGold;
    } else if (elite) {
        metaStr = '★ ELITE';
        metaColor = P_COLORS.accentGold;
    } else if (completed) {
        metaStr = '✓ CLEARED';
        metaColor = P_COLORS.stateLive;
    } else if (unlocked && !completed) {
        // Only show REWARD hint if newly unlocked (not elite, not completed)
        metaStr = '⬡ REWARD';
        metaColor = P_COLORS.accentCyanSoft;
    }
    // Locked non-elite: no badge — locked button is the sole state communicator

    if (metaStr) {
        const meta = new Text({
            text: metaStr,
            style: new TextStyle({
                fontFamily: FONT,
                fontSize: 9,
                fontWeight: '700',
                fill: metaColor,
                letterSpacing: 0.8,
            }),
        });
        meta.position.set(tx, P_SPACE.s8 + 21 + 14);
        root.addChild(meta);
    }

    const rewardRail = new Graphics();
    rewardRail.roundRect(tx - 4, rowH - 20, Math.max(120, tw - 8), 14, 6);
    rewardRail.fill({ color: primaryState === 'claimable' ? 0x231b0f : 0x0a121d, alpha: 0.72 });
    rewardRail.stroke({ color: primaryState === 'claimable' ? P_COLORS.accentGoldSoft : P_COLORS.strokeSubtle, width: 1, alpha: 0.4 });
    root.addChild(rewardRail);
    const rewardText = new Text({
        text: primaryState === 'elite_locked'
            ? `SEALED CACHE +${Math.max(140, level.gateCount * 24)}`
            : `REWARD +${Math.max(90, level.gateCount * 18)} SIGNAL`,
        style: ts(P_TYPO.navLabel, primaryState === 'claimable' ? P_COLORS.accentGold : P_COLORS.accentCyanSoft),
    });
    rewardText.position.set(tx + 6, rowH - 18);
    root.addChild(rewardText);

    const bx = cw - btnW - P_SPACE.s10;
    const by = (rowH - btnH) / 2;
    const actionDock = new Graphics();
    actionDock.roundRect(bx - 8, 8, btnW + 14, rowH - 16, 10);
    actionDock.fill({ color: unlocked ? 0x0a121d : 0x090f17, alpha: unlocked ? 0.45 : 0.6 });
    actionDock.stroke({
        color: primaryState === 'claimable' ? P_COLORS.accentGold : unlocked ? P_COLORS.accentCyan : P_COLORS.stateLocked,
        width: 1,
        alpha: 0.34,
    });
    root.addChild(actionDock);

    if (unlocked) {
        const btn =
            kenneyButton(primaryState === 'claimable' ? 'CLAIM' : 'PLAY', btnW, btnH, 'button_accent', true, () => onPlay(level.id)) ??
            buildPlayFallback(btnW, btnH, primaryState === 'claimable' ? 'CLAIM' : 'PLAY', () => onPlay(level.id));
        btn.position.set(bx, by);
        root.addChild(btn);
    } else {
        const lock = buildLockedButton(btnW, btnH, elite);
        lock.position.set(bx, by);
        root.addChild(lock);
    }

    return root;
}

function buildPlayFallback(w: number, h: number, label: 'PLAY' | 'CLAIM', onPlay: () => void): Container {
    const c = new Container();
    const g = new Graphics();
    g.roundRect(0, 0, w, h, P_RADIUS.button);
    g.fill({ color: P_COLORS.accentGold, alpha: 1 });
    g.stroke({ color: 0x1a1408, width: 1, alpha: 0.35 });
    c.addChild(g);
    const t = new Text({ text: label, style: ts(P_TYPO.button, 0x1a1204) });
    t.anchor.set(0.5);
    t.position.set(w / 2, h / 2);
    c.addChild(t);
    pressable(c, onPlay);
    return c;
}

function buildLockedButton(w: number, h: number, elite: boolean): Container {
    const c = new Container();
    c.eventMode = 'none';

    // ── Body: sealed surface — darker + muted border ─────────────────────────
    const g = new Graphics();
    g.roundRect(0, 0, w, h, P_RADIUS.button);
    g.fill({ color: P_COLORS.bgBase, alpha: 1 });
    g.stroke({ color: elite ? P_COLORS.accentGoldSoft : P_COLORS.stateLocked, width: 1.5, alpha: elite ? 0.5 : 0.38 });
    c.addChild(g);

    // ── Inner frame — dimensional depth ─────────────────────────────────────
    const inner = new Graphics();
    inner.roundRect(2, 2, w - 4, h - 4, P_RADIUS.button - 2);
    inner.stroke({ color: elite ? P_COLORS.accentGoldSoft : P_COLORS.stateLocked, width: 1, alpha: 0.12 });
    c.addChild(inner);

    // ── Diagonal hatch — hazard zone game convention ─────────────────────────
    const hatch = new Graphics();
    const stride = 9;
    for (let k = -h; k < w + h; k += stride) {
        const x1 = Math.max(0, k);
        const y1 = k < 0 ? -k : 0;
        const x2 = Math.min(w, k + h);
        const y2 = k + h > h ? h : k + h - Math.max(0, k);
        hatch.moveTo(x1, y1);
        hatch.lineTo(x2, y2);
    }
    hatch.stroke({ color: P_COLORS.stateLocked, width: 1, alpha: 0.07 });
    c.addChild(hatch);

    // ── Lock icon — CENTERED at top 38% of button height ─────────────────────
    // Vertical stack: icon top / label bottom — NO side-by-side layout that overflows
    const lockG = new Graphics();
    drawIconLock(lockG, w / 2, Math.floor(h * 0.36), 10,
        { color: elite ? P_COLORS.accentGold : P_COLORS.stateLocked, width: 1.5, alpha: elite ? 0.68 : 0.60 });
    c.addChild(lockG);

    // ── "LOCKED" — SINGLE dominant state, anchor(0.5, 0.5) at bottom of button
    // Centered horizontally: no truncation possible at any button width ≥ 60px
    const t = new Text({
        text: elite ? 'SEALED' : 'LOCKED',
        style: new TextStyle({
            fontFamily: FONT,
            fontSize: 9,
            fontWeight: '700',
            fill: elite ? P_COLORS.accentGoldSoft : P_COLORS.stateLocked,
            letterSpacing: 2.0,
        }),
    });
    t.anchor.set(0.5, 0.5);
    t.position.set(w / 2, Math.floor(h * 0.70));
    c.addChild(t);
    const sub = new Text({
        text: elite ? 'PREMIUM ROUTE' : 'COMPLETE PREV',
        style: new TextStyle({
            fontFamily: FONT,
            fontSize: 7,
            fontWeight: '600',
            fill: elite ? 0x7d6440 : 0x596675,
            letterSpacing: 0.6,
        }),
    });
    sub.anchor.set(0.5, 0.5);
    sub.position.set(w / 2, Math.floor(h * 0.86));
    c.addChild(sub);

    // ── NO helper text inside the button ─────────────────────────────────────
    // "COMPLETE PREV." caused state collision and truncation.
    // State hierarchy: ONE dominant label per badge zone.
    return c;
}

function buildMissionListPortrait(
    cw: number,
    listH: number,
    onPlayLevel: (id: number) => void,
    getProgress: () => ReturnType<typeof getMainMenuProgress>,
): {
    root: Container;
    scrollLayer: Container;
    rebuild: (tab: number) => void;
    setScrollY: (y: number) => void;
    getScrollY: () => number;
    maxScroll: () => number;
    cardIdle: { root: Container; phase: number }[];
} {
    const root = new Container();
    const maskG = new Graphics();
    maskG.rect(0, 0, cw, listH);
    maskG.fill({ color: 0xffffff, alpha: 1 });
    root.addChild(maskG);
    const scrollLayer = new Container();
    scrollLayer.mask = maskG;
    root.addChild(scrollLayer);

    let scrollY = 0;
    const rowH = 104;
    const gap = P_SPACE.s8;
    const cardIdle: { root: Container; phase: number }[] = [];

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
        cardIdle.length = 0;
        const levels = filterLevels(tab);
        const prog = getProgress();
        levels.forEach((lv, i) => {
            const row = buildMissionCardPortrait(lv, cw, rowH, onPlayLevel, prog.maxUnlocked);
            row.position.set(0, i * (rowH + gap));
            scrollLayer.addChild(row);
            cardIdle.push({ root: row, phase: i * 0.4 });
        });
        setScrollY(0);
    }

    rebuild(0);
    return { root, scrollLayer, rebuild, setScrollY, getScrollY: () => scrollY, maxScroll, cardIdle };
}

function buildBottomDockPortrait(
    cw: number,
    ui: GameUIManager,
    onHome: () => void,
    navIndexBySlot?: (slot: number) => void,
): { root: Container; setActive: (i: number) => void; dockCradles: Graphics[]; slotContainers: Container[] } {
    const H = 72;
    const root = new Container();

    // ── Dock background — Kenney chrome preferred, vector fallback ────────────
    const kenDock = kenneyDockBar(cw, H);
    if (kenDock) {
        root.addChild(kenDock);
    } else {
        const bg = new Graphics();
        bg.roundRect(0, 0, cw, H, P_RADIUS.dock);
        bg.fill({ color: P_COLORS.bgPanel, alpha: P_OPACITY.dockBg });
        bg.stroke({ color: P_COLORS.strokeSubtle, width: 1, alpha: 0.75 });
        root.addChild(bg);
    }
    // Top separator line
    const sep = new Graphics();
    sep.rect(12, 0, cw - 24, 1);
    sep.fill({ color: P_COLORS.accentCyan, alpha: 0.14 });
    root.addChild(sep);

    const items: {
        label: string;
        onTap: () => void;
        draw: (g: Graphics, cx: number, cy: number, s: number) => void;
    }[] = [
        { label: 'Home', onTap: () => { navIndexBySlot?.(0); onHome(); }, draw: (g, cx, cy, s) => drawIconHome(g, cx, cy, s) },
        {
            label: 'Missions',
            onTap: () => {
                navIndexBySlot?.(1);
                gameFlow().openMissionSelect();
            },
            draw: (g, cx, cy, s) => drawIconMap(g, cx, cy, s),
        },
        {
            label: 'Hangar',
            onTap: () => {
                navIndexBySlot?.(2);
                ui.showScreen('store', true);
            },
            draw: (g, cx, cy, s) => drawIconHangar(g, cx, cy, s),
        },
        {
            label: 'Store',
            onTap: () => {
                navIndexBySlot?.(3);
                ui.showScreen('store', true);
            },
            draw: (g, cx, cy, s) => drawIconStore(g, cx, cy, s),
        },
    ];

    const n = items.length;
    const slotW = cw / n;
    const dockCradles: Graphics[] = [];
    const slotContainers: Container[] = [];

    items.forEach((it, i) => {
        const slot = new Container();
        slot.position.set(i * slotW, 0);
        slot.eventMode = 'static';
        slot.cursor = 'pointer';

        const cx = slotW / 2;
        const cradle = new Graphics();
        cradle.roundRect(cx - 39, 7, 78, 58, 14);
        cradle.fill({ color: P_COLORS.bgBase, alpha: 0.35 });
        cradle.stroke({ color: P_COLORS.accentCyan, width: 1.5, alpha: 0 });
        dockCradles.push(cradle);
        slot.addChild(cradle);

        const vecG = new Graphics();
        it.draw(vecG, cx, 28, 21);
        slot.addChild(vecG);

        const t = new Text({ text: it.label, style: ts(P_TYPO.navLabel, P_COLORS.navInactive) });
        t.anchor.set(0.5, 0);
        t.position.set(cx, 49);
        slot.addChild(t);

        pressable(slot, it.onTap);
        root.addChild(slot);
        slotContainers.push(slot);
    });

    function setActive(i: number): void {
        const slotW = cw / items.length;
        dockCradles.forEach((cr, idx) => {
            const cx = slotW / 2;
            cr.clear();
            if (idx === i) {
                // Active: filled cradle + glow ring + top pip indicator
                cr.roundRect(cx - 37, 6, 74, 56, 14);
                cr.fill({ color: P_COLORS.bgPanelLit, alpha: 0.70 });
                cr.roundRect(cx - 37, 6, 74, 56, 14);
                cr.stroke({ color: P_COLORS.accentCyan, width: 1.5, alpha: 0.80 });
                // Top indicator pip
                cr.roundRect(cx - 14, 3, 28, 3, 1.5);
                cr.fill({ color: P_COLORS.navActivePill, alpha: 0.90 });
                // Ambient glow circle behind icon
                cr.circle(cx, 29, 22);
                cr.fill({ color: P_COLORS.accentCyan, alpha: P_OPACITY.activeGlow });
            } else {
                cr.roundRect(cx - 37, 6, 74, 56, 14);
                cr.fill({ color: P_COLORS.bgBase, alpha: 0.22 });
            }
        });
        slotContainers.forEach((ch, idx) => {
            const label = ch.children[2] as Text | undefined;
            if (label instanceof Text) {
                label.style = new TextStyle({
                    fontFamily: FONT,
                    fontSize: P_TYPO.navLabel.fontSize,
                    fontWeight: idx === i ? '800' : '600',
                    fill: idx === i ? P_COLORS.navActive : P_COLORS.navInactive,
                    letterSpacing: idx === i ? 0.8 : 0.3,
                });
            }
            ch.position.y = idx === i ? -2 : 0;
        });
    }
    setActive(0);
    return { root, setActive, dockCradles, slotContainers };
}

export type BuildPortraitMissionScreenParams = {
    layoutW: number;
    screenH: number;
    safeTop: number;
    safeBottom: number;
    ui: GameUIManager;
    getProgress: () => ReturnType<typeof getMainMenuProgress>;
    getRank: (maxUnlocked: number) => string;
    getBestScore: () => number;
    onFly: () => void;
};

/**
 * SECTION D — Full screen assembly
 */
export function buildPortraitMissionScreen(p: BuildPortraitMissionScreenParams): PortraitMissionBundle {
    const cw = p.layoutW;
    const sh = p.screenH;
    const prog = p.getProgress();
    const rank = p.getRank(prog.maxUnlocked);

    const root = new Container();
    root.sortableChildren = true;
    root.zIndex = P_Z.shell;

    const ambient = buildAmbientBackground(cw, sh);
    ambient.root.zIndex = P_Z.ambient;
    root.addChild(ambient.root);

    let y = p.safeTop + P_SPACE.s10;

    const strip = buildStatusStrip({
        cw,
        signalVal: `${prog.maxUnlocked}`,
        bestVal: String(p.getBestScore()),
        premiumVal: `${prog.unlockedCount}`,
        onProfile: () => p.ui.showScreen('settings', true),
        onPremiumTap: () => gameFlow().openAchievements?.(),
    });
    strip.root.position.set(0, y);
    root.addChild(strip.root);
    y += 60 + P_SPACE.s12;

    const cardH = Math.min(200, Math.max(168, Math.floor(sh * 0.26)));
    const feat = buildFeaturedMissionCard({
        cw,
        cardH,
        title: 'VELOCITY',
        subtitle: 'Voice-Powered Flight',
        routesDone: prog.unlockedCount,
        routesTotal: prog.totalLevels,
        rank,
        rewardStars: Math.min(3, Math.max(1, Math.ceil(prog.unlockedCount / 7))),
        onFly: p.onFly,
    });
    feat.root.position.set(0, y);
    root.addChild(feat.root);
    y += cardH + P_SPACE.s12;

    const tabsH = 50;
    const dockH = 72;
    const listH = Math.max(156, sh - y - tabsH - P_SPACE.s10 - dockH - p.safeBottom - P_SPACE.s16);

    const list = buildMissionListPortrait(cw, listH, (id) => gameFlow().startLevelWithMicGate?.(id), p.getProgress);

    const tabs = buildSegmentTabs(cw, (idx) => {
        list.rebuild(idx);
    });
    tabs.root.position.set(0, y);
    root.addChild(tabs.root);
    y += tabsH + P_SPACE.s10;

    list.root.position.set(0, y);
    root.addChild(list.root);

    let navApply: (i: number) => void = () => {};
    const dock = buildBottomDockPortrait(
        cw,
        p.ui,
        () => navApply(0),
        (slot) => navApply(slot),
    );
    navApply = dock.setActive;
    dock.root.position.set(0, sh - p.safeBottom - dockH - P_SPACE.s8);
    root.addChild(dock.root);

    const anim: PortraitAnimHandles = {
        ...feat.anim,
        tabGlows: tabs.tabGlows,
        dockCradles: dock.dockCradles,
        cardIdle: list.cardIdle,
    };

    const routeBarW = feat.routeBarW;

    const tick = (t: number): void => {
        ambient.tick(t);
        anim.heroGlow.alpha = 0.2 + Math.sin(t * 0.9) * 0.12;
        anim.rankGlow.alpha = 0.35 + Math.sin(t * 2.2) * 0.25;

        anim.routeSweep.clear();
        const sweepX = (Math.sin(t * 1.1) * 0.5 + 0.5) * Math.max(20, routeBarW - 10);
        anim.routeSweep.rect(sweepX, 0, 6, 12);
        anim.routeSweep.fill({ color: P_COLORS.accentCyan, alpha: 0.22 });

        anim.rewardShimmer.clear();
        const gl = (Math.sin(t * 1.8) * 0.5 + 0.5) * 36;
        anim.rewardShimmer.roundRect(gl, 0, 12, 52, 3);
        anim.rewardShimmer.fill({ color: P_COLORS.accentGold, alpha: 0.1 });

        anim.cardIdle.forEach((c) => {
            const wobble = Math.sin(t * 0.8 + c.phase) * 0.35;
            c.root.position.x = wobble;
        });
    };

    return {
        root,
        tick,
        rebuildList: list.rebuild,
        setTabActive: tabs.setActive,
        setNavActive: dock.setActive,
        setScrollY: list.setScrollY,
        getScrollY: list.getScrollY,
        maxScroll: list.maxScroll,
        topRefs: { signal: strip.signal, best: strip.best, premium: strip.premium },
        flyCta: feat.flyCta,
    };
}
