/**
 * GameUITheme: Velocity's Design System
 * Game-focused, using Velocity's actual color palette and aesthetic
 */

/**
 * Velocity Color Palette
 * Based on the game's existing design language
 */
export const GAME_COLORS = {
    // Primary brand color (Velocity cyan)
    primary: 0x00ffcc,      // Bright cyan - main accent
    primaryDark: 0x00aa99,  // Darker cyan for hover/active states

    // Backgrounds
    bg_darkest: 0x0a0a1a,   // Almost black (main background)
    bg_dark: 0x1a1a3a,      // Dark blue-black (panels)
    bg_medium: 0x2a2a4a,    // Medium dark (secondary panels)

    // Accents
    accent_gold: 0xffcc00,  // Gold for highlights
    accent_red: 0xff3300,   // Red for warnings/danger
    accent_green: 0x00ff00, // Green for success
    accent_orange: 0xff6600, // Orange for info

    // Text
    text_primary: 0xffffff,    // White for main text
    text_secondary: 0xcccccc,  // Light gray for secondary
    text_muted: 0x999999,      // Gray for disabled/muted
    text_accent: 0x00ffcc,     // Cyan for emphasis

    // UI elements
    border_primary: 0x00ffcc,  // Cyan borders
    border_secondary: 0x666666, // Gray borders
    glow_color: 0x00ffcc,      // Cyan glow

    // Game specific
    hud_bg: 0x111122,          // Very dark for HUD panels
    panel_bg: 0x1a1a3a,        // Dark panel background

    /** In-run HUD copy (readable on light Kenney chrome) */
    hud_score_value: 0xffcc00,
    hud_level_value: 0x00ffcc,
    hud_alt: 0xffaa44,
    hud_spd: 0x66ddff,
    hud_vocal_label: 0x00ffcc,
};

/**
 * Font Configuration
 * Primary: Kenney Future — game-native typeface from Kenney UI Pack (CC0)
 * Narrow variant for HUD chips where horizontal space is constrained
 */
export const GAME_FONTS = {
    /** Kenney Future — primary game typeface. Falls back to Orbitron → system. */
    arcade: "'Kenney Future', 'Kenney Future Narrow', Orbitron, 'Arial Narrow', Arial, sans-serif",
    /** Kenney Future Narrow — compact HUD / chip labels. */
    narrow: "'Kenney Future Narrow', 'Kenney Future', Orbitron, 'Arial Narrow', Arial, sans-serif",
    standard: "'Kenney Future', Orbitron, Arial, sans-serif",
    monospace: "'Kenney Future Narrow', 'Courier New', monospace",
};

/**
 * Size System
 */
export const GAME_SIZES = {
    // Button sizes (scaled for touch on mobile)
    button: {
        small: { width: 70, height: 35 },
        medium: { width: 120, height: 45 },
        large: { width: 160, height: 55 },
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

    // Corner radius
    radius: {
        small: 4,
        medium: 8,
        large: 12,
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
 * Button Style Configuration
 */
export const GAME_BUTTON_STYLES = {
    // Primary action (cyan)
    primary: {
        bg: GAME_COLORS.hud_bg,
        text: GAME_COLORS.primary,
        border: GAME_COLORS.primary,
        hover_bg: GAME_COLORS.bg_medium,
        hover_border: GAME_COLORS.primary,
        font_size: GAME_SIZES.font.lg,
        font_weight: 'bold',
    },

    // Secondary action (gray)
    secondary: {
        bg: GAME_COLORS.hud_bg,
        text: GAME_COLORS.text_secondary,
        border: GAME_COLORS.border_secondary,
        hover_bg: GAME_COLORS.bg_medium,
        hover_border: GAME_COLORS.border_secondary,
        font_size: GAME_SIZES.font.base,
        font_weight: 'normal',
    },

    // Danger action (red)
    danger: {
        bg: GAME_COLORS.hud_bg,
        text: GAME_COLORS.accent_red,
        border: GAME_COLORS.accent_red,
        hover_bg: GAME_COLORS.bg_medium,
        hover_border: GAME_COLORS.accent_red,
        font_size: GAME_SIZES.font.lg,
        font_weight: 'bold',
    },

    // Success action (green)
    success: {
        bg: GAME_COLORS.hud_bg,
        text: GAME_COLORS.accent_green,
        border: GAME_COLORS.accent_green,
        hover_bg: GAME_COLORS.bg_medium,
        hover_border: GAME_COLORS.accent_green,
        font_size: GAME_SIZES.font.lg,
        font_weight: 'bold',
    },

    // Accent action (gold)
    accent: {
        bg: GAME_COLORS.hud_bg,
        text: GAME_COLORS.accent_gold,
        border: GAME_COLORS.accent_gold,
        hover_bg: GAME_COLORS.bg_medium,
        hover_border: GAME_COLORS.accent_gold,
        font_size: GAME_SIZES.font.lg,
        font_weight: 'bold',
    },
};

/**
 * Panel Style Configuration
 */
export const GAME_PANEL_STYLES = {
    // Standard game panel
    default: {
        bg: GAME_COLORS.panel_bg,
        border: GAME_COLORS.primary,
        border_width: GAME_SIZES.border.normal,
        corner_radius: GAME_SIZES.radius.medium,
        padding: GAME_SIZES.spacing.lg,
        bg_alpha: 0.95,
    },

    // HUD panel (always visible)
    hud: {
        bg: GAME_COLORS.hud_bg,
        border: GAME_COLORS.primary,
        border_width: GAME_SIZES.border.thin,
        corner_radius: GAME_SIZES.radius.small,
        padding: GAME_SIZES.spacing.md,
        bg_alpha: 0.8,
    },

    // Modal/overlay panel
    modal: {
        bg: GAME_COLORS.bg_dark,
        border: GAME_COLORS.primary,
        border_width: GAME_SIZES.border.thick,
        corner_radius: GAME_SIZES.radius.large,
        padding: GAME_SIZES.spacing.xl,
        bg_alpha: 0.98,
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
