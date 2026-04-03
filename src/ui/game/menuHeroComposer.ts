/**
 * menuHeroComposer — Velocity's game identity hero zone.
 *
 * ASYMMETRIC COMPOSITION — NOT a dark slab with centered text.
 *
 * Layout (left zone | right zone):
 *   LEFT  (x=18): VELOCITY title (left-aligned) + voice waveform (21 bars)
 *                 + subtitle + mission-ready chip
 *   RIGHT: Circular radar/cockpit display — concentric rings, crosshairs,
 *          sweep line, blip dots — strong circular shape breaking the rectangle
 *
 * Composition (bottom → top):
 *   1. Layered background (base + angled identity strip)
 *   2. Outer border + top identity stripe + bottom rim accent
 *   3. Radar cockpit display (right zone, circular)
 *   4. Flight insignia bars (left edge only — reinforces left anchor)
 *   5. VELOCITY title — LEFT-ALIGNED at (18, 10)
 *   6. Voice waveform — 21 bars, 22px tall, left-aligned under title
 *   7. Subtitle — left-aligned
 *   8. Mission-ready chip — left-aligned at bottom
 *   9. Optional pilot rank tag to the right of the chip
 *
 * All shapes are pure PixiJS Graphics. No new art required.
 */

import { Container, Graphics, Text } from 'pixi.js';
import { GAME_COLORS, GAME_FONTS } from './GameUITheme';
import { helperTextStyle, heroSubtitleStyle, heroTitleStyle } from './menuTextStyles';

// ─── Waveform constants ───────────────────────────────────────────────────────

/**
 * 21-bar voice frequency profile — asymmetric, rises to center-left peak.
 * Total width = 21 * (3 + 2) - 2 = 103px at BAR_W=3, GAP=2.
 */
const WAVE_BARS: number[] = [
    0.28, 0.45, 0.62, 0.78, 0.55, 0.88, 0.70, 0.95, 1.00, 0.92, 0.82,
    0.75, 0.88, 0.68, 0.95, 0.55, 0.78, 0.42, 0.62, 0.35, 0.22,
];
const WAVE_BAR_W = 3;
const WAVE_GAP   = 2;
const WAVE_MAX_H = 22;
/** Pre-computed total width of the 21-bar waveform. */
export const WAVEFORM_W = WAVE_BARS.length * (WAVE_BAR_W + WAVE_GAP) - WAVE_GAP; // 103

// ─── Voice waveform motif ─────────────────────────────────────────────────────

/**
 * 21-bar voice frequency motif.
 * Bars start at local x=0; total width = WAVEFORM_W (103px).
 * Caller positions it: `wave.position.set(18, titleBottom + 6)`.
 */
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
        // Taller bars are brighter — amplitude gradient
        bar.fill({ color: GAME_COLORS.primary, alpha: 0.30 + h * 0.55 });
        root.addChild(bar);
    });
    return root;
}

// ─── Radar cockpit display ─────────────────────────────────────────────────────

/**
 * Circular cockpit/radar display.
 * Sits in the RIGHT zone of the hero panel.
 *
 * Layers (bottom → top):
 *   1. Outer glow ring (subtle alpha corona)
 *   2. Dark disc fill
 *   3. Concentric rings (3 radii, decreasing alpha)
 *   4. Crosshair lines (horizontal + vertical, faint)
 *   5. Sweep line (angled from center — active radar feel)
 *   6. Sweep gradient fill (thin arc wedge)
 *   7. Blip dots (3–4 at scattered positions)
 *   8. Center dot (origin point)
 *   9. Outer border ring (crisp edge definition)
 */
function createRadarDisplay(r: number): Container {
    const root = new Container();
    const cx   = r;
    const cy   = r;

    // 1. Outer glow corona (wider, very low alpha)
    const corona = new Graphics();
    corona.circle(cx, cy, r + 5);
    corona.fill({ color: GAME_COLORS.primary, alpha: 0.06 });
    root.addChild(corona);

    // 2. Dark disc fill
    const disc = new Graphics();
    disc.circle(cx, cy, r);
    disc.fill({ color: 0x040d14, alpha: 0.96 });
    root.addChild(disc);

    // 3. Concentric rings
    ([
        [r * 0.32, 0.28],
        [r * 0.58, 0.20],
        [r * 0.82, 0.14],
    ] as [number, number][]).forEach(([radius, alpha]) => {
        const ring = new Graphics();
        ring.circle(cx, cy, radius);
        ring.stroke({ color: GAME_COLORS.primary, width: 0.75, alpha });
        root.addChild(ring);
    });

    // 4. Crosshairs — horizontal + vertical, faint
    const cross = new Graphics();
    cross
        .moveTo(cx - r + 4, cy)
        .lineTo(cx + r - 4, cy);
    cross
        .moveTo(cx, cy - r + 4)
        .lineTo(cx, cy + r - 4);
    cross.stroke({ color: GAME_COLORS.primary, width: 0.5, alpha: 0.18 });
    root.addChild(cross);

    // 5. Sweep line — from center at ~-35° from horizontal
    const sweepAngle = -Math.PI * 0.20;  // -36°
    const sweep = new Graphics();
    sweep
        .moveTo(cx, cy)
        .lineTo(cx + Math.cos(sweepAngle) * r * 0.92, cy + Math.sin(sweepAngle) * r * 0.92);
    sweep.stroke({ color: GAME_COLORS.primary, width: 1.5, alpha: 0.72 });
    root.addChild(sweep);

    // 6. Sweep wedge arc (thin triangle from center) — gives sweep glow feel
    const wedge = new Graphics();
    const wedgeSpan = Math.PI * 0.14;  // ~25° arc
    wedge.moveTo(cx, cy);
    wedge.arc(cx, cy, r * 0.88, sweepAngle - wedgeSpan, sweepAngle);
    wedge.closePath();
    wedge.fill({ color: GAME_COLORS.primary, alpha: 0.07 });
    root.addChild(wedge);

    // 7. Blip dots — scattered, different radii for depth
    const blips: [number, number, number][] = [
        [r * 0.52,  -Math.PI * 0.15, 2.0],   // near target on sweep side
        [r * 0.35,   Math.PI * 0.35, 1.5],
        [r * 0.70,   Math.PI * 0.68, 1.8],
        [r * 0.20,  -Math.PI * 0.52, 1.2],
    ];
    blips.forEach(([dist, angle, dotR]) => {
        const bx = cx + Math.cos(angle) * dist;
        const by = cy + Math.sin(angle) * dist;
        // Blip glow
        const glow = new Graphics();
        glow.circle(bx, by, dotR + 2);
        glow.fill({ color: GAME_COLORS.primary, alpha: 0.12 });
        root.addChild(glow);
        // Blip core
        const dot = new Graphics();
        dot.circle(bx, by, dotR);
        dot.fill({ color: GAME_COLORS.primary, alpha: 0.90 });
        root.addChild(dot);
    });

    // 8. Center dot (radar origin)
    const cDot = new Graphics();
    cDot.circle(cx, cy, 2.5);
    cDot.fill({ color: 0xffffff, alpha: 0.80 });
    root.addChild(cDot);

    // 9. Outer border ring — crisp definition
    const border = new Graphics();
    border.circle(cx, cy, r - 0.5);
    border.stroke({ color: GAME_COLORS.primary, width: 1.5, alpha: 0.62 });
    root.addChild(border);

    return root;
}

// ─── Flight insignia bars ─────────────────────────────────────────────────────

/**
 * Three stacked horizontal bars of decreasing length — LEFT EDGE ONLY.
 * Left-anchored to reinforce the left zone identity.
 */
function createFlightInsignia(): Container {
    const root   = new Container();
    const widths = [16, 11, 7];
    widths.forEach((w, i) => {
        const bar = new Graphics();
        bar.roundRect(0, i * 8, w, 2.5, 1);
        bar.fill({ color: GAME_COLORS.primary, alpha: 0.55 - i * 0.12 });
        root.addChild(bar);
    });
    return root;
}

// ─── Mission-ready chip ───────────────────────────────────────────────────────

function createReadyChip(
    text: string,
): { container: Container; chipW: number; chipH: number } {
    const container = new Container();
    const h     = 22;
    const padX  = 12;
    const dotGap = 8;
    const label = new Text({ text, style: helperTextStyle() });
    const chipW = label.width + padX + dotGap + padX;

    const bg = new Graphics();
    bg.roundRect(0, 0, chipW, h, h / 2);
    bg.fill({ color: 0x091a10, alpha: 0.84 });
    bg.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.52 });
    container.addChild(bg);

    const dot = new Graphics();
    dot.circle(padX, h / 2, 2.5);
    dot.fill({ color: GAME_COLORS.primary, alpha: 0.94 });
    container.addChild(dot);

    label.anchor.set(0, 0.5);
    label.position.set(padX + dotGap, h / 2);
    container.addChild(label);

    return { container, chipW, chipH: h };
}

// ─── Hero module ──────────────────────────────────────────────────────────────

export interface HeroModuleOptions {
    title:      string;   // 'VELOCITY'
    subtitle:   string;   // 'Voice-Powered Flight'
    hint:       string;   // 'Mic required · tap to begin'
    pilotRank?: string;   // 'CADET', 'ACE' etc.
}

/**
 * Build the complete hero identity module with ASYMMETRIC composition.
 * Left zone: title + waveform + subtitle (all left-aligned)
 * Right zone: circular radar cockpit display
 */
export function buildHeroModule(
    width:  number,
    height: number,
    opts:   HeroModuleOptions,
): Container {
    const root = new Container();

    // ── Radar sizing & positioning ────────────────────────────────────────
    const radarR  = Math.min(42, Math.max(30, Math.floor(height * 0.33)));
    const radarCX = width - radarR - 14;   // right side
    const radarCY = Math.floor(height * 0.42);

    // ── 1. Background — base dark fill ────────────────────────────────────
    const base = new Graphics();
    base.roundRect(0, 0, width, height, 14);
    base.fill({ color: 0x0a1520, alpha: 0.97 });
    root.addChild(base);

    // Angled identity strip — diagonal accent in upper-left, aviation feel
    const strip = new Graphics();
    strip.moveTo(0, height * 0.44);
    strip.lineTo(0, 0);
    strip.lineTo(width * 0.58, 0);
    strip.lineTo(width * 0.52, height * 0.44);
    strip.closePath();
    strip.fill({ color: 0x0f1e2e, alpha: 0.60 });
    root.addChild(strip);

    // ── 2. Outer border + top identity stripe + bottom rim ────────────────
    const border = new Graphics();
    border.roundRect(0.5, 0.5, width - 1, height - 1, 14);
    border.stroke({ color: GAME_COLORS.primary, width: 1.5, alpha: 0.52 });
    root.addChild(border);

    // Top identity stripe — strong anchor line
    const topStripe = new Graphics();
    topStripe.roundRect(14, 0, width * 0.55, 2.5, 1);
    topStripe.fill({ color: GAME_COLORS.primary, alpha: 0.85 });
    root.addChild(topStripe);

    // Short right-side top stripe (matches radar zone)
    const topStripeR = new Graphics();
    topStripeR.roundRect(width - 14 - radarR * 2 - 4, 0, radarR * 2 + 4, 2.5, 1);
    topStripeR.fill({ color: GAME_COLORS.primary, alpha: 0.38 });
    root.addChild(topStripeR);

    // Bottom rim accent
    const botRim = new Graphics();
    botRim.roundRect(18, height - 2, width - 36, 2, 1);
    botRim.fill({ color: GAME_COLORS.primary, alpha: 0.28 });
    root.addChild(botRim);

    // ── 3. Radar cockpit display (right zone) ─────────────────────────────
    const radar = createRadarDisplay(radarR);
    radar.position.set(radarCX - radarR, radarCY - radarR);
    root.addChild(radar);

    // Radar label — small "RADAR" tag below circle
    const radarLabel = new Text({
        text:  'RADAR',
        style: {
            fill:          GAME_COLORS.primary,
            fontSize:      7,
            fontFamily:    GAME_FONTS.arcade,
            letterSpacing: 2,
            alpha:         0.55,
        },
    });
    radarLabel.anchor.set(0.5, 0);
    radarLabel.position.set(radarCX, radarCY + radarR + 4);
    root.addChild(radarLabel);

    // ── 4. Flight insignia (left edge, vertical center) ───────────────────
    const insig = createFlightInsignia();
    insig.position.set(6, Math.floor(height * 0.28));
    root.addChild(insig);

    // ── 5. VELOCITY title — LEFT-ALIGNED ─────────────────────────────────
    const titleFontSize = Math.min(34, Math.max(26, Math.floor(height * 0.26)));
    const titleText = new Text({
        text:  opts.title,
        style: heroTitleStyle(titleFontSize),
    });
    titleText.anchor.set(0, 0);
    titleText.position.set(18, 8);
    root.addChild(titleText);

    // ── 6. Voice waveform — left-aligned, under title ─────────────────────
    const waveY    = titleText.y + titleFontSize + 6;
    const showWave = height >= 112;
    if (showWave) {
        const wave = createWaveformMotif();
        wave.position.set(18, waveY);
        root.addChild(wave);
    }

    // ── 7. Subtitle — left-aligned ────────────────────────────────────────
    const subtitleY = showWave ? waveY + WAVE_MAX_H + 6 : waveY + 6;
    const subText   = new Text({
        text:  opts.subtitle,
        style: heroSubtitleStyle(),
    });
    subText.anchor.set(0, 0);
    subText.position.set(18, subtitleY);
    root.addChild(subText);

    // ── 8. Bottom zone: chip + optional rank tag (left-aligned) ──────────
    const chipResult = createReadyChip(opts.hint);
    const chipY      = height - chipResult.chipH - 8;

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
                fill:          0x667788,
                fontSize:      7,
                fontFamily:    GAME_FONTS.arcade,
                letterSpacing: 2,
            },
        });
        const tagW  = Math.max(rankLabel.width, classLabel.width) + 16;

        const tagBg = new Graphics();
        tagBg.roundRect(0, 0, tagW, rankTagH, 4);
        tagBg.fill({ color: 0x0a1e14, alpha: 0.80 });
        tagBg.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.38 });

        const tagContainer = new Container();
        tagContainer.addChild(tagBg);
        classLabel.anchor.set(0.5, 0);
        classLabel.position.set(tagW / 2, 2);
        tagContainer.addChild(classLabel);
        rankLabel.anchor.set(0.5, 1);
        rankLabel.position.set(tagW / 2, rankTagH - 2);
        tagContainer.addChild(rankLabel);

        // Both left-aligned from x=18
        chipResult.container.position.set(18, chipY);
        root.addChild(chipResult.container);

        tagContainer.position.set(18 + chipResult.chipW + 8, chipY + 1);
        root.addChild(tagContainer);
    } else {
        chipResult.container.position.set(18, chipY);
        root.addChild(chipResult.container);
    }

    return root;
}
