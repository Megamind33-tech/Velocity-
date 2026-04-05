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
import { getVelocityCustomTexture } from '../velocityUiArt';
import {
    buildTopUtilityBar,
    type TopBarRefs,
    kenneyButton,
    kenneyDockBar,
    kenneyHeroPanel,
    kenneyListBay,
    kenneyMissionCardFace,
    kenneyProgressBar,
    spriteIcon,
} from './kenneyWidgets';
import { mountHeroCommandLayout } from '../menuShared/heroCommandLayout';
import { mountMissionRewardIcon } from '../menuShared/missionRewardWell';
import { mountEmblemCircleWell, mountTexturedInsetPlate } from '../menuShared/texturedPlates';
import { buildHeroAmbientParts, mountClassChipKenneyRim } from '../menuShared/heroAmbientAccents';
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
// Shell backdrop: shared live menu backdrop (MainMenuScreen velocity shell), not a second layer here.
// Top bar: buildTopUtilityBar (same Kenney rail + stat chips as landscape).
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
    /** Kenney/sprite hero life (rim pulse, bar glint, class rim, star accent). */
    heroAmbientTick: (t: number) => void;
    tabGlows: Graphics[];
    dockCradles: (Graphics | NineSliceSprite)[];
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
    topRefs: TopBarRefs;
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
    anim: Pick<PortraitAnimHandles, 'heroAmbientTick'>;
    flyCta: Container | null;
    routeBarW: number;
} {
    const root = new Container();
    const pad = P_SPACE.s16;
    const pair = kenneyHeroPanel(p.cw, p.cardH);
    if (pair) {
        root.addChild(pair.root);
        const contentW = Math.max(240, p.cw - pad * 2);
        const innerH = Math.max(110, p.cardH - 48);
        const progLite = {
            unlockedCount: p.routesDone,
            totalLevels: p.routesTotal,
            rewardStars: p.rewardStars,
        };
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
        return {
            root,
            anim: { heroAmbientTick: cmd.heroAmbientTick },
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
    const title = new Text({
        text: p.title,
        style: new TextStyle({
            fontFamily: FONT,
            fontSize: P_TYPO.heroTitle.fontSize,
            fontWeight: P_TYPO.heroTitle.fontWeight,
            fill: P_COLORS.textPrimary,
            letterSpacing: P_TYPO.heroTitle.letterSpacing,
            dropShadow: { alpha: 0.4, blur: 2, color: P_COLORS.accentCyan, distance: 0 },
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
    let barGlintAnchor: Container;
    if (kBar) {
        kBar.position.set(pad, routeY + 18);
        kBar.setProgress(prog01);
        root.addChild(kBar);
        barGlintAnchor = kBar;
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
        barGlintAnchor = fl;
    }
    const emblemR = 28;
    const ex = p.cw - pad - emblemR;
    const ey = pad + 28;
    const eg = new Graphics();
    portraitHeroGoldEmblem(eg, ex, ey, emblemR);
    root.addChild(eg);
    const chipH = 48;
    const rowY = p.cardH - pad - chipH;
    const rowInner = p.cw - pad * 2;
    let flyW = Math.min(160, Math.max(120, Math.floor(rowInner * 0.48)));
    let rankW = rowInner - flyW - P_SPACE.s8;
    if (rankW < 140) {
        rankW = 140;
        flyW = Math.max(100, rowInner - rankW - P_SPACE.s8);
    }
    rankW = Math.min(rankW, rowInner - flyW - P_SPACE.s8);
    // Snap to 8px grid
    flyW = Math.floor(flyW / 8) * 8;
    const rankRoot = new Container();
    const rankRim = mountClassChipKenneyRim(rankRoot, rankW, chipH, P_COLORS.accentGold);
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
    const wingX = 15;
    const textPad = 32;
    const classSpr = spriteIcon('menu_pilot_class_star', 20, P_COLORS.accentGold);
    if (classSpr) {
        classSpr.position.set(wingX, chipH / 2);
        classSpr.alpha = 0.95;
        rankRoot.addChild(classSpr);
    } else {
        const wg = new Graphics();
        drawIconWing(wg, wingX, chipH / 2, 12);
        rankRoot.addChild(wg);
    }
    const rt = new Text({
        text: trunc(`CLASS: ${p.rank.toUpperCase()}`, Math.max(10, Math.floor((rankW - textPad - 10) / 7))),
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
    const fly = kenneyButton('FLY NOW', flyW, chipH, 'button_accent', false, p.onFly) ?? buildFallbackFly(flyW, chipH, p.onFly);
    fly.label = 'heroFlyCta';
    fly.position.set(p.cw - pad - flyW, rowY);
    root.addChild(fly);

    const ambient = buildHeroAmbientParts({
        contentW: p.cw - 2,
        innerH: p.cardH - 2,
        ox: 0,
        colors: { cyan: P_COLORS.accentCyan, gold: P_COLORS.accentGold },
        barW,
        barH,
        barY: routeY + 18,
        emblemCx: ex,
        emblemCy: ey,
        emblemR,
        rankRim,
    });
    const afterPanel = root.getChildIndex(ibevel);
    root.addChildAt(ambient.rim, afterPanel + 1);
    root.addChildAt(ambient.motifRoot, afterPanel + 2);
    root.addChildAt(ambient.routeRoot, root.getChildIndex(barGlintAnchor) + 1);
    if (ambient.rewardSpr) {
        root.addChildAt(ambient.rewardSpr, root.getChildIndex(eg) + 1);
    }

    return {
        root,
        anim: { heroAmbientTick: ambient.tick },
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
    h: number = 48,
): { root: Container; setActive: (i: number) => void; tabGlows: Graphics[] } {
    const strip = buildModeFilterStrip(cw, h, FONT, onSelect, {
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

    const spineG = new Graphics();
    spineG.roundRect(0, 8, leftRailW, rowH - 16, 2);
    spineG.fill({ color: elite ? P_COLORS.accentGoldSoft : P_COLORS.stateLocked, alpha: elite ? 0.55 : 0.4 });
    mountTexturedInsetPlate(root, 0, 8, leftRailW, rowH - 16, 'spine', spineG, {
        fill: elite ? P_COLORS.accentGoldSoft : P_COLORS.stateLocked,
        fillAlpha: elite ? 0.58 : 0.44,
        stroke: elite ? P_COLORS.accentGoldSoft : P_COLORS.stateLocked,
        strokeAlpha: 0.42,
    });

    const wellG = new Graphics();
    wellG.roundRect(leftPad, 10, emblemWellW, rowH - 20, 10);
    wellG.fill({ color: elite ? P_COLORS.lockedGateWellElite : P_COLORS.lockedGateWell, alpha: 1 });
    wellG.stroke({
        color: elite ? P_COLORS.accentGoldSoft : P_COLORS.lockedPlaqueRim,
        width: 1,
        alpha: elite ? 0.35 : 0.28,
    });
    mountTexturedInsetPlate(root, leftPad, 10, emblemWellW, rowH - 20, 'well', wellG, {
        fill: elite ? P_COLORS.lockedGateWellElite : P_COLORS.lockedGateWell,
        fillAlpha: 1,
        stroke: elite ? P_COLORS.accentGoldSoft : P_COLORS.lockedPlaqueRim,
        strokeAlpha: elite ? 0.38 : 0.32,
    });

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
        const tw = Math.min(108, centerW - 4);
        const th = bands.tierH;
        const tierG = new Graphics();
        tierG.roundRect(tx, bands.tierY, tw, th, 6);
        tierG.fill({ color: P_COLORS.lockedPlaqueElite, alpha: 0.88 });
        tierG.stroke({ color: P_COLORS.accentGoldSoft, width: 1, alpha: 0.42 });
        mountTexturedInsetPlate(root, tx, bands.tierY, tw, th, 'tier', tierG, {
            fill: P_COLORS.lockedPlaqueElite,
            fillAlpha: 0.9,
            stroke: P_COLORS.accentGoldSoft,
            strokeAlpha: 0.44,
        });
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
        fill: 0x9aacbe,
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
    const mmw = Math.min(centerW - 4, 120);
    const mmh = bands.metaH;
    const metaG = new Graphics();
    metaG.roundRect(tx, bands.metaY, mmw, mmh, 6);
    metaG.fill({ color: primaryState === 'elite_locked' ? 0x1a140c : 0x0a1218, alpha: 0.88 });
    metaG.stroke({ color: elite ? P_COLORS.accentGoldSoft : P_COLORS.lockedPlaqueRim, width: 1, alpha: 0.35 });
    mountTexturedInsetPlate(root, tx, bands.metaY, mmw, mmh, 'meta', metaG, {
        fill: primaryState === 'elite_locked' ? 0x1a140c : 0x0a1218,
        fillAlpha: 0.9,
        stroke: elite ? P_COLORS.accentGoldSoft : P_COLORS.lockedPlaqueRim,
        strokeAlpha: 0.38,
    });
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
        fill: 0x7d8fa4,
        letterSpacing: 0.1,
    }, 9, 8);
    helper.position.set(tx, bands.helpY);
    root.addChild(helper);

    const rrw = centerW + 4;
    const rrh = bands.rewardH;
    const rewardG = new Graphics();
    rewardG.roundRect(tx - 2, bands.rewardY, rrw, rrh, 7);
    rewardG.fill({ color: elite ? 0x120e0a : 0x060a10, alpha: 0.9 });
    rewardG.stroke({
        color: elite ? P_COLORS.accentGoldSoft : P_COLORS.lockedPlaqueRim,
        width: 1,
        alpha: 0.32,
    });
    mountTexturedInsetPlate(root, tx - 2, bands.rewardY, rrw, rrh, 'reward', rewardG, {
        fill: elite ? 0x120e0a : 0x060a10,
        fillAlpha: 0.92,
        stroke: elite ? P_COLORS.accentGoldSoft : P_COLORS.lockedPlaqueRim,
        strokeAlpha: 0.36,
    });
    const rycL = bands.rewardY + bands.rewardH / 2;
    const racL = elite ? P_COLORS.accentGold : 0x6b7d90;
    const rrimL = elite ? P_COLORS.accentGoldSoft : P_COLORS.lockedPlaqueRim;
    mountMissionRewardIcon(root, tx + 10, rycL, racL, rrimL);
    const rewardStr =
        primaryState === 'elite_locked'
            ? `WITHHELD +${rewardValue} SIGNAL`
            : `BONUS +${rewardValue} SIGNAL`;
    const rewardText = fitOneLineSmall(rewardStr, centerW - 34, {
        fontFamily: FONT,
        fontWeight: '700',
        fill: elite ? P_COLORS.accentGold : 0x6b7d90,
        letterSpacing: 0.4,
        fontSize: 9,
    });
    rewardText.position.set(tx + 24, bands.rewardY + Math.max(2, (bands.rewardH - rewardText.height) / 2));
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
    const plaqueOuter = new Graphics();
    plaqueOuter.roundRect(px, py, plaqueW, ph, 12);
    plaqueOuter.fill({ color: elite ? P_COLORS.lockedPlaqueElite : P_COLORS.lockedPlaque, alpha: plaqueTex ? 0.72 : 0.96 });
    plaqueOuter.stroke({
        color: elite ? P_COLORS.accentGold : P_COLORS.lockedPlaqueRim,
        width: 2,
        alpha: elite ? 0.55 : 0.5,
    });
    const plaqueOk = mountTexturedInsetPlate(root, px, py, plaqueW, ph, 'plaque', plaqueOuter, {
        fill: elite ? P_COLORS.lockedPlaqueElite : P_COLORS.lockedPlaque,
        fillAlpha: plaqueTex ? 0.58 : 0.94,
        stroke: elite ? P_COLORS.accentGold : P_COLORS.lockedPlaqueRim,
        strokeAlpha: elite ? 0.58 : 0.52,
    });
    if (!plaqueOk) {
        const plaqueInner = new Graphics();
        plaqueInner.roundRect(px + 4, py + 4, plaqueW - 8, ph - 8, 9);
        plaqueInner.stroke({ color: 0xffffff, width: 1, alpha: elite ? 0.06 : 0.04 });
        root.addChild(plaqueInner);
    }

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

    const stripColor = elite ? P_COLORS.accentGold : completed ? P_COLORS.stateLive : P_COLORS.accentCyan;
    const stripG = new Graphics();
    stripG.roundRect(0, 6, 3, rowH - 12, 1.5);
    stripG.fill({ color: stripColor, alpha: 0.78 });
    mountTexturedInsetPlate(root, 0, 6, 3, rowH - 12, 'spine', stripG, {
        fill: stripColor,
        fillAlpha: 0.82,
        stroke: stripColor,
        strokeAlpha: 0.5,
    });

    const icX = 18 + P_ICON.emblem;
    const icY = rowH / 2;
    const rimCol = elite ? P_COLORS.accentGold : P_COLORS.accentCyanSoft;
    const badge = new Graphics();
    badge.circle(icX, icY, P_ICON.emblem + 4);
    badge.fill({ color: rimCol, alpha: 0.05 });
    badge.circle(icX, icY, P_ICON.emblem);
    badge.fill({ color: P_COLORS.bgElevated, alpha: 1 });
    badge.circle(icX, icY, P_ICON.emblem);
    badge.stroke({ color: rimCol, width: 2, alpha: 0.55 });
    mountEmblemCircleWell(root, icX, icY, P_ICON.emblem, badge, { tint: rimCol, alpha: 0.94 });

    const ic = new Graphics();
    const iconColor = elite ? P_COLORS.accentGold : P_COLORS.accentCyan;
    drawIconRouteNode(ic, icX, icY, 10, { color: iconColor, width: 2, alpha: 0.90 });
    root.addChild(ic);

    const btnW = 104;
    const btnH = 40;
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
        const pmw = Math.min(tw - 4, 130);
        const pmh = bands.metaH;
        const metaG2 = new Graphics();
        metaG2.roundRect(tx, bands.metaY, pmw, pmh, 6);
        metaG2.fill({ color: primaryState === 'claimable' ? 0x22180d : 0x09131d, alpha: 0.8 });
        metaG2.stroke({ color: primaryState === 'claimable' ? P_COLORS.accentGoldSoft : P_COLORS.strokeSubtle, width: 1, alpha: 0.35 });
        mountTexturedInsetPlate(root, tx, bands.metaY, pmw, pmh, 'meta', metaG2, {
            fill: primaryState === 'claimable' ? 0x22180d : 0x09131d,
            fillAlpha: 0.84,
            stroke: primaryState === 'claimable' ? P_COLORS.accentGoldSoft : P_COLORS.strokeSubtle,
            strokeAlpha: 0.38,
        });
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

    const rrw2 = Math.max(120, tw - 4);
    const rrh2 = bands.rewardH;
    const rewardG2 = new Graphics();
    rewardG2.roundRect(tx - 4, bands.rewardY, rrw2, rrh2, 6);
    rewardG2.fill({ color: primaryState === 'claimable' ? 0x231b0f : 0x0a121d, alpha: 0.78 });
    rewardG2.stroke({
        color: primaryState === 'claimable' ? P_COLORS.accentGoldSoft : P_COLORS.strokeSubtle,
        width: 1,
        alpha: 0.4,
    });
    mountTexturedInsetPlate(root, tx - 4, bands.rewardY, rrw2, rrh2, 'reward', rewardG2, {
        fill: primaryState === 'claimable' ? 0x231b0f : 0x0a121d,
        fillAlpha: 0.82,
        stroke: primaryState === 'claimable' ? P_COLORS.accentGoldSoft : P_COLORS.strokeSubtle,
        strokeAlpha: 0.42,
    });
    const rycP = bands.rewardY + bands.rewardH / 2;
    const racP = primaryState === 'claimable' ? P_COLORS.accentGold : P_COLORS.accentCyanSoft;
    const rrimP = primaryState === 'claimable' ? P_COLORS.accentGoldSoft : P_COLORS.strokeSubtle;
    mountMissionRewardIcon(root, tx + 10, rycP, racP, rrimP);
    const rewardLine = `REWARD +${Math.max(90, level.gateCount * 18)} SIGNAL`;
    const rewardText = fitOneLineSmall(rewardLine, tw - 34, {
        fontFamily: FONT,
        fontWeight: '700',
        fill: primaryState === 'claimable' ? P_COLORS.accentGold : P_COLORS.accentCyanSoft,
        letterSpacing: 0.4,
        fontSize: 9,
    });
    rewardText.position.set(tx + 24, bands.rewardY + Math.max(2, (bands.rewardH - rewardText.height) / 2));
    root.addChild(rewardText);

    const bx = cw - btnW - P_SPACE.s10;
    const by = (rowH - btnH) / 2;
    const adW = btnW + 14;
    const adH = rowH - 16;
    const actionG = new Graphics();
    actionG.roundRect(bx - 8, 8, adW, adH, 10);
    actionG.fill({ color: 0x0a121d, alpha: 0.45 });
    actionG.stroke({
        color: primaryState === 'claimable' ? P_COLORS.accentGold : P_COLORS.accentCyan,
        width: 1,
        alpha: 0.34,
    });
    mountTexturedInsetPlate(root, bx - 8, 8, adW, adH, 'actionDock', actionG, {
        fill: 0x0a121d,
        fillAlpha: 0.52,
        stroke: primaryState === 'claimable' ? P_COLORS.accentGold : P_COLORS.accentCyan,
        strokeAlpha: 0.4,
    });
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
    const bay = kenneyListBay(cw, listH);
    if (bay) {
        root.addChild(bay);
    } else {
        const listFrame = new Graphics();
        listFrame.roundRect(0, 0, cw, listH, 14);
        listFrame.fill({ color: 0x08131f, alpha: 0.28 });
        listFrame.stroke({ color: 0x2e435f, width: 1, alpha: 0.26 });
        listFrame.roundRect(8, 2, cw - 16, 2, 1);
        listFrame.fill({ color: P_COLORS.accentCyan, alpha: 0.14 });
        root.addChild(listFrame);
    }

    const maskG = new Graphics();
    maskG.rect(0, 0, cw, listH);
    maskG.fill({ color: 0xffffff, alpha: 1 });
    root.addChild(maskG);
    const scrollLayer = new Container();
    scrollLayer.mask = maskG;
    root.addChild(scrollLayer);

    let scrollY = 0;
    const rowH = 104;
    const gap = 12;

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
    h: number = 80,
): { root: Container; setActive: (i: number) => void; dockCradles: (Graphics | NineSliceSprite)[]; slotContainers: Container[] } {
    const H = h;
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
        labelIdle: 0xb4c2d4,
        labelActive: P_COLORS.accentCyan,
    };
    const kUnder = kenneyDockBar(cw, H);
    return buildCommandDock(
        cw,
        H,
        palette,
        FONT,
        [
            {
                label: 'HOME',
                onTap: () => {
                    navIndexBySlot?.(0);
                    onHome();
                },
                draw: drawIconHome,
                menuIconKey: 'dock_nav_home',
                menuIconFullColor: true,
            },
            {
                label: 'MISSIONS',
                onTap: () => {
                    navIndexBySlot?.(1);
                    gameFlow().openMissionSelect();
                },
                draw: drawIconMap,
                menuIconKey: 'dock_nav_missions',
                menuIconFullColor: true,
            },
            {
                label: 'HANGAR',
                onTap: () => {
                    navIndexBySlot?.(2);
                    ui.showScreen('store', true);
                },
                draw: drawIconHangar,
                menuIconKey: 'dock_nav_hangar',
                menuIconFullColor: true,
            },
            {
                label: 'STORE',
                onTap: () => {
                    navIndexBySlot?.(3);
                    ui.showScreen('store', true);
                },
                draw: drawIconStore,
                menuIconKey: 'dock_nav_store',
                menuIconFullColor: true,
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

    const TOP_BAR_H = 64;
    let y = p.safeTop + 12;

    const topBar = buildTopUtilityBar(
        cw,
        () => p.ui.showScreen('settings', true),
        prog,
        p.getBestScore(),
        () => gameFlow().openAchievements?.(),
    );
    topBar.root.position.set(0, y);
    root.addChild(topBar.root);
    y += TOP_BAR_H + P_SPACE.s12;

    const cardH = Math.min(240, Math.max(200, Math.floor(sh * 0.29)));
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

    const tabsH = 48;
    const dockH = 80;
    const listH = Math.max(156, sh - y - tabsH - P_SPACE.s8 - dockH - p.safeBottom - P_SPACE.s16);

    const list = buildMissionListPortrait(cw, listH, (id) => gameFlow().startLevelWithMicGate?.(id), p.getProgress);

    const tabs = buildSegmentTabs(cw, (idx) => {
        list.rebuild(idx);
    }, tabsH);
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
        dockH,
    );
    navApply = dock.setActive;
    dock.root.position.set(0, sh - p.safeBottom - dockH - P_SPACE.s8);
    root.addChild(dock.root);

    const anim: PortraitAnimHandles = {
        ...feat.anim,
        tabGlows: tabs.tabGlows,
        dockCradles: dock.dockCradles,
    };

    const tick = (t: number): void => {
        anim.heroAmbientTick(t);
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
        topRefs: topBar.refs,
        flyCta: feat.flyCta,
    };
}
