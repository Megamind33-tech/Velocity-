/**
 * menuHeroComposer — Velocity signature identity zone (cockpit / command scene).
 *
 * Not a flat info slab: layered framing, voice→flight signal arc, hex command lens,
 * and asymmetric composition so the hero reads as the game's centerpiece.
 *
 * All shapes are pure PixiJS Graphics. No new art required.
 */

import { Container, Graphics, Text } from 'pixi.js';
import { GAME_COLORS, GAME_FONTS } from './GameUITheme';
import {
    createHeroRadarHubSprite,
    createIconMicStatusDot,
    createIconPilotClassWings,
} from './menuFrontMenuIcons';
import { helperTextStyle, heroSubtitleStyle, heroTitleStyle } from './menuTextStyles';

// ─── Waveform constants ───────────────────────────────────────────────────────

const WAVE_BARS: number[] = [
    0.28, 0.45, 0.62, 0.78, 0.55, 0.88, 0.70, 0.95, 1.00, 0.92, 0.82,
    0.75, 0.88, 0.68, 0.95, 0.55, 0.78, 0.42, 0.62, 0.35, 0.22,
];
const WAVE_BAR_W = 3;
const WAVE_GAP   = 2;
const WAVE_MAX_H = 22;
/** Pre-computed total width of the 21-bar waveform. */
export const WAVEFORM_W = WAVE_BARS.length * (WAVE_BAR_W + WAVE_GAP) - WAVE_GAP;

// ─── Voice waveform motif ─────────────────────────────────────────────────────

export function createWaveformMotif(): Container {
    const root = new Container();
    WAVE_BARS.forEach((h, i) => {
        const bh  = Math.max(2, Math.round(WAVE_MAX_H * h));
        const bar = new Graphics();
        bar.roundRect(
            i * (WAVE_BAR_W + WAVE_GAP),
            WAVE_MAX_H - bh,
            WAVE_BAR_W,
            bh,
            1,
        );
        bar.fill({ color: GAME_COLORS.primary, alpha: 0.30 + h * 0.55 });
        root.addChild(bar);
    });
    return root;
}

// ─── Radar (inside command lens) ───────────────────────────────────────────────

function createRadarDisplay(r: number): Container {
    const root = new Container();
    const cx   = r;
    const cy   = r;

    const corona = new Graphics();
    corona.circle(cx, cy, r + 4);
    corona.fill({ color: GAME_COLORS.primary, alpha: 0.08 });
    root.addChild(corona);

    const disc = new Graphics();
    disc.circle(cx, cy, r);
    disc.fill({ color: 0x030a10, alpha: 0.98 });
    root.addChild(disc);

    ([
        [r * 0.32, 0.32],
        [r * 0.58, 0.22],
        [r * 0.82, 0.15],
    ] as [number, number][]).forEach(([radius, alpha]) => {
        const ring = new Graphics();
        ring.circle(cx, cy, radius);
        ring.stroke({ color: GAME_COLORS.primary, width: 0.75, alpha });
        root.addChild(ring);
    });

    const sweepAngle = -Math.PI * 0.22;
    const sweep = new Graphics();
    sweep
        .moveTo(cx, cy)
        .lineTo(cx + Math.cos(sweepAngle) * r * 0.94, cy + Math.sin(sweepAngle) * r * 0.94);
    sweep.stroke({ color: GAME_COLORS.primary, width: 1.75, alpha: 0.78 });
    root.addChild(sweep);

    const wedge = new Graphics();
    const wedgeSpan = Math.PI * 0.12;
    wedge.moveTo(cx, cy);
    wedge.arc(cx, cy, r * 0.9, sweepAngle - wedgeSpan, sweepAngle);
    wedge.closePath();
    wedge.fill({ color: GAME_COLORS.primary, alpha: 0.09 });
    root.addChild(wedge);

    const blips: [number, number, number][] = [
        [r * 0.52, -Math.PI * 0.12, 2.0],
        [r * 0.38, Math.PI * 0.38, 1.5],
        [r * 0.68, Math.PI * 0.62, 1.7],
        [r * 0.22, -Math.PI * 0.48, 1.2],
    ];
    blips.forEach(([dist, angle, dotR]) => {
        const bx = cx + Math.cos(angle) * dist;
        const by = cy + Math.sin(angle) * dist;
        const glow = new Graphics();
        glow.circle(bx, by, dotR + 2);
        glow.fill({ color: GAME_COLORS.primary, alpha: 0.14 });
        root.addChild(glow);
        const dot = new Graphics();
        dot.circle(bx, by, dotR);
        dot.fill({ color: GAME_COLORS.primary, alpha: 0.92 });
        root.addChild(dot);
    });

    const hub = createHeroRadarHubSprite(r * 0.22);
    hub.position.set(cx - r * 0.22, cy - r * 0.22);
    root.addChild(hub);

    const border = new Graphics();
    border.circle(cx, cy, r - 0.5);
    border.stroke({ color: GAME_COLORS.primary, width: 1.25, alpha: 0.55 });
    root.addChild(border);

    return root;
}

/** Flattened hex path for command lens frame (pointy top). */
function drawHexFrame(g: Graphics, cx: number, cy: number, R: number): void {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        pts.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R });
    }
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 6; i++) g.lineTo(pts[i].x, pts[i].y);
    g.closePath();
}

function createCommandLens(radarR: number): Container {
    const root  = new Container();
    const R     = radarR + 10;
    const cx    = R;
    const cy    = R;

    const outerGlow = new Graphics();
    drawHexFrame(outerGlow, cx, cy, R + 5);
    outerGlow.fill({ color: GAME_COLORS.primary, alpha: 0.05 });
    root.addChild(outerGlow);

    const face = new Graphics();
    drawHexFrame(face, cx, cy, R);
    face.fill({ color: 0x060f18, alpha: 0.92 });
    root.addChild(face);

    const bevel = new Graphics();
    drawHexFrame(bevel, cx, cy, R);
    bevel.stroke({ color: 0x1a3d4a, width: 4, alpha: 0.35 });
    root.addChild(bevel);

    const inner = new Graphics();
    drawHexFrame(inner, cx, cy, R - 2.5);
    inner.stroke({ color: GAME_COLORS.primary, width: 1.5, alpha: 0.45 });
    root.addChild(inner);

    const tick = new Graphics();
    tick.moveTo(cx, cy - R + 2).lineTo(cx, cy - R + 9);
    tick.stroke({ color: GAME_COLORS.primary, width: 1.2, alpha: 0.7 });
    root.addChild(tick);

    const radar = createRadarDisplay(radarR);
    radar.position.set(cx - radarR, cy - radarR);
    root.addChild(radar);

    const rim = new Graphics();
    drawHexFrame(rim, cx, cy, R - 0.5);
    rim.stroke({ color: GAME_COLORS.primary, width: 1.25, alpha: 0.65 });
    root.addChild(rim);

    return root;
}

function createVoiceLinkArc(
    x0: number, y0: number, x1: number, y1: number,
): Container {
    const wrap = new Container();
    const mx = (x0 + x1) * 0.52;
    const my = Math.min(y0, y1) - 18;
    const g = new Graphics();
    g.moveTo(x0, y0);
    g.quadraticCurveTo(mx, my, x1, y1);
    g.stroke({ color: GAME_COLORS.primary, width: 1.25, alpha: 0.38 });
    wrap.addChild(g);
    const g2 = new Graphics();
    g2.moveTo(x0, y0);
    g2.quadraticCurveTo(mx, my, x1, y1);
    g2.stroke({ color: 0xffffff, width: 0.5, alpha: 0.1 });
    wrap.addChild(g2);
    return wrap;
}

function createReadyChip(
    text: string,
): { container: Container; chipW: number; chipH: number } {
    const container = new Container();
    const h        = 22;
    const padX     = 10;
    const micSlotW = 18;
    const gap      = 6;
    const label    = new Text({ text, style: helperTextStyle() });
    const chipW    = padX + micSlotW + gap + label.width + padX;

    const bg = new Graphics();
    bg.roundRect(0, 0, chipW, h, h / 2);
    bg.fill({ color: 0x050f14, alpha: 0.9 });
    bg.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.55 });
    container.addChild(bg);

    const status = createIconMicStatusDot(h);
    status.position.set(padX, 0);
    container.addChild(status);

    label.anchor.set(0, 0.5);
    label.position.set(padX + micSlotW + gap, h / 2);
    container.addChild(label);

    return { container, chipW, chipH: h };
}

// ─── Hero module ───────────────────────────────────────────────────────────────

export interface HeroModuleOptions {
    title:      string;
    subtitle:   string;
    hint:       string;
    pilotRank?: string;
}

/**
 * Signature hero: pillar insignia, layered backplate, voice arc into hex command lens,
 * title stack left, rank integrated — reads as one cockpit scene.
 */
export function buildHeroModule(
    width:  number,
    height: number,
    opts:   HeroModuleOptions,
): Container {
    const root = new Container();

    const pillarW = 12;
    const bodyX   = pillarW - 2;

    // ── Pillar (left spine — breaks the “one rectangle” read) ─────────────
    const pillar = new Graphics();
    pillar.roundRect(0, 0, pillarW, height, 4);
    pillar.fill({ color: 0x040a12, alpha: 0.98 });
    pillar.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.35 });
    root.addChild(pillar);

    const pillarGlow = new Graphics();
    pillarGlow.roundRect(2, height * 0.15, 3, height * 0.55, 1);
    pillarGlow.fill({ color: GAME_COLORS.primary, alpha: 0.22 });
    root.addChild(pillarGlow);

    // ── Main body (offset inset — nested card) ────────────────────────────
    const bodyW = width - bodyX;
    const base  = new Graphics();
    base.roundRect(bodyX, 0, bodyW, height, 12);
    base.fill({ color: 0x070f18, alpha: 0.98 });
    root.addChild(base);

    const v2 = new Graphics();
    v2.rect(bodyX, 0, bodyW * 0.45, height);
    v2.fill({ color: 0x000510, alpha: 0.35 });
    root.addChild(v2);

    const energyPlane = new Graphics();
    energyPlane.moveTo(bodyX, height * 0.55);
    energyPlane.lineTo(bodyX, 0);
    energyPlane.lineTo(bodyX + bodyW * 0.62, 0);
    energyPlane.lineTo(bodyX + bodyW * 0.52, height * 0.58);
    energyPlane.closePath();
    energyPlane.fill({ color: 0x0a1a28, alpha: 0.55 });
    root.addChild(energyPlane);

    const horizon = new Graphics();
    horizon.moveTo(bodyX + 14, height * 0.62);
    horizon.lineTo(width - 16, height * 0.58);
    horizon.stroke({ color: GAME_COLORS.primary, width: 0.75, alpha: 0.12 });
    root.addChild(horizon);

    const bodyFrame = new Graphics();
    bodyFrame.roundRect(bodyX + 0.5, 0.5, bodyW - 1, height - 1, 12);
    bodyFrame.stroke({ color: GAME_COLORS.primary, width: 1.5, alpha: 0.52 });
    root.addChild(bodyFrame);

    const pillarFrame = new Graphics();
    pillarFrame.roundRect(0.5, 0.5, pillarW - 1, height - 1, 4);
    pillarFrame.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.4 });
    root.addChild(pillarFrame);

    const topStripe = new Graphics();
    topStripe.roundRect(bodyX + 16, 1, bodyW * 0.38, 2.5, 1);
    topStripe.fill({ color: GAME_COLORS.primary, alpha: 0.88 });
    root.addChild(topStripe);

    // Command lens (hex) — size from height, placed right/center
    const radarR   = Math.min(36, Math.max(26, Math.floor(height * 0.29)));
    const lensSize = (radarR + 10) * 2;
    const lensCX   = width - lensSize * 0.48 - 6;
    const lensCY   = height * 0.46;
    const lens     = createCommandLens(radarR);
    lens.position.set(lensCX - (radarR + 10), lensCY - (radarR + 10));
    root.addChild(lens);

    const flightTag = new Text({
        text:  'FLIGHT',
        style: {
            fill:          GAME_COLORS.primary,
            fontSize:      7,
            fontFamily:    GAME_FONTS.arcade,
            letterSpacing: 3,
        },
    });
    flightTag.alpha = 0.5;
    flightTag.anchor.set(0.5, 0);
    flightTag.position.set(lensCX, lensCY + radarR + 14);
    root.addChild(flightTag);

    const signalTag = new Text({
        text:  'VOICE LINK',
        style: {
            fill:          0x88aabb,
            fontSize:      7,
            fontFamily:    GAME_FONTS.arcade,
            letterSpacing: 2,
        },
    });
    signalTag.alpha = 0.55;
    signalTag.anchor.set(0, 0);
    signalTag.position.set(bodyX + 20, height * 0.2);
    root.addChild(signalTag);

    const titleFontSize = Math.min(32, Math.max(24, Math.floor(height * 0.24)));
    const titleText = new Text({
        text:  opts.title,
        style: heroTitleStyle(titleFontSize),
    });
    titleText.position.set(bodyX + 18, 7);
    root.addChild(titleText);

    const waveY    = titleText.y + titleFontSize + 5;
    const showWave = height >= 108;
    let waveEndX   = bodyX + 18;
    let waveMidY   = waveY + WAVE_MAX_H * 0.5;
    if (showWave) {
        const wave = createWaveformMotif();
        wave.position.set(bodyX + 18, waveY);
        root.addChild(wave);
        waveEndX = bodyX + 18 + WAVEFORM_W;
        waveMidY = waveY + WAVE_MAX_H * 0.5;
    }

    const subtitleY = showWave ? waveY + WAVE_MAX_H + 5 : waveY + 4;
    const subText   = new Text({
        text:  opts.subtitle,
        style: heroSubtitleStyle(),
    });
    subText.position.set(bodyX + 18, subtitleY);
    root.addChild(subText);

    const arcX0 = bodyX + 18;
    const arcX1 = bodyX + 18 + Math.min(72, bodyW * 0.36);
    const arcY  = subtitleY + 17;
    const routeArc = new Graphics();
    routeArc.moveTo(arcX0, arcY + 4);
    routeArc.quadraticCurveTo((arcX0 + arcX1) / 2, arcY - 10, arcX1, arcY + 2);
    routeArc.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.32 });
    root.addChild(routeArc);

    const pitchLbl = new Text({
        text:  'PITCH · SIGNAL',
        style: {
            fill:          0x668899,
            fontSize:      7,
            fontFamily:    GAME_FONTS.arcade,
            letterSpacing: 1.5,
        },
    });
    pitchLbl.alpha = 0.65;
    pitchLbl.position.set(bodyX + 20, subtitleY + 19);
    root.addChild(pitchLbl);

    // Voice → lens arc (only if wave visible and room)
    if (showWave && waveEndX < lensCX - 8) {
        const arc = createVoiceLinkArc(waveEndX + 4, waveMidY, lensCX - radarR * 0.35, lensCY);
        root.addChild(arc);
    }

    const chipResult = createReadyChip(opts.hint);
    const chipY      = height - chipResult.chipH - 7;

    if (opts.pilotRank) {
        const rankTagH  = 20;
        const rankLabel = new Text({
            text: opts.pilotRank,
            style: {
                fill:          GAME_COLORS.primary,
                fontSize:      9,
                fontWeight:    'bold',
                fontFamily:    GAME_FONTS.arcade,
                letterSpacing: 1.5,
            },
        });
        const classLabel = new Text({
            text:  'CLASS',
            style: {
                fill:          0x5a7088,
                fontSize:      7,
                fontFamily:    GAME_FONTS.arcade,
                letterSpacing: 2,
            },
        });
        const wingSlot = 16;
        const tagW     = Math.max(rankLabel.width, classLabel.width) + 20 + wingSlot;

        const tagBg = new Graphics();
        tagBg.roundRect(0, 0, tagW, rankTagH, 4);
        tagBg.fill({ color: 0x050c12, alpha: 0.88 });
        tagBg.stroke({ color: GAME_COLORS.accent_gold, width: 1, alpha: 0.42 });

        const tagContainer = new Container();
        tagContainer.addChild(tagBg);
        const classWing = createIconPilotClassWings(wingSlot);
        classWing.position.set(4, (rankTagH - wingSlot) / 2);
        tagContainer.addChild(classWing);
        const textCx = wingSlot + 10 + Math.max(rankLabel.width, classLabel.width) / 2;
        classLabel.anchor.set(0.5, 0);
        classLabel.position.set(textCx, 2);
        tagContainer.addChild(classLabel);
        rankLabel.anchor.set(0.5, 1);
        rankLabel.position.set(textCx, rankTagH - 2);
        tagContainer.addChild(rankLabel);

        chipResult.container.position.set(bodyX + 18, chipY);
        root.addChild(chipResult.container);

        tagContainer.position.set(bodyX + 18 + chipResult.chipW + 8, chipY + 1);
        root.addChild(tagContainer);
    } else {
        chipResult.container.position.set(bodyX + 18, chipY);
        root.addChild(chipResult.container);
    }

    return root;
}
