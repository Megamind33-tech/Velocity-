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
import { kenneyButton, kenneyProgressBar } from '../menuLandscape/kenneyLandscapeWidgets';
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

    const base = new Graphics();
    base.rect(0, 0, w, h);
    base.fill({ color: P_COLORS.bgBase, alpha: 1 });
    root.addChild(base);

    const grid = new Graphics();
    const step = 28;
    for (let x = 0; x <= w; x += step) {
        grid.moveTo(x, 0);
        grid.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += step) {
        grid.moveTo(0, y);
        grid.lineTo(w, y);
    }
    grid.stroke({ color: P_COLORS.accentCyan, width: 1, alpha: P_OPACITY.motif });
    root.addChild(grid);

    const stars = new Graphics();
    let seed = 0x9e3779b9;
    const rnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 0xffffffff;
    };
    for (let i = 0; i < 64; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const a = 0.12 + rnd() * 0.35;
        stars.circle(x, y, rnd() > 0.9 ? 1.5 : 1);
        stars.fill({ color: 0xaaccff, alpha: a });
    }
    root.addChild(stars);

    const tick = (t: number): void => {
        const drift = Math.sin(t * 0.08) * 6;
        grid.alpha = P_OPACITY.motif + Math.sin(t * 0.35) * 0.03;
        grid.position.set(drift * 0.3, drift * 0.15);
    };

    return { root, tick };
}

function buildStatusChip(
    label: string,
    value: string,
    w: number,
    h: number,
    accent: 'cyan' | 'gold',
): Container {
    const root = new Container();

    // ── Background: Kenney nine-slice if available at this width, else vector ──
    const chipTex = getVelocityUiTexture('button_secondary');
    const BS = PORTRAIT_TAB_BS;
    const canNineSlice = !!chipTex && w >= 116; // 56+56 corners need ≥ 116px safe

    if (canNineSlice) {
        const spr = new NineSliceSprite({
            texture: chipTex!,
            leftWidth: BS.L, rightWidth: BS.R,
            topHeight: BS.T, bottomHeight: BS.B,
            width: w, height: h,
        });
        // Tint towards accent family for cohesion
        spr.tint = accent === 'gold' ? 0xf0ead0 : 0xd0e8f0;
        spr.alpha = 0.92;
        root.addChild(spr);
    } else {
        const g = new Graphics();
        g.roundRect(0, 0, w, h, P_RADIUS.chip);
        g.fill({ color: P_COLORS.bgElevated, alpha: 1 });
        const strokeC = accent === 'gold' ? P_COLORS.accentGoldSoft : P_COLORS.accentCyanSoft;
        g.stroke({ color: strokeC, width: 1.5, alpha: 0.65 });
        root.addChild(g);
        // Inner bevel line for depth
        const bevel = new Graphics();
        bevel.roundRect(1, 1, w - 2, h / 2, P_RADIUS.chip - 1);
        bevel.fill({ color: 0xffffff, alpha: 0.04 });
        root.addChild(bevel);
    }

    // ── Accent indicator strip (top edge) ─────────────────────────────────────
    const strip = new Graphics();
    const stripC = accent === 'gold' ? P_COLORS.accentGold : P_COLORS.accentCyan;
    strip.roundRect(8, 0, w - 16, 2, 1);
    strip.fill({ color: stripC, alpha: 0.7 });
    root.addChild(strip);

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
    lb.position.set(10, 6);
    root.addChild(lb);

    // ── Value — 16px bold in accent color — dominant visual target ─────────────
    const valColor = accent === 'gold' ? P_COLORS.accentGold : P_COLORS.accentCyan;
    const vt = new Text({
        text: value,
        style: new TextStyle({
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: '800',
            fill: valColor,
            dropShadow: { alpha: 0.45, blur: 2, color: 0x000000, distance: 1 },
        }),
    });
    vt.position.set(10, h / 2 - 2);
    root.addChild(vt);

    return root;
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
    const c1 = buildStatusChip('SIGNAL', p.signalVal, wChip, H - 4, 'cyan');
    c1.position.set(x0, 2);
    root.addChild(c1);
    const c2 = buildStatusChip('BEST', p.bestVal, wChip, H - 4, 'gold');
    c2.position.set(x0 + wChip + gap, 2);
    root.addChild(c2);
    const c3 = buildStatusChip('PREMIUM', p.premiumVal, wChip, H - 4, 'gold');
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

    const shadow = new Graphics();
    shadow.roundRect(4, 6, p.cw, p.cardH, P_RADIUS.panel);
    shadow.fill({ color: P_COLORS.shadowDeep, alpha: P_SHADOW.panel.alpha * 0.5 });
    root.addChild(shadow);

    const body = new Graphics();
    body.roundRect(0, 0, p.cw, p.cardH, P_RADIUS.panel);
    body.fill({ color: P_COLORS.bgPanel, alpha: 1 });
    body.stroke({ color: P_COLORS.strokeSubtle, width: 1, alpha: 0.85 });
    root.addChild(body);

    const heroGlow = new Graphics();
    heroGlow.roundRect(2, 2, p.cw - 4, p.cardH - 4, P_RADIUS.panel - 2);
    heroGlow.stroke({ color: P_COLORS.accentCyan, width: 2, alpha: 0.2 });
    root.addChild(heroGlow);

    const heroMotif = new Graphics();
    const mx = p.cw * 0.72;
    const my = p.cardH * 0.38;
    for (let i = 0; i < 5; i++) {
        const yy = my + i * 14;
        heroMotif.moveTo(mx - 40, yy);
        heroMotif.lineTo(mx + 60, yy - 6);
        heroMotif.stroke({ color: P_COLORS.accentCyan, width: 1, alpha: 0.06 });
    }
    root.addChild(heroMotif);

    const title = new Text({ text: p.title, style: ts(P_TYPO.heroTitle, P_COLORS.textPrimary) });
    title.position.set(pad, pad);
    root.addChild(title);

    const sub = new Text({ text: p.subtitle, style: ts(P_TYPO.heroSubtitle, P_COLORS.accentCyanSoft) });
    sub.position.set(pad, pad + 34);
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
    const ey = pad + 24;
    const eg = new Graphics();
    eg.circle(ex, ey, 22);
    eg.stroke({ color: P_COLORS.accentGold, width: 1.2, alpha: 0.4 });
    drawIconRouteNode(eg, ex, ey, emblemR * 0.5, { color: P_COLORS.accentGold, width: 2, alpha: 0.9 });
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
    const rb = new Graphics();
    rb.roundRect(0, 0, rankW, chipH, P_RADIUS.chip);
    rb.fill({ color: P_COLORS.bgElevated, alpha: 1 });
    rb.stroke({ color: P_COLORS.accentGoldSoft, width: 1.5, alpha: 0.55 });
    rankRoot.addChild(rb);
    const rankGlow = new Graphics();
    rankGlow.roundRect(0, 0, rankW, chipH, P_RADIUS.chip);
    rankGlow.stroke({ color: P_COLORS.accentGold, width: 2, alpha: 0.35 });
    rankRoot.addChild(rankGlow);
    const wingX = 14;
    const textPad = 36;
    const wg = new Graphics();
    drawIconWing(wg, wingX, chipH / 2, 13);
    rankRoot.addChild(wg);
    const rt = new Text({
        text: trunc(`Class: ${p.rank}`, Math.max(10, Math.floor((rankW - textPad - 8) / 7))),
        style: ts(P_TYPO.chip, P_COLORS.textPrimary),
    });
    rt.position.set(textPad, Math.floor((chipH - 14) / 2));
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
    const H = 44;
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
    const innerH = H - 10;

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
        b.position.set(pad + i * tabW, 5);

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
    const elite = level.id >= 18;

    const g = new Graphics();
    g.roundRect(0, 0, cw, rowH, P_RADIUS.panel - 2);
    if (unlocked) {
        g.fill({ color: P_COLORS.bgPanelActive, alpha: 1 });
        g.stroke({ color: P_COLORS.strokeActive, width: 1.5, alpha: 0.35 });
    } else {
        g.fill({ color: P_COLORS.bgPanelLocked, alpha: P_OPACITY.lockedSurface });
        g.stroke({ color: P_COLORS.stateLocked, width: 1, alpha: P_OPACITY.lockedStroke });
    }
    root.addChild(g);

    const ridge = new Graphics();
    ridge.roundRect(2, 2, cw - 4, rowH - 4, P_RADIUS.panel - 4);
    ridge.stroke({ color: P_COLORS.strokeSubtle, width: 1, alpha: unlocked ? 0.25 : 0.5 });
    root.addChild(ridge);

    const badge = new Graphics();
    const icX = 16 + P_ICON.emblem;
    const icY = rowH / 2;
    badge.circle(icX, icY, P_ICON.emblem);
    badge.fill({ color: unlocked ? P_COLORS.bgElevated : P_COLORS.bgBase, alpha: 1 });
    badge.stroke({
        color: unlocked ? P_COLORS.accentCyanSoft : P_COLORS.stateLocked,
        width: unlocked ? 2 : 1,
        alpha: unlocked ? 0.5 : 0.65,
    });
    root.addChild(badge);

    const ic = new Graphics();
    if (unlocked) drawIconRouteNode(ic, icX, icY, 10, { color: P_COLORS.accentCyan, width: 2, alpha: 0.9 });
    else {
        // Larger lock icon + subtle glow — make the locked state feel intentional, not empty
        drawIconLock(ic, icX, icY, 18, { color: P_COLORS.stateLocked, width: 2, alpha: 0.75 });
        ic.circle(icX, icY, P_ICON.emblem - 2);
        ic.fill({ color: P_COLORS.stateLocked, alpha: 0.06 });
    }
    root.addChild(ic);

    const btnW = 96;
    const btnH = 38;
    const tx = icX + P_ICON.emblem + P_SPACE.s12;
    // Removed the unexplained 56px surplus — title now gets full available width
    const tw = Math.max(40, cw - tx - btnW - P_SPACE.s16 - 8);

    const title = new Text({
        // Chars per pixel: 7.5 is accurate for Kenney Future at missionTitle size
        text: trunc(level.name, Math.max(10, Math.floor(tw / 7.5))),
        style: ts(P_TYPO.missionTitle, unlocked ? P_COLORS.textPrimary : P_COLORS.textSecondary),
    });
    title.position.set(tx, P_SPACE.s8);
    root.addChild(title);

    const hint = level.learningObjectives[0]?.hint ?? `${level.gateCount} voice gates`;
    const sub = new Text({
        text: trunc(hint, Math.max(14, Math.floor(tw / 6))),
        style: ts(P_TYPO.missionBody, P_COLORS.textMuted),
    });
    sub.position.set(tx, P_SPACE.s8 + 21);
    root.addChild(sub);

    // State badge — below subtitle, left-anchored (no more same-row collision with title)
    let metaStr = elite ? '★ ELITE' : completed ? '✓ CLEARED' : unlocked ? '⬡ REWARD' : '';
    if (metaStr) {
        const metaColor = elite
            ? P_COLORS.accentGold
            : completed
            ? P_COLORS.stateLive
            : P_COLORS.accentCyanSoft;
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

    const bx = cw - btnW - P_SPACE.s10;
    const by = (rowH - btnH) / 2;

    if (unlocked) {
        const btn =
            kenneyButton('PLAY', btnW, btnH, 'button_accent', true, () => onPlay(level.id)) ?? buildPlayFallback(btnW, btnH, () => onPlay(level.id));
        btn.position.set(bx, by);
        root.addChild(btn);
    } else {
        const lock = buildLockedButton(btnW, btnH);
        lock.position.set(bx, by);
        root.addChild(lock);
    }

    return root;
}

function buildPlayFallback(w: number, h: number, onPlay: () => void): Container {
    const c = new Container();
    const g = new Graphics();
    g.roundRect(0, 0, w, h, P_RADIUS.button);
    g.fill({ color: P_COLORS.accentGold, alpha: 1 });
    g.stroke({ color: 0x1a1408, width: 1, alpha: 0.35 });
    c.addChild(g);
    const t = new Text({ text: 'PLAY', style: ts(P_TYPO.button, 0x1a1204) });
    t.anchor.set(0.5);
    t.position.set(w / 2, h / 2);
    c.addChild(t);
    pressable(c, onPlay);
    return c;
}

function buildLockedButton(w: number, h: number): Container {
    const c = new Container();
    c.eventMode = 'none';

    // Outer body — darker than card background: communicates "unavailable"
    const g = new Graphics();
    g.roundRect(0, 0, w, h, P_RADIUS.button);
    g.fill({ color: P_COLORS.bgBase, alpha: 1 });
    g.stroke({ color: P_COLORS.stateLocked, width: 1.5, alpha: 0.55 });
    c.addChild(g);

    // Cross-hatch texture: two diagonal lines — game-native "locked zone" indicator
    const hatch = new Graphics();
    const stride = 10;
    for (let k = -h; k < w + h; k += stride) {
        hatch.moveTo(Math.max(0, k), 0);
        hatch.lineTo(Math.min(w, k + h), Math.min(h, h - Math.max(0, k)));
        hatch.moveTo(Math.min(w, k + h), Math.min(h, h - Math.max(0, k)));
        // skip drawing — just fill stroke
    }
    // simpler: two corner-to-corner stripes
    hatch.moveTo(0, h * 0.35);
    hatch.lineTo(w * 0.35, 0);
    hatch.moveTo(w * 0.65, h);
    hatch.lineTo(w, h * 0.65);
    hatch.stroke({ color: P_COLORS.stateLocked, width: 1, alpha: 0.12 });
    c.addChild(hatch);

    // Lock icon — centered left of label
    const lockG = new Graphics();
    const iconCx = w / 2 - 18;
    const iconCy = h / 2;
    drawIconLock(lockG, iconCx, iconCy, 14, { color: P_COLORS.stateLocked, width: 1.5, alpha: 0.75 });
    c.addChild(lockG);

    // "LOCKED" label — small, 10px, clearly reads as state not action
    const t = new Text({
        text: 'LOCKED',
        style: new TextStyle({
            fontFamily: FONT,
            fontSize: 10,
            fontWeight: '700',
            fill: P_COLORS.textMuted,
            letterSpacing: 1,
        }),
    });
    t.anchor.set(0, 0.5);
    t.position.set(iconCx + 16, h / 2);
    c.addChild(t);

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
    const rowH = 88;
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
    const H = 64;
    const root = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, cw, H, P_RADIUS.dock);
    bg.fill({ color: P_COLORS.bgPanel, alpha: P_OPACITY.dockBg });
    bg.stroke({ color: P_COLORS.strokeSubtle, width: 1, alpha: 0.75 });
    root.addChild(bg);

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
        cradle.roundRect(cx - 36, 6, 72, 52, 14);
        cradle.fill({ color: P_COLORS.bgBase, alpha: 0.35 });
        cradle.stroke({ color: P_COLORS.accentCyan, width: 1.5, alpha: 0 });
        dockCradles.push(cradle);
        slot.addChild(cradle);

        const vecG = new Graphics();
        it.draw(vecG, cx, 26, 20);
        slot.addChild(vecG);

        const t = new Text({ text: it.label, style: ts(P_TYPO.navLabel, P_COLORS.navInactive) });
        t.anchor.set(0.5, 0);
        t.position.set(cx, 44);
        slot.addChild(t);

        pressable(slot, it.onTap);
        root.addChild(slot);
        slotContainers.push(slot);
    });

    function setActive(i: number): void {
        dockCradles.forEach((cr, idx) => {
            const cx = slotW / 2;
            cr.clear();
            cr.roundRect(cx - 36, 6, 72, 52, 14);
            cr.fill({ color: P_COLORS.bgBase, alpha: idx === i ? 0.55 : 0.28 });
            cr.stroke({
                color: P_COLORS.accentCyan,
                width: 1.5,
                alpha: idx === i ? 0.65 : 0,
            });
        });
        slotContainers.forEach((ch, idx) => {
            const label = ch.children[2] as Text | undefined;
            if (label instanceof Text) {
                label.style = ts(P_TYPO.navLabel, idx === i ? P_COLORS.navActive : P_COLORS.navInactive);
                (label.style as TextStyle).fontWeight = idx === i ? '800' : '700';
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
    y += 56 + P_SPACE.s12;

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

    const dockH = 64;
    const listH = Math.max(140, sh - y - 44 - P_SPACE.s10 - dockH - p.safeBottom - P_SPACE.s16);

    const list = buildMissionListPortrait(cw, listH, (id) => gameFlow().startLevelWithMicGate?.(id), p.getProgress);

    const tabs = buildSegmentTabs(cw, (idx) => {
        list.rebuild(idx);
    });
    tabs.root.position.set(0, y);
    root.addChild(tabs.root);
    y += 44 + P_SPACE.s10;

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
