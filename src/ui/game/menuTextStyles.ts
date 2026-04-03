/**
 * menuTextStyles — shared text style factories for Velocity's menu screens.
 *
 * Readability discipline (per brief):
 *   - No dropShadow blur > 3 anywhere.
 *   - Contrast achieved through fill value, not glow radius.
 *   - Stroke used for crisp pixel-edge definition, not decoration.
 *   - Shadow kept to 1–2 px distance, alpha ≤ 0.70.
 *   - Do not make everything equally bright — hierarchy is enforced.
 *
 * Hierarchy (strongest → quietest):
 *   heroTitle  >  primaryButtonLabel  >  utilityButtonLabel / economyButtonLabel
 *     >  heroSubtitle  >  hudValue  >  pilotRank
 *     >  hudLabel  >  helperText  >  footerUtilityLabel
 */

import { TextStyle } from 'pixi.js';
import { GAME_FONTS } from './GameUITheme';

const F = GAME_FONTS.arcade;

// ─────────────────────────────────────────────────────────────────────────────
// Hero region
// ─────────────────────────────────────────────────────────────────────────────

/**
 * VELOCITY hero title.
 * Pure white fill → maximum contrast on any dark background.
 * Thin dark stroke prevents colour bleeding at edges.
 * 2 px directional shadow creates depth; blur capped at 2.
 */
export function heroTitleStyle(fontSize: number): TextStyle {
    return new TextStyle({
        fill:          0xffffff,
        fontSize,
        fontWeight:    'bold',
        fontFamily:    F,
        letterSpacing: 4,
        stroke:        { color: 0x002a18, width: 1.5 },
        dropShadow:    { alpha: 0.65, blur: 2, color: 0x001810, distance: 2 },
    });
}

/**
 * "Voice-Powered Flight" subtitle.
 * Cool near-white, clearly subordinate to title, but fully legible.
 */
export function heroSubtitleStyle(): TextStyle {
    return new TextStyle({
        fill:          0xddeeff,
        fontSize:      14,
        fontWeight:    'normal',
        fontFamily:    F,
        letterSpacing: 1,
        dropShadow:    { alpha: 0.40, blur: 1, color: 0x000810, distance: 1 },
    });
}

/**
 * "Mic required · tap to begin" helper tip.
 * Must feel like support text — present and readable, not ghosted.
 */
export function helperTextStyle(): TextStyle {
    return new TextStyle({
        fill:          0xaec8d8,
        fontSize:      10,
        fontFamily:    F,
        letterSpacing: 0.5,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// HUD chips
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HUD micro-labels — BEST / SECTOR / ROUTES / PILOT.
 * Small but crisp: brighter than text_muted, tight letter-spacing.
 */
export function hudLabelStyle(): TextStyle {
    return new TextStyle({
        fill:          0x8899aa,
        fontSize:      9,
        fontFamily:    F,
        letterSpacing: 1.5,
    });
}

/**
 * HUD stat value — numeric or short string.
 * Receives the accent colour from the caller (gold / cyan / steel).
 * Minimal 1 px sharp shadow only — no blur haze.
 */
export function hudValueStyle(fill: number): TextStyle {
    return new TextStyle({
        fill,
        fontSize:      13,
        fontWeight:    'bold',
        fontFamily:    F,
        dropShadow:    { alpha: 0.50, blur: 1, color: 0x000000, distance: 1 },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Button labels
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MISSION SELECT — dominant CTA.
 * White fill + thin dark stroke = maximum punch.
 * 2 px blur max — no neon fuzz.
 */
export function primaryButtonLabelStyle(): TextStyle {
    return new TextStyle({
        fill:          0xffffff,
        fontSize:      16,
        fontWeight:    'bold',
        fontFamily:    F,
        align:         'center',
        letterSpacing: 2.5,
        stroke:        { color: 0x002816, width: 1 },
        dropShadow:    { alpha: 0.60, blur: 2, color: 0x001810, distance: 1 },
    });
}

/**
 * LEADERBOARD / ACHIEVEMENTS — utility tier.
 * Near-white on steel-blue: high contrast without competing with CTA.
 */
export function utilityButtonLabelStyle(): TextStyle {
    return new TextStyle({
        fill:          0xeef6ff,
        fontSize:      13,
        fontWeight:    'bold',
        fontFamily:    F,
        align:         'center',
        letterSpacing: 1.5,
        stroke:        { color: 0x00101e, width: 0.75 },
        dropShadow:    { alpha: 0.50, blur: 1.5, color: 0x000e1e, distance: 1 },
    });
}

/**
 * STORE / REWARDS — economy tier.
 * Warm cream-white on amber: clearly readable, warm feeling.
 */
export function economyButtonLabelStyle(): TextStyle {
    return new TextStyle({
        fill:          0xfff8e0,
        fontSize:      14,
        fontWeight:    'bold',
        fontFamily:    F,
        align:         'center',
        letterSpacing: 1.5,
        stroke:        { color: 0x2a1000, width: 0.75 },
        dropShadow:    { alpha: 0.50, blur: 1.5, color: 0x2a1000, distance: 1 },
    });
}

/**
 * SETTINGS footer row — lowest priority utility.
 * Legible at a glance, clearly secondary to every button above it.
 */
export function footerUtilityLabelStyle(): TextStyle {
    return new TextStyle({
        fill:          0x99b8cc,
        fontSize:      12,
        fontWeight:    'bold',
        fontFamily:    F,
        letterSpacing: 2.5,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Status strip
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pilot rank value — CADET / PILOT / ACE / ELITE etc.
 * Cyan, bold. Small directional shadow for depth; blur kept at 2.
 */
export function pilotRankStyle(): TextStyle {
    return new TextStyle({
        fill:          0x00ffcc,
        fontSize:      13,
        fontWeight:    'bold',
        fontFamily:    F,
        letterSpacing: 1,
        dropShadow:    { alpha: 0.40, blur: 2, color: 0x003322, distance: 1 },
    });
}
