/**
 * SECTIONS C–F — Portrait mission console (PixiJS v8 + TypeScript)
 * Component architecture + full screen build + motion tick + state styling.
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
import { GAME_FONTS } from '../GameUITheme';
import { getMainMenuProgress, isLevelUnlocked } from '../../../data/localProgress';
import { LEVEL_DEFINITIONS, type LevelDefinition } from '../../../data/levelDefinitions';
import { gameFlow } from '../gameFlowBridge';
import type { GameUIManager } from '../GameUIManager';
import { getVelocityCustomTexture, getVelocityUiTexture } from '../velocityUiArt';
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';

const PORTRAIT_TAB_BS = VELOCITY_UI_SLICE.button;
import {
    kenneyButton,
    kenneyDockBar,
    kenneyHeroPanel,
    kenneyMissionCardFace,
    kenneyProgressBar,
} from '../menuLandscape/kenneyLandscapeWidgets';
import { mountHeroCommandLayout } from '../menuShared/heroCommandLayout';
import { buildCommandDock, type CommandDockPalette } from '../menuShared/commandDock';
import { buildModeFilterStrip } from '../menuShared/modeFilterStrip';
import {
    computeCardVerticalBands,
    fitBodyText,
    fitOneLineSmall,
    fitTitleText,
} from '../menuShared/missionCardLayout';
import { P_COLORS, P_ICON, P_OPACITY, P_RADIUS, P_SPACE, P_TYPO, P_Z } from './missionPortraitTokens';
import {
    drawIconHangar,
    drawIconHome,
    drawIconLock,
    drawIconLockOpen,
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
    const prestigeTex = getVelocityCustomTexture('rank_prestige');
    if (prestigeTex) {
        const em = new Sprite(prestigeTex);
        em.anchor.set(1, 0);
        em.width = 22;
        em.height = 22;
        em.position.set(wChip - 5, 5);
        em.alpha = 0.88;
        c2.addChild(em);
    }
    root.addChild(c2);
    const c3 = buildStatusChip('PREMIUM', p.premiumVal, wChip, H - 4, 'purple', drawChipGem);
    c3.position.set(x0 + (wChip + gap) * 2, 2);
    const eliteTex = getVelocityCustomTexture('rank_elite');
    if (eliteTex) {
        const em = new Sprite(eliteTex);
        em.anchor.set(1, 0);
        em.width = 22;
        em.height = 22;
        em.position.set(wChip - 5, 5);
        em.alpha = 0.88;
        c3.addChild(em);
    }
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

function portraitHeroIcoRadar(g: Graphics, cx: number, cy: number, r: number): void {
    g.circle(cx, cy, r);
    g.stroke({ color: P_COLORS.accentCyan, width: 2, alpha: 0.85 });
    g.circle(cx, cy, r * 0.55);
    g.stroke({ color: P_COLORS.accentCyan, width: 1.2, alpha: 0.4 });
    g.moveTo(cx, cy);
    g.lineTo(cx + r * 0.72, cy - r * 0.32);
    g.stroke({ color: P_COLORS.accentCyan, width: 1.5, alpha: 0.75 });
}

function portraitHeroGoldEmblem(g: Graphics, cx: number, cy: number, emblemR: number): void {
    g.circle(cx, cy, emblemR + 4);
    g.fill({ color: P_COLORS.accentGold, alpha: 0.04 });
    g.circle(cx, cy, emblemR);
    g.stroke({ color: P_COLORS.accentGold, width: 1.5, alpha: 0.45 });
    g.circle(cx, cy, emblemR - 7);
    g.stroke({ color: P_COLORS.accentGoldSoft, width: 1, alpha: 0.3 });
    drawIconRouteNode(g, cx, cy, emblemR * 0.45, { color: P_COLORS.accentGold, width: 2, alpha: 0.85 });
}

function buildFeaturedMissionCard(p: FeaturedProps): {
    root: Container;
    anim: Pick<PortraitAnimHandles, 'heroGlow' | 'heroMotif' | 'rankGlow' | 'routeSweep' | 'rewardShimmer'>;
    flyCta: Container | null;
    routeBarW: number;
} {
    const root = new Container();
    const pad = P_SPACE.s16;
    const pair = kenneyHeroPanel(p.cw, p.cardH);
    if (pair) {
        root.addChild(pair.root);
        const contentW = Math.max(260, p.cw - 44);
        const innerH = Math.max(110, p.cardH - 54);
        const progLite = { unlockedCount: p.routesDone, totalLevels: p.routesTotal };
        const cmd = mountHeroCommandLayout(
            pair.content,
            contentW,
            innerH,
            0,
            progLite,
            p.rank,
            p.onFly,
            {
                cyan: P_COLORS.accentCyan,
                muted: P_COLORS.textMuted,
                text: P_COLORS.textPrimary,
                border: P_COLORS.strokeSubtle,
                gold: P_COLORS.accentGold,
            },
            FONT,
            {
                trunc,
                textStyle: (size, weight, fill, letterSpacing = 0) =>
                    new TextStyle({
                        fontFamily: FONT,
                        fontSize: size,
                        fontWeight: weight,
                        fill,
                        letterSpacing,
                    }),
                icoRadar: portraitHeroIcoRadar,
                icoWing: (g, cx, cy, s) => drawIconWing(g, cx, cy, s),
                drawHeroEmblem: (g, cx, cy, radius) => portraitHeroGoldEmblem(g, cx, cy, radius),
                kenneyProgressBar,
                kenneyButton,
                fallbackPrimaryBtn: (w, h, _label, onClick) => buildFallbackFly(w, h, onClick),
            },
        );
        if (cmd.flyCta) cmd.flyCta.label = 'heroFlyCta';
        const starLbl = new Text({
            text: `${p.rewardStars}★ route bonus`,
            style: ts(P_TYPO.label, P_COLORS.accentGold),
        });
        starLbl.position.set(pad, Math.max(4, cmd.bottomRailY - 20));
        pair.content.addChild(starLbl);
        return {
            root,
            anim: {
                heroGlow: cmd.heroGlow,
                heroMotif: cmd.heroMotif,
                rankGlow: cmd.rankGlow,
                routeSweep: cmd.routeSweep,
                rewardShimmer: cmd.rewardShimmer,
            },
            flyCta: cmd.flyCta,
            routeBarW: cmd.routeBarW,
        };
    }

    // Vector fallback (textures missing)
    const innerW = p.cw - pad * 2;
    const shadow = new Graphics();
    shadow.roundRect(6, 8, p.cw, p.cardH, P_RADIUS.panel);
    shadow.fill({ color: P_COLORS.shadowDeep, alpha: 0.6 });
    root.addChild(shadow);
    const body = new Graphics();
    body.roundRect(0, 0, p.cw, p.cardH, P_RADIUS.panel);
    body.fill({ color: P_COLORS.bgPanel, alpha: 1 });
    body.stroke({ color: P_COLORS.strokeSubtle, width: 1, alpha: 0.9 });
    root.addChild(body);
    const ibevel = new Graphics();
    ibevel.roundRect(2, 2, p.cw - 4, Math.floor(p.cardH * 0.35), P_RADIUS.panel - 2);
    ibevel.fill({ color: 0xffffff, alpha: 0.025 });
    root.addChild(ibevel);
    const heroMotif = new Graphics();
    const mx = p.cw * 0.68;
    const my = p.cardH * 0.22;
    const streakData = [
        { dy: 0, len: 80, a: 0.14 },
        { dy: 11, len: 60, a: 0.1 },
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
    const prog01 = p.routesTotal > 0 ? p.routesDone / p.routesTotal : 0;
    const kBar = kenneyProgressBar(barW, barH);
    if (kBar) {
        kBar.position.set(pad, routeY + 18);
        kBar.setProgress(prog01);
        root.addChild(kBar);
    } else {
        const tr = new Graphics();
        tr.roundRect(pad, routeY + 18, barW, barH, 6);
        tr.fill({ color: P_COLORS.bgBase, alpha: 1 });
        tr.stroke({ color: P_COLORS.strokeSubtle, width: 1, alpha: 0.8 });
        root.addChild(tr);
        const fl = new Graphics();
        fl.roundRect(pad + 2, routeY + 20, Math.max(6, (barW - 4) * prog01), barH - 4, 4);
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
    portraitHeroGoldEmblem(eg, ex, ey, emblemR);
    root.addChild(eg);
    const rewardShimmer = new Graphics();
    rewardShimmer.position.set(ex - emblemR, ey - emblemR);
    root.addChild(rewardShimmer);
    const rowY = p.cardH - pad - 48;
    const chipH = 44;
    const rowInner = p.cw - pad * 2;
    let flyW = Math.min(180, Math.max(120, Math.floor(rowInner * 0.46)));
    let rankW = rowInner - flyW - P_SPACE.s8;
    if (rankW < 140) {
        rankW = 140;
        flyW = Math.max(100, rowInner - rankW - P_SPACE.s8);
    }
    rankW = Math.min(rankW, rowInner - flyW - P_SPACE.s8);
    const rankRoot = new Container();
    const rb = new Graphics();
    rb.roundRect(0, 0, rankW, chipH, P_RADIUS.chip);
    rb.fill({ color: P_COLORS.bgPanel, alpha: 1 });
    rb.stroke({ color: P_COLORS.strokeGold, width: 1.5, alpha: 0.5 });
    rankRoot.addChild(rb);
    const rbevel = new Graphics();
    rbevel.roundRect(2, 2, rankW - 4, Math.floor(chipH * 0.42), P_RADIUS.chip - 2);
    rbevel.fill({ color: 0xffffff, alpha: P_OPACITY.chipBevel });
    rankRoot.addChild(rbevel);
    const rankStrip = new Graphics();
    rankStrip.roundRect(6, 0, rankW - 12, 3, 1);
    rankStrip.fill({ color: P_COLORS.accentGold, alpha: 0.6 });
    rankRoot.addChild(rankStrip);
    const rankGlow = new Graphics();
    rankGlow.roundRect(0, 0, rankW, chipH, P_RADIUS.chip);
    rankGlow.stroke({ color: P_COLORS.accentGold, width: 2, alpha: 0.28 });
    rankRoot.addChild(rankGlow);
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
    const rankPrestige = getVelocityCustomTexture('rank_prestige');
    if (rankPrestige) {
        const rs = new Sprite(rankPrestige);
        rs.anchor.set(1, 0);
        rs.width = 26;
        rs.height = 26;
        rs.position.set(rankW - 6, 6);
        rs.alpha = 0.9;
        rankRoot.addChild(rs);
    }
    rankRoot.position.set(pad, rowY);
    root.addChild(rankRoot);
    const starLbl = new Text({
        text: `${p.rewardStars}★ route bonus`,
        style: ts(P_TYPO.label, P_COLORS.accentGold),
    });
    starLbl.position.set(pad, rowY - 20);
    root.addChild(starLbl);
    const fly = kenneyButton('FLY NOW', flyW, 44, 'button_accent', false, p.onFly) ?? buildFallbackFly(flyW, 44, p.onFly);
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

function buildSegmentTabs(
    cw: number,
    onSelect: (i: number) => void,
): { root: Container; setActive: (i: number) => void; tabGlows: Graphics[] } {
    const strip = buildModeFilterStrip(cw, 50, FONT, onSelect, {
        useKenneyTrack: true,
        channelGlow: true,
        vectorTrack: {
            fill: P_COLORS.bgBase,
            stroke: P_COLORS.strokeSubtle,
            strokeAlpha: 0.6,
            cornerRadius: P_RADIUS.chip,
        },
    });
    return { root: strip.root, setActive: strip.setActive, tabGlows: strip.tabGlows };
}

/** Locked / elite-locked — Kenney card face + banded typography (no floating Y positions). */
function buildLockedMissionCardPortrait(
    level: LevelDefinition,
    cw: number,
    rowH: number,
    primaryState: 'locked' | 'elite_locked',
    elite: boolean,
): Container {
    const root = new Container();
    const plaqueW = Math.min(118, Math.max(100, Math.floor(cw * 0.28)));
    const leftRailW = 6;
    const leftPad = 10;
    const emblemWellW = 48;
    const zoneAEnd = leftPad + emblemWellW + P_SPACE.s8;
    const centerW = Math.max(120, cw - zoneAEnd - plaqueW - P_SPACE.s12 - P_SPACE.s10);
    const tx = zoneAEnd;
    const rewardValue = Math.max(primaryState === 'elite_locked' ? 140 : 90, level.gateCount * (primaryState === 'elite_locked' ? 24 : 18));
    const faceRole = primaryState === 'elite_locked' ? 'elite_locked' : 'locked';
    const kFace = kenneyMissionCardFace(cw, rowH, faceRole);
    if (kFace) {
        root.addChild(kFace);
    } else {
        const face = new Graphics();
        face.roundRect(0, 0, cw, rowH, P_RADIUS.panel - 2);
        face.fill({ color: elite ? P_COLORS.lockedFaceElite : P_COLORS.lockedFace, alpha: 1 });
        face.stroke({
            color: elite ? P_COLORS.lockedPlaqueRimElite : P_COLORS.lockedPlaqueRim,
            width: 1.5,
            alpha: elite ? 0.45 : 0.38,
        });
        root.addChild(face);
    }

    const spine = new Graphics();
    spine.roundRect(0, 8, leftRailW, rowH - 16, 2);
    spine.fill({ color: elite ? P_COLORS.accentGoldSoft : P_COLORS.stateLocked, alpha: elite ? 0.55 : 0.4 });
    root.addChild(spine);

    const well = new Graphics();
    well.roundRect(leftPad, 10, emblemWellW, rowH - 20, 10);
    well.fill({ color: elite ? P_COLORS.lockedGateWellElite : P_COLORS.lockedGateWell, alpha: 1 });
    well.stroke({
        color: elite ? P_COLORS.accentGoldSoft : P_COLORS.lockedPlaqueRim,
        width: 1,
        alpha: elite ? 0.35 : 0.28,
    });
    root.addChild(well);

    const emX = leftPad + emblemWellW / 2;
    const emY = rowH / 2;
    const lockSeal = getVelocityCustomTexture('badge_locked');
    if (lockSeal) {
        const seal = new Sprite(lockSeal);
        seal.anchor.set(0.5);
        const sealS = Math.min(emblemWellW - 8, rowH - 36);
        seal.width = sealS;
        seal.height = sealS;
        seal.position.set(emX, emY);
        seal.alpha = elite ? 0.92 : 0.78;
        root.addChild(seal);
    } else {
        const ic = new Graphics();
        drawIconLock(ic, emX, emY, 16, {
            color: elite ? P_COLORS.accentGold : P_COLORS.stateLocked,
            width: 2,
            alpha: elite ? 0.65 : 0.55,
        });
        root.addChild(ic);
    }

    const bands = computeCardVerticalBands(rowH, tx, centerW, elite);
    const titleColor = elite ? 0xd4c4a8 : P_COLORS.textSecondary;
    const title = fitTitleText(level.name, centerW, 0, {
        fontFamily: FONT,
        fontWeight: '700',
        fill: titleColor,
        letterSpacing: 0.2,
    });
    title.position.set(tx, bands.titleY);
    root.addChild(title);

    if (elite) {
        const tierPlate = new Graphics();
        tierPlate.roundRect(tx, bands.tierY, Math.min(108, centerW - 4), bands.tierH, 6);
        tierPlate.fill({ color: P_COLORS.lockedPlaqueElite, alpha: 0.88 });
        tierPlate.stroke({ color: P_COLORS.accentGoldSoft, width: 1, alpha: 0.42 });
        root.addChild(tierPlate);
        const tier = fitOneLineSmall('ELITE ROUTE', centerW - 20, {
            fontFamily: FONT,
            fontWeight: '800',
            fill: P_COLORS.accentGold,
            letterSpacing: 1.0,
            fontSize: 9,
        });
        tier.position.set(tx + 8, bands.tierY + Math.max(1, (bands.tierH - tier.height) / 2));
        root.addChild(tier);
    }

    const teaser = level.learningObjectives[0]?.hint ?? `${level.gateCount} voice gates`;
    const sub = fitBodyText(teaser, centerW, bands.subMaxH, {
        fontFamily: FONT,
        fontWeight: '500',
        fill: 0x5a6574,
    });
    sub.position.set(tx, bands.subY);
    root.addChild(sub);

    let metaStr = '';
    let metaFill: number = P_COLORS.accentGold;
    if (primaryState === 'elite_locked') {
        metaStr = 'SEALED ROUTE';
        metaFill = P_COLORS.accentGold;
    } else {
        metaStr = 'GATED';
        metaFill = 0x7a8fa4;
    }
    const metaPlate = new Graphics();
    metaPlate.roundRect(tx, bands.metaY, Math.min(centerW - 4, 120), bands.metaH, 6);
    metaPlate.fill({ color: primaryState === 'elite_locked' ? 0x1a140c : 0x0a1218, alpha: 0.88 });
    metaPlate.stroke({ color: elite ? P_COLORS.accentGoldSoft : P_COLORS.lockedPlaqueRim, width: 1, alpha: 0.35 });
    root.addChild(metaPlate);
    const meta = fitOneLineSmall(metaStr, centerW - 16, {
        fontFamily: FONT,
        fontWeight: '800',
        fill: metaFill,
        letterSpacing: 0.9,
        fontSize: 9,
    });
    meta.position.set(tx + 8, bands.metaY + Math.max(1, (bands.metaH - meta.height) / 2));
    root.addChild(meta);

    const reqLine =
        primaryState === 'elite_locked'
            ? `Breach prior route ${Math.max(1, level.id - 1)} to open`
            : `Clear route ${Math.max(1, level.id - 1)} to gain access`;
    const helper = fitBodyText(reqLine, centerW, bands.helpH, {
        fontFamily: FONT,
        fontWeight: '600',
        fill: 0x4a5568,
        letterSpacing: 0.1,
    }, 9, 8);
    helper.position.set(tx, bands.helpY);
    root.addChild(helper);

    const rewardRail = new Graphics();
    rewardRail.roundRect(tx - 2, bands.rewardY, centerW + 4, bands.rewardH, 7);
    rewardRail.fill({ color: elite ? 0x120e0a : 0x060a10, alpha: 0.9 });
    rewardRail.stroke({
        color: elite ? P_COLORS.accentGoldSoft : P_COLORS.lockedPlaqueRim,
        width: 1,
        alpha: 0.32,
    });
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
    const rewardText = fitOneLineSmall(rewardStr, centerW - 28, {
        fontFamily: FONT,
        fontWeight: '700',
        fill: elite ? P_COLORS.accentGold : 0x6b7d90,
        letterSpacing: 0.4,
        fontSize: 9,
    });
    rewardText.position.set(tx + 20, bands.rewardY + Math.max(2, (bands.rewardH - rewardText.height) / 2));
    root.addChild(rewardText);

    const px = cw - plaqueW - P_SPACE.s10;
    const py = 10;
    const ph = rowH - 20;
    const plaqueTex = getVelocityCustomTexture('frame_locked');
    if (plaqueTex) {
        const ps = new Sprite(plaqueTex);
        ps.width = plaqueW;
        ps.height = ph;
        ps.position.set(px, py);
        ps.alpha = elite ? 0.55 : 0.42;
        root.addChild(ps);
    }
    const plaque = new Graphics();
    plaque.roundRect(px, py, plaqueW, ph, 12);
    plaque.fill({ color: elite ? P_COLORS.lockedPlaqueElite : P_COLORS.lockedPlaque, alpha: plaqueTex ? 0.72 : 0.96 });
    plaque.stroke({
        color: elite ? P_COLORS.accentGold : P_COLORS.lockedPlaqueRim,
        width: 2,
        alpha: elite ? 0.55 : 0.5,
    });
    root.addChild(plaque);
    const plaqueInner = new Graphics();
    plaqueInner.roundRect(px + 4, py + 4, plaqueW - 8, ph - 8, 9);
    plaqueInner.stroke({ color: 0xffffff, width: 1, alpha: elite ? 0.06 : 0.04 });
    root.addChild(plaqueInner);

    const stateWord = primaryState === 'elite_locked' ? 'SEALED' : 'LOCKED';
    const stateMain = new Text({
        text: stateWord,
        style: new TextStyle({
            fontFamily: FONT,
            fontSize: P_TYPO.lockedPlaqueState.fontSize,
            fontWeight: P_TYPO.lockedPlaqueState.fontWeight,
            fill: elite ? P_COLORS.accentGold : 0x8fa3b8,
            letterSpacing: P_TYPO.lockedPlaqueState.letterSpacing,
            align: 'center',
        }),
    });
    stateMain.anchor.set(0.5, 0);
    stateMain.position.set(px + plaqueW / 2, py + Math.floor(ph * 0.26));
    root.addChild(stateMain);

    const stateSub = new Text({
        text: elite ? 'ELITE GATE' : 'ACCESS',
        style: new TextStyle({
            fontFamily: FONT,
            fontSize: P_TYPO.lockedPlaqueSub.fontSize,
            fontWeight: P_TYPO.lockedPlaqueSub.fontWeight,
            fill: elite ? 0x7a6848 : 0x4d5a6a,
            letterSpacing: P_TYPO.lockedPlaqueSub.letterSpacing,
            align: 'center',
        }),
    });
    stateSub.anchor.set(0.5, 0);
    stateSub.position.set(px + plaqueW / 2, py + Math.floor(ph * 0.52));
    root.addChild(stateSub);

    const rivetA = new Graphics();
    rivetA.circle(px + 10, py + 12, 2);
    rivetA.fill({ color: P_COLORS.dockBolt, alpha: 0.5 });
    root.addChild(rivetA);
    const rivetB = new Graphics();
    rivetB.circle(px + plaqueW - 10, py + ph - 12, 2);
    rivetB.fill({ color: P_COLORS.dockBolt, alpha: 0.5 });
    root.addChild(rivetB);

    return root;
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

    if (primaryState === 'locked' || primaryState === 'elite_locked') {
        return buildLockedMissionCardPortrait(level, cw, rowH, primaryState, elite);
    }

    const faceRole = primaryState === 'claimable' ? 'claimable' : 'playable';
    const kPlayFace = kenneyMissionCardFace(cw, rowH, faceRole);
    if (kPlayFace) {
        root.addChild(kPlayFace);
    } else {
        const g = new Graphics();
        g.roundRect(0, 0, cw, rowH, P_RADIUS.panel - 2);
        if (primaryState === 'claimable') {
            g.fill({ color: 0x17120d, alpha: 1 });
            g.stroke({ color: P_COLORS.accentGold, width: 1.5, alpha: 0.52 });
        } else {
            g.fill({ color: P_COLORS.bgPanelActive, alpha: 1 });
            g.stroke({ color: P_COLORS.strokeActive, width: 1.5, alpha: 0.28 });
        }
        root.addChild(g);
    }
    if (primaryState === 'claimable') {
        const topGold = new Graphics();
        topGold.roundRect(4, 0, cw - 8, 2, 1);
        topGold.fill({ color: P_COLORS.accentGold, alpha: 0.4 });
        root.addChild(topGold);
    }

    const leftStrip = new Graphics();
    leftStrip.roundRect(0, 6, 3, rowH - 12, 1.5);
    const stripColor = elite ? P_COLORS.accentGold : completed ? P_COLORS.stateLive : P_COLORS.accentCyan;
    leftStrip.fill({ color: stripColor, alpha: 0.78 });
    root.addChild(leftStrip);

    const badge = new Graphics();
    const icX = 18 + P_ICON.emblem;
    const icY = rowH / 2;
    const glowColor = elite ? P_COLORS.accentGold : P_COLORS.accentCyan;
    badge.circle(icX, icY, P_ICON.emblem + 4);
    badge.fill({ color: glowColor, alpha: 0.05 });
    badge.circle(icX, icY, P_ICON.emblem);
    badge.fill({ color: P_COLORS.bgElevated, alpha: 1 });
    badge.circle(icX, icY, P_ICON.emblem);
    badge.stroke({ color: elite ? P_COLORS.accentGold : P_COLORS.accentCyanSoft, width: 2, alpha: 0.55 });
    badge.circle(icX, icY, P_ICON.emblem - 5);
    badge.stroke({ color: elite ? P_COLORS.accentGoldSoft : P_COLORS.accentCyanSoft, width: 1, alpha: 0.25 });
    root.addChild(badge);

    const ic = new Graphics();
    const iconColor = elite ? P_COLORS.accentGold : P_COLORS.accentCyan;
    drawIconRouteNode(ic, icX, icY, 10, { color: iconColor, width: 2, alpha: 0.90 });
    root.addChild(ic);

    const btnW = 104;
    const btnH = 44;
    const tx = icX + P_ICON.emblem + P_SPACE.s12;
    const tw = Math.max(40, cw - tx - btnW - P_SPACE.s16 - 8);
    const tagReserve = 56;
    const bands = computeCardVerticalBands(rowH, tx, tw, elite);

    const title = fitTitleText(level.name, tw, tagReserve, {
        fontFamily: FONT,
        fontWeight: '700',
        fill: P_COLORS.textPrimary,
        letterSpacing: 0.2,
    });
    title.position.set(tx, bands.titleY);
    root.addChild(title);

    const tagStr =
        level.id >= 16 ? 'EVENT' : level.id >= 11 ? 'FLEET' : level.id <= 5 ? 'TRAIN' : 'OPS';
    const tag = fitOneLineSmall(tagStr, tagReserve - 6, {
        fontFamily: FONT,
        fontWeight: '800',
        fill: P_COLORS.accentCyanSoft,
        letterSpacing: 0.5,
        fontSize: 8,
    });
    tag.anchor.set(1, 0);
    tag.position.set(tx + tw - 4, bands.titleY + 1);
    root.addChild(tag);

    const hint = level.learningObjectives[0]?.hint ?? `${level.gateCount} voice gates`;
    const sub = fitBodyText(hint, tw - 4, bands.subMaxH, {
        fontFamily: FONT,
        fontWeight: '500',
        fill: P_COLORS.textMuted,
    });
    sub.position.set(tx, bands.subY);
    root.addChild(sub);

    let metaStr = '';
    let metaColor: number = P_COLORS.accentCyanSoft;
    if (primaryState === 'claimable') {
        metaStr = 'READY TO CLAIM';
        metaColor = P_COLORS.accentGold;
    } else if (elite && unlocked && completed) {
        metaStr = 'ELITE ✓';
        metaColor = P_COLORS.accentGold;
    } else if (elite) {
        metaStr = 'ELITE';
        metaColor = P_COLORS.accentGold;
    } else if (completed) {
        metaStr = 'CLEARED';
        metaColor = P_COLORS.stateLive;
    } else if (unlocked && !completed) {
        metaStr = 'REWARD';
        metaColor = P_COLORS.accentCyanSoft;
    }

    if (metaStr) {
        const metaPlate = new Graphics();
        metaPlate.roundRect(tx, bands.metaY, Math.min(tw - 4, 130), bands.metaH, 6);
        metaPlate.fill({ color: primaryState === 'claimable' ? 0x22180d : 0x09131d, alpha: 0.8 });
        metaPlate.stroke({ color: primaryState === 'claimable' ? P_COLORS.accentGoldSoft : P_COLORS.strokeSubtle, width: 1, alpha: 0.35 });
        root.addChild(metaPlate);
        const meta = fitOneLineSmall(metaStr, tw - 20, {
            fontFamily: FONT,
            fontWeight: '800',
            fill: metaColor,
            letterSpacing: 0.6,
            fontSize: 9,
        });
        meta.position.set(tx + 8, bands.metaY + Math.max(1, (bands.metaH - meta.height) / 2));
        root.addChild(meta);
    }

    const helperStr = completed ? 'Replay for a better score' : 'Available now';
    const helper = fitBodyText(helperStr, tw, bands.helpH, {
        fontFamily: FONT,
        fontWeight: '600',
        fill: 0x6f8096,
        letterSpacing: 0.1,
    }, 9, 8);
    helper.position.set(tx, bands.helpY);
    root.addChild(helper);

    const rewardRail = new Graphics();
    rewardRail.roundRect(tx - 4, bands.rewardY, Math.max(120, tw - 4), bands.rewardH, 6);
    rewardRail.fill({ color: primaryState === 'claimable' ? 0x231b0f : 0x0a121d, alpha: 0.78 });
    rewardRail.stroke({
        color: primaryState === 'claimable' ? P_COLORS.accentGoldSoft : P_COLORS.strokeSubtle,
        width: 1,
        alpha: 0.4,
    });
    root.addChild(rewardRail);
    const rewardGem = new Graphics();
    rewardGem.circle(tx + 6, bands.rewardY + bands.rewardH / 2, 5);
    rewardGem.fill({
        color: primaryState === 'claimable' ? P_COLORS.accentGold : P_COLORS.accentCyanSoft,
        alpha: 0.88,
    });
    rewardGem.circle(tx + 6, bands.rewardY + bands.rewardH / 2, 8);
    rewardGem.stroke({
        color: primaryState === 'claimable' ? P_COLORS.accentGoldSoft : P_COLORS.strokeSubtle,
        width: 1,
        alpha: 0.42,
    });
    root.addChild(rewardGem);
    const rewardBadge = getVelocityCustomTexture('badge_reward');
    if (rewardBadge) {
        const rb = new Sprite(rewardBadge);
        rb.anchor.set(0.5);
        rb.width = 15;
        rb.height = 15;
        rb.position.set(tx + 6, bands.rewardY + bands.rewardH / 2);
        rb.alpha = 0.86;
        root.addChild(rb);
    }
    const rewardLine = `REWARD +${Math.max(90, level.gateCount * 18)} SIGNAL`;
    const rewardText = fitOneLineSmall(rewardLine, tw - 28, {
        fontFamily: FONT,
        fontWeight: '700',
        fill: primaryState === 'claimable' ? P_COLORS.accentGold : P_COLORS.accentCyanSoft,
        letterSpacing: 0.4,
        fontSize: 9,
    });
    rewardText.position.set(tx + 18, bands.rewardY + Math.max(2, (bands.rewardH - rewardText.height) / 2));
    root.addChild(rewardText);

    const bx = cw - btnW - P_SPACE.s10;
    const by = (rowH - btnH) / 2;
    const actionDock = new Graphics();
    actionDock.roundRect(bx - 8, 8, btnW + 14, rowH - 16, 10);
    actionDock.fill({ color: 0x0a121d, alpha: 0.45 });
    actionDock.stroke({
        color: primaryState === 'claimable' ? P_COLORS.accentGold : P_COLORS.accentCyan,
        width: 1,
        alpha: 0.34,
    });
    root.addChild(actionDock);
    const actionFrameTex = primaryState === 'claimable' ? getVelocityCustomTexture('frame_premium') : undefined;
    if (actionFrameTex) {
        const fr = new Sprite(actionFrameTex);
        fr.width = btnW + 18;
        fr.height = rowH - 10;
        fr.position.set(bx - 11, 5);
        fr.alpha = 0.7;
        root.addChild(fr);
    }
    const unlockSig = new Graphics();
    drawIconLockOpen(
        unlockSig,
        bx - 14,
        by + Math.floor(btnH * 0.5),
        9,
        { color: primaryState === 'claimable' ? P_COLORS.accentGold : P_COLORS.accentCyanSoft, width: 1.5, alpha: 0.72 },
    );
    root.addChild(unlockSig);

    const btn =
        kenneyButton(primaryState === 'claimable' ? 'CLAIM' : 'PLAY', btnW, btnH, 'button_accent', true, () => onPlay(level.id)) ??
        buildPlayFallback(btnW, btnH, primaryState === 'claimable' ? 'CLAIM' : 'PLAY', () => onPlay(level.id));
    btn.position.set(bx, by);
    root.addChild(btn);

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
            const row = buildMissionCardPortrait(lv, cw, rowH, onPlayLevel, prog.maxUnlocked);
            row.position.set(0, i * (rowH + gap));
            scrollLayer.addChild(row);
        });
        setScrollY(0);
    }

    rebuild(0);
    return { root, scrollLayer, rebuild, setScrollY, getScrollY: () => scrollY, maxScroll };
}

function buildBottomDockPortrait(
    cw: number,
    ui: GameUIManager,
    onHome: () => void,
    navIndexBySlot?: (slot: number) => void,
): { root: Container; setActive: (i: number) => void; dockCradles: Graphics[]; slotContainers: Container[] } {
    const H = 84;
    const palette: CommandDockPalette = {
        dockDeck: P_COLORS.dockDeck,
        dockDeckRim: P_COLORS.dockDeckRim,
        dockDeckTop: P_COLORS.dockDeckTop,
        dockChannel: P_COLORS.dockChannel,
        dockBolt: P_COLORS.dockBolt,
        dockCellIdle: P_COLORS.dockCellIdle,
        dockCellIdleRim: P_COLORS.dockCellIdleRim,
        dockCellActive: P_COLORS.dockCellActive,
        dockCellActiveRim: P_COLORS.dockCellActiveRim,
        accentCyan: P_COLORS.accentCyan,
        inactiveIconTint: 0xa8b4c4,
        labelIdle: 0x4a5666,
    };
    const kUnder = kenneyDockBar(cw, H);
    return buildCommandDock(
        cw,
        H,
        palette,
        FONT,
        [
            { label: 'HOME', onTap: () => { navIndexBySlot?.(0); onHome(); }, draw: drawIconHome },
            {
                label: 'MISSIONS',
                onTap: () => {
                    navIndexBySlot?.(1);
                    gameFlow().openMissionSelect();
                },
                draw: drawIconMap,
            },
            {
                label: 'HANGAR',
                onTap: () => {
                    navIndexBySlot?.(2);
                    ui.showScreen('store', true);
                },
                draw: drawIconHangar,
            },
            {
                label: 'STORE',
                onTap: () => {
                    navIndexBySlot?.(3);
                    ui.showScreen('store', true);
                },
                draw: drawIconStore,
            },
        ],
        kUnder,
        0.52,
    );
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
    const dockH = 84;
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
