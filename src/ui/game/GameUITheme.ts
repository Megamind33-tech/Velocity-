/**
 * GameUITheme: Velocity's Design System
 * Game-focused, using Velocity's actual color palette and aesthetic
 */

/**
 * VELOCITY COLOR SYSTEM (AAA-Quality Mobile Game UI)
 * Mandatory palette - NO DEVIATIONS
 *
 * Three elevation levels with precise opacity cascading:
 *   Background Base → Surface Layer (+7%) → Elevated Surface (+10%) → Modal (+15%)
 *
 * Semantic color usage (STRICT ENFORCEMENT):
 *   Gold (#FFD166) - PRIMARY CTAs, currency ONLY
 *   Cyan (#00D1FF) - Interactive elements, info ONLY
 *   Purple (#A259FF) - Rewards/achievements ONLY
 *   Green (#22C55E) - Success/claims
 *   Red (#EF4444) - Danger/warnings
 */
export const GAME_COLORS = {
    // BACKGROUND ELEVATION SYSTEM
    // Layer 0: Deepest space black with blue undertone
    bg_base: 0x0D1117,

    // Layer 1: Cards, panels, surfaces (1st elevation)
    // 7% lighter than base for subtle depth
    bg_surface: 0x1A1A2E,

    // Layer 2: Elevated content - modals, active panels (2nd elevation)
    // 10% lighter than surface for clear hierarchy
    bg_elevated: 0x252540,

    // Layer 3: Modal/overlay highest elevation (3rd level)
    // 15% lighter than elevated for maximum prominence
    bg_modal: 0x2F2F4A,

    // PRIMARY ACTION COLORS
    // Gold - ONLY on FLY NOW, primary CTAs, currency indicators, premium items
    primary_cta: 0xFFD166,

    // Cyan - ONLY on interactive elements, navigation highlights, info accents
    accent_cyan: 0x00D1FF,

    // Purple - ONLY on achievement badges, reward notifications, epic/rare items
    accent_purple: 0xA259FF,

    // SEMANTIC COLORS
    // Success - claim confirmations, completion states
    success: 0x22C55E,

    // Danger - warnings, alerts, low fuel, critical states
    danger: 0xEF4444,

    // TEXT COLORS
    // Primary body text (never pure white #FFFFFF)
    text_primary: 0xF0F0F0,

    // Labels, captions, metadata
    text_secondary: 0x9CA3AF,

    // Inactive/disabled elements
    text_disabled: 0x4B5563,

    // BACKWARDS COMPATIBILITY (mapped to new system)
    primary: 0x00D1FF,              // Cyan (interactive)
    primaryDark: 0x00A8CC,          // Darker cyan
    accent_gold: 0xFFD166,          // Gold
    accent_red: 0xEF4444,           // Red danger
    accent_green: 0x22C55E,         // Green success
    accent_orange: 0xFFD166,        // Orange → gold
    text_muted: 0x4B5563,           // Disabled text
    text_accent: 0x00D1FF,          // Cyan accent
    border_primary: 0x00D1FF,       // Cyan borders
    border_secondary: 0x4B5563,     // Gray borders
    glow_color: 0x00D1FF,           // Cyan glow
    bg_darkest: 0x0D1117,           // Base background (for shadow/contrast)
    bg_dark: 0x1A1A2E,              // Alias for surface
    bg_medium: 0x252540,            // Alias for elevated
    hud_bg: 0x1A1A2E,               // Surface layer
    panel_bg: 0x1A1A2E,             // Surface layer
    hud_score_value: 0xFFD166,      // Gold
    hud_level_value: 0x00D1FF,      // Cyan
    hud_alt: 0xFFD166,              // Gold
    hud_spd: 0x00D1FF,              // Cyan
    hud_vocal_label: 0x00D1FF,      // Cyan
};

/**
 * Font Configuration (AAA-Quality Mobile Game UI)
 * Display: Orbitron (28-32pt, screen titles, hero text)
 * Functional UI: Exo 2 (all body text, buttons, cards, navigation)
 * Numerical Data: Oxanium (currency, stats, timers, HUD values)
 *
 * All fonts from Google Fonts (OFL License - commercial use OK)
 */
export const GAME_FONTS = {
    /** Display font for screen titles and hero text */
    display: "'Orbitron', sans-serif",
    /** Primary functional UI font - body text, buttons, cards, nav */
    functional: "'Exo 2', sans-serif",
    /** Numerical data font - currency, stats, timers */
    numerical: "'Oxanium', monospace",

    // Backwards compatibility aliases
    arcade: "'Exo 2', sans-serif",
    narrow: "'Exo 2', sans-serif",
    standard: "'Exo 2', sans-serif",
    monospace: "'Oxanium', monospace",
};

/**
 * Size System
 */
export const GAME_SIZES = {
    // Button sizes (8px grid + minimum 48px touch target per Google/Apple HIG)
    button: {
        small: { width: 80, height: 40 },
        medium: { width: 120, height: 48 },
        large: { width: 160, height: 56 },
    },

    // Font sizes
    font: {
        xs: 10,
        sm: 12,
        base: 14,
        lg: 16,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        title: 48,
        /** HUD micro-label (SCORE / LV / ALT / SPD headers) — stays subordinate */
        hud_label: 9,
        /** HUD major value (score counter) — must dominate at a glance */
        hud_major: 26,
        /** HUD secondary value (level, sector) — readable but below major */
        hud_secondary: 18,
        /** HUD detail value (alt, speed) — compact but legible */
        hud_detail: 13,
        /** Reward card token amount — creates desire */
        reward_value: 22,
        /** Celebration score on Level Complete / Game Over */
        score_hero: 36,
    },

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    },

    // Borders
    border: {
        thin: 1,
        normal: 2,
        thick: 3,
    },

    // Corner radius (per spec: 8px buttons, 12px cards, 16px modals)
    radius: {
        small: 8,    // Button radius (was 4)
        medium: 12,  // Card radius (was 8)
        large: 16,   // Modal radius (was 12)
    },

    // Panel sizes
    panel: {
        small: { width: 280, height: 180 },
        medium: { width: 400, height: 300 },
        large: { width: 500, height: 400 },
        fullscreen: { width: 0, height: 0 }, // Dynamic based on screen
    },
};

/**
 * Button Style Configuration (AAA-Quality Standard)
 *
 * Four-state button system:
 * - Default: Base state
 * - Hover/Focus: Elevated with drop shadow
 * - Pressed: Compressed with scale 0.97
 * - Disabled: Grayed out, no interaction
 *
 * All buttons use touch target minimum 48×48px
 */
export const GAME_BUTTON_STYLES = {
    // PRIMARY CTA (Gold - "FLY NOW" style)
    // 56px height, full width minus margins, gradient background
    primary: {
        bg: GAME_COLORS.primary_cta,  // #FFD166 gold
        text: GAME_COLORS.bg_base,    // Dark text on light background
        border: GAME_COLORS.primary_cta,
        hover_bg: GAME_COLORS.bg_elevated,
        hover_border: GAME_COLORS.primary_cta,
        font_size: 18,
        font_weight: 'bold',
        height: 56,
    },

    // SECONDARY ACTION (Cyan - interactive/info)
    secondary: {
        bg: GAME_COLORS.bg_surface,
        text: GAME_COLORS.accent_cyan,
        border: GAME_COLORS.accent_cyan,
        hover_bg: GAME_COLORS.bg_elevated,
        hover_border: GAME_COLORS.accent_cyan,
        font_size: GAME_SIZES.font.base,
        font_weight: 'normal',
    },

    // DANGER ACTION (Red - warnings/alerts)
    danger: {
        bg: GAME_COLORS.bg_surface,
        text: GAME_COLORS.danger,
        border: GAME_COLORS.danger,
        hover_bg: GAME_COLORS.bg_elevated,
        hover_border: GAME_COLORS.danger,
        font_size: GAME_SIZES.font.lg,
        font_weight: 'bold',
    },

    // SUCCESS ACTION (Green - claims/completion)
    success: {
        bg: GAME_COLORS.bg_surface,
        text: GAME_COLORS.success,
        border: GAME_COLORS.success,
        hover_bg: GAME_COLORS.bg_elevated,
        hover_border: GAME_COLORS.success,
        font_size: GAME_SIZES.font.lg,
        font_weight: 'bold',
    },

    // ACCENT ACTION (Gold - rewards/premium)
    accent: {
        bg: GAME_COLORS.bg_surface,
        text: GAME_COLORS.primary_cta,
        border: GAME_COLORS.primary_cta,
        hover_bg: GAME_COLORS.bg_elevated,
        hover_border: GAME_COLORS.primary_cta,
        font_size: GAME_SIZES.font.lg,
        font_weight: 'bold',
    },
};

/**
 * Panel Style Configuration (Glassmorphism Design System)
 *
 * Three elevation levels with corresponding background colors and opacity:
 * - Standard: Surface layer (#1A1A2E)
 * - HUD: Surface with reduced opacity for transparency effect
 * - Modal: Elevated layer (#252540) with highest prominence
 *
 * Glassmorphism specs:
 * - Cyan border at 15% opacity for subtle accent
 * - Drop shadow for depth
 * - Blur effect (handled in rendering layer)
 */
export const GAME_PANEL_STYLES = {
    // Standard game panel (1st elevation)
    default: {
        bg: GAME_COLORS.bg_surface,         // #1A1A2E
        border: GAME_COLORS.accent_cyan,    // #00D1FF at 15% opacity
        border_width: GAME_SIZES.border.thin,
        corner_radius: 12,                  // 12px per spec
        padding: 16,                        // 16px per spec
        bg_alpha: 0.85,                     // 85% opacity for glassmorphism
    },

    // HUD panel (always visible, 1st elevation)
    hud: {
        bg: GAME_COLORS.bg_surface,         // #1A1A2E
        border: GAME_COLORS.accent_cyan,    // #00D1FF
        border_width: GAME_SIZES.border.thin,
        corner_radius: 12,
        padding: 16,
        bg_alpha: 0.80,                     // 80% opacity for nav bars
    },

    // Modal/overlay panel (2nd elevation)
    modal: {
        bg: GAME_COLORS.bg_elevated,        // #252540
        border: GAME_COLORS.accent_cyan,    // #00D1FF at 25% opacity
        border_width: GAME_SIZES.border.thin,
        corner_radius: 16,                  // 16px for modals per spec
        padding: 24,                        // 24px per spec
        bg_alpha: 0.90,                     // 90% opacity for elevated elevation
    },
};

/**
 * Animation Configuration
 */
export const GAME_ANIMATIONS = {
    // Transition durations (ms)
    fast: 150,
    normal: 300,
    slow: 500,

    // Easing functions (simplified)
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
    easeIn: (t: number) => Math.pow(t, 3),
};

/**
 * Helper function to create button style objects
 */
export function getButtonStyle(type: 'primary' | 'secondary' | 'danger' | 'success' | 'accent' = 'primary') {
    return GAME_BUTTON_STYLES[type];
}

/**
 * Helper function to create panel style objects
 */
export function getPanelStyle(type: 'default' | 'hud' | 'modal' = 'default') {
    return GAME_PANEL_STYLES[type];
}
