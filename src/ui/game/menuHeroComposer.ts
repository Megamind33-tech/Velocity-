/**
 * menuHeroComposer — Velocity's game identity hero zone.
 *
 * Replaces the flat dark slab with a multi-layer, voice/flight-specific module.
 *
 * Composition (bottom → top):
 *   1. Layered background (base fill + upper brightness zone)
 *   2. Signal-arc motif (radar/pulse, behind title — depth layer)
 *   3. Outer border + top identity stripe + bottom rim
 *   4. Flight insignia bars (left + right edge accents)
 *   5. VELOCITY title
 *   6. Voice waveform bars (voice/signal identity motif)
 *   7. Subtitle
 *   8. Mission-ready chip (bottom — capsule with pulse dot)
 *
 * All shapes are pure PixiJS Graphics. No new art required.
 */

import { Container, Graphics, Text } from 'pixi.js';
import { GAME_COLORS, GAME_FONTS } from './GameUITheme';
import { helperTextStyle, heroSubtitleStyle, heroTitleStyle } from './menuTextStyles';

// ─── Waveform constants ───────────────────────────────────────────────────────

/** Relative bar heights — 9 bars, voice frequency profile. */
const WAVE_BARS  = [0.35, 0.62, 0.88, 1.00, 0.78, 0.95, 0.55, 0.72, 0.42];
const WAVE_BAR_W = 3;
const WAVE_GAP   = 2;
const WAVE_MAX_H = 14;
/** Pre-computed pixel width of the waveform motif. */
export const WAVEFORM_W = WAVE_BARS.length * (WAVE_BAR_W + WAVE_GAP) - WAVE_GAP; // 43

// ─── Voice waveform motif ─────────────────────────────────────────────────────

/**
 * 9-bar voice frequency motif.
 * Bars start at local x=0; total width = WAVEFORM_W.
 * Caller centres it with: `wave.x = (containerW - WAVEFORM_W) / 2`.
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
        bar.fill({ color: GAME_COLORS.primary, alpha: 0.35 + h * 0.44 });
        root.addChild(bar);
    });
    return root;
}

// ─── Signal arc motif ─────────────────────────────────────────────────────────

/** Concentric radar/pulse arcs — flight identity, sits behind title. */
function createSignalArcs(cx: number, cy: number, r: number): Graphics {
    const g = new Graphics();
    (
        [
            [r * 0.52, 0.055],
            [r * 0.76, 0.040],
            [r,        0.025],
        ] as [number, number][]
    ).forEach(([radius, alpha]) => {
        g.arc(cx, cy, radius, -Math.PI * 0.70, -Math.PI * 0.30);
        g.stroke({ color: GAME_COLORS.primary, width: 1, alpha });
    });
    return g;
}

// ─── Flight insignia bars ─────────────────────────────────────────────────────

/**
 * Three stacked horizontal bars of decreasing length.
 * `anchorRight=true` right-aligns bars (for the right edge).
 */
function createFlightInsignia(anchorRight: boolean): Container {
    const root   = new Container();
    const widths = [14, 10, 6];
    widths.forEach((w, i) => {
        const bar = new Graphics();
        bar.roundRect(anchorRight ? -w : 0, i * 7, w, 2, 1);
        bar.fill({ color: GAME_COLORS.primary, alpha: 0.40 - i * 0.10 });
        root.addChild(bar);
    });
    return root;
}

// ─── Mission-ready chip ───────────────────────────────────────────────────────

/**
 * Capsule chip with pulse dot — "Mic required · tap to begin".
 * Returns { container, chipW, chipH } so the caller can centre it.
 */
function createReadyChip(
    text: string,
): { container: Container; chipW: number; chipH: number } {
    const container = new Container();
    const h     = 22;
    const padX  = 12;
    const dotGap = 8;
    const label = new Text({ text, style: helperTextStyle() });
    const chipW = label.width + padX + dotGap + padX; // left pad + dot area + label + right pad

    const bg = new Graphics();
    bg.roundRect(0, 0, chipW, h, h / 2);   // capsule
    bg.fill({ color: 0x091a10, alpha: 0.84 });
    bg.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.52 });
    container.addChild(bg);

    // Pulse dot
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
    pilotRank?: string;   // 'CADET', 'ACE' etc. — optional mini tag
}

/**
 * Build the complete hero identity module.
 * Self-contained: title, subtitle, motifs, chip all inside.
 * Returns a Container sized to (width × height).
 */
export function buildHeroModule(
    width:  number,
    height: number,
    opts:   HeroModuleOptions,
): Container {
    const root = new Container();

    // ── 1. Background — two-layer fill ────────────────────────────────────
    // Base dark fill
    const base = new Graphics();
    base.roundRect(0, 0, width, height, 14);
    base.fill({ color: 0x0f1b2c, alpha: 0.97 });
    root.addChild(base);

    // Upper interior zone — slightly brighter so title has a clean surface
    const upper = new Graphics();
    upper.roundRect(2, 2, width - 4, height * 0.56, 12);
    upper.fill({ color: 0x192838, alpha: 0.55 });
    root.addChild(upper);

    // Interior horizontal divider line (separates hero upper / lower zones)
    const divLine = new Graphics();
    divLine
        .moveTo(18, height * 0.62)
        .lineTo(width - 18, height * 0.62);
    divLine.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.10 });
    root.addChild(divLine);

    // Outer border
    const border = new Graphics();
    border.roundRect(0.5, 0.5, width - 1, height - 1, 14);
    border.stroke({ color: GAME_COLORS.primary, width: 1.5, alpha: 0.52 });
    root.addChild(border);

    // Top identity stripe — strong anchor line, connects to title
    const topStripe = new Graphics();
    topStripe.roundRect(28, 0, width - 56, 2.5, 1);
    topStripe.fill({ color: GAME_COLORS.primary, alpha: 0.82 });
    root.addChild(topStripe);

    // Bottom rim accent
    const botRim = new Graphics();
    botRim.roundRect(22, height - 2, width - 44, 2, 1);
    botRim.fill({ color: GAME_COLORS.primary, alpha: 0.28 });
    root.addChild(botRim);

    // ── 2. Signal arc motif (radar / pulse depth layer) ───────────────────
    const arcs = createSignalArcs(width / 2, height * 0.40, width * 0.42);
    root.addChild(arcs);

    // ── 3. Flight insignia bars (left + right edge) ───────────────────────
    const insigY = height * 0.26;
    const leftIns = createFlightInsignia(false);
    leftIns.position.set(10, insigY);
    root.addChild(leftIns);

    const rightIns = createFlightInsignia(true);
    rightIns.position.set(width - 10, insigY);
    root.addChild(rightIns);

    // ── 4. VELOCITY title ─────────────────────────────────────────────────
    const titleFontSize = Math.min(36, Math.max(28, Math.floor(height * 0.27)));
    const titleText = new Text({
        text:  opts.title,
        style: heroTitleStyle(titleFontSize),
    });
    titleText.anchor.set(0.5, 0);
    titleText.position.set(width / 2, 10);
    root.addChild(titleText);

    // ── 5. Voice waveform motif ───────────────────────────────────────────
    const waveY    = titleText.y + titleFontSize + 5;
    const showWave = height >= 112;
    if (showWave) {
        const wave = createWaveformMotif();
        wave.position.set((width - WAVEFORM_W) / 2, waveY);
        root.addChild(wave);
    }

    // ── 6. Subtitle ───────────────────────────────────────────────────────
    const subtitleY = showWave ? waveY + WAVE_MAX_H + 5 : waveY;
    const subText   = new Text({
        text:  opts.subtitle,
        style: heroSubtitleStyle(),
    });
    subText.anchor.set(0.5, 0);
    subText.position.set(width / 2, subtitleY);
    root.addChild(subText);

    // ── 7. Bottom zone: mission-ready chip + optional pilot class tag ─────
    const chipResult = createReadyChip(opts.hint);
    const chipY      = height - chipResult.chipH - 8;
    let   totalBottomW = chipResult.chipW;

    if (opts.pilotRank) {
        // Small rank tag to the right of the ready chip
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
                fill:       0x667788,
                fontSize:   7,
                fontFamily: GAME_FONTS.arcade,
                letterSpacing: 2,
            },
        });
        const tagW  = Math.max(rankLabel.width, classLabel.width) + 16;
        totalBottomW += 8 + tagW;

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

        const startX    = (width - totalBottomW) / 2;
        chipResult.container.position.set(startX, chipY);
        root.addChild(chipResult.container);

        tagContainer.position.set(startX + chipResult.chipW + 8, chipY + 1);
        root.addChild(tagContainer);
    } else {
        chipResult.container.position.set((width - chipResult.chipW) / 2, chipY);
        root.addChild(chipResult.container);
    }

    return root;
}
