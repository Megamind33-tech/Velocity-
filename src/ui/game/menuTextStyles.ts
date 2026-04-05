/**
 * menuTextStyles — shared text style factories for Velocity's menu screens.
 *
 * Font system (AAA-Quality spec):
 *   - Display: Orbitron (screen titles, hero text)
 *   - Functional: Exo 2 (all body, buttons, cards, nav)
 *   - Numerical: Oxanium (currency, stats, timers, HUD values)
 *
 * Color system (spec palette):
 *   - Primary text: #F0F0F0 (never pure white)
 *   - Secondary text: #9CA3AF
 *   - Disabled text: #4B5563
 *   - Interactive/Info: #00D1FF (cyan)
 *   - Success: #22C55E (green)
 *   - Danger: #EF4444 (red)
 *
 * Readability discipline:
 *   - No dropShadow blur > 3 anywhere
 *   - Contrast achieved through fill value, not glow radius
 *   - Stroke for crisp edge definition, not decoration
 *   - Shadow kept to 1–2 px distance, alpha ≤ 0.70
 *   - Visual hierarchy maintained throughout
 */

import { TextStyle } from 'pixi.js';
import { GAME_FONTS, GAME_COLORS } from './GameUITheme';

const F = GAME_FONTS.functional;  // Exo 2
const C = GAME_COLORS;

// ─────────────────────────────────────────────────────────────────────────────
// Hero region
// ─────────────────────────────────────────────────────────────────────────────

/**
 * VELOCITY hero title - screen titles, main headings.
 * Spec text color #F0F0F0 (never pure white) for better anti-aliasing.
 * Thin dark stroke for crisp edge definition on dark background.
 * Subtle directional shadow for depth.
 */
export function heroTitleStyle(fontSize: number): TextStyle {
    return new TextStyle({
        fill:          C.text_primary,              // #F0F0F0
        fontSize,
        fontWeight:    'bold',
        fontFamily:    F,                           // Exo 2
        letterSpacing: 1,
        stroke:        { color: C.bg_base, width: 1 },
        dropShadow:    { alpha: 0.5, blur: 1, color: C.bg_base, distance: 1 },
    });
}

/**
 * Subtitle - secondary to hero title, like "Voice-Powered Flight".
 * Secondary text color #9CA3AF - clearly subordinate but fully legible.
 */
export function heroSubtitleStyle(): TextStyle {
    return new TextStyle({
        fill:          C.text_secondary,           // #9CA3AF
        fontSize:      14,
        fontWeight:    'normal',
        fontFamily:    F,                          // Exo 2
        letterSpacing: 0.5,
        dropShadow:    { alpha: 0.3, blur: 1, color: C.bg_base, distance: 1 },
    });
}

/**
 * Helper text - support labels like "Mic required · tap to begin".
 * Secondary color, readable but clearly subordinate.
 */
export function helperTextStyle(): TextStyle {
    return new TextStyle({
        fill:          C.text_secondary,           // #9CA3AF
        fontSize:      10,
        fontFamily:    F,                          // Exo 2
        letterSpacing: 0.5,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// HUD chips
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HUD micro-labels — BEST / SECTOR / ROUTES / PILOT.
 * Small but crisp using disabled text color, tight letter-spacing.
 * Uses Oxanium for numerical context.
 */
export function hudLabelStyle(): TextStyle {
    return new TextStyle({
        fill:          C.text_disabled,            // #4B5563
        fontSize:      9,
        fontFamily:    GAME_FONTS.numerical,       // Oxanium for data labels
        letterSpacing: 1,
    });
}

/**
 * HUD stat value — numeric or short string.
 * Receives the accent colour from the caller (gold / cyan / green).
 * Uses Oxanium font for numerical emphasis.
 * Minimal shadow for depth without obscuring text.
 */
export function hudValueStyle(fill: number): TextStyle {
    return new TextStyle({
        fill,
        fontSize:      13,
        fontWeight:    'bold',
        fontFamily:    GAME_FONTS.numerical,       // Oxanium
        dropShadow:    { alpha: 0.4, blur: 1, color: C.bg_base, distance: 1 },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Button labels
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Primary button label — "FLY NOW", dominant CTA.
 * Dark text (#0D1117) on gold background (#FFD166) for maximum contrast.
 * Bold weight for visual prominence.
 */
export function primaryButtonLabelStyle(): TextStyle {
    return new TextStyle({
        fill:          C.bg_base,                  // #0D1117 (dark on light)
        fontSize:      16,
        fontWeight:    'bold',
        fontFamily:    F,                          // Exo 2
        align:         'center',
        letterSpacing: 1,
        stroke:        { color: C.bg_modal, width: 0.5 },
        dropShadow:    { alpha: 0.3, blur: 1, color: C.bg_base, distance: 1 },
    });
}

/**
 * Utility button label — LEADERBOARD, ACHIEVEMENTS, secondary tier.
 * Primary text color on dark surface for good contrast.
 * Clearly readable but subordinate to primary CTA.
 */
export function utilityButtonLabelStyle(): TextStyle {
    return new TextStyle({
        fill:          C.text_primary,             // #F0F0F0
        fontSize:      13,
        fontWeight:    'bold',
        fontFamily:    F,                          // Exo 2
        align:         'center',
        letterSpacing: 0.5,
        stroke:        { color: C.bg_base, width: 0.5 },
        dropShadow:    { alpha: 0.3, blur: 1, color: C.bg_base, distance: 1 },
    });
}

/**
 * Economy button label — STORE, REWARDS, economy tier.
 * Primary text color on dark surface for readability.
 * Slightly larger than utility buttons for economic emphasis.
 */
export function economyButtonLabelStyle(): TextStyle {
    return new TextStyle({
        fill:          C.text_primary,             // #F0F0F0
        fontSize:      14,
        fontWeight:    'bold',
        fontFamily:    F,                          // Exo 2
        align:         'center',
        letterSpacing: 0.5,
        stroke:        { color: C.bg_base, width: 0.5 },
        dropShadow:    { alpha: 0.3, blur: 1, color: C.bg_base, distance: 1 },
    });
}

/**
 * Footer utility label — SETTINGS, lowest priority utility.
 * Secondary text color for clear visual hierarchy.
 * Legible at a glance but clearly subordinate to main buttons.
 */
export function footerUtilityLabelStyle(): TextStyle {
    return new TextStyle({
        fill:          C.text_secondary,           // #9CA3AF
        fontSize:      12,
        fontWeight:    'bold',
        fontFamily:    F,                          // Exo 2
        letterSpacing: 0.5,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Status strip
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pilot rank value — CADET / PILOT / ACE / ELITE etc.
 * Cyan/interactive color (#00D1FF), bold, small directional shadow.
 * Uses Oxanium for data emphasis.
 */
export function pilotRankStyle(): TextStyle {
    return new TextStyle({
        fill:          C.accent_cyan,              // #00D1FF
        fontSize:      13,
        fontWeight:    'bold',
        fontFamily:    GAME_FONTS.numerical,       // Oxanium
        letterSpacing: 0.5,
        dropShadow:    { alpha: 0.3, blur: 1, color: C.bg_base, distance: 1 },
    });
}
