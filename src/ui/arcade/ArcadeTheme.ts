/**
 * Arcade Theme Configuration
 * Neon colors, retro styling, authentic arcade aesthetic
 */

export const ARCADE_COLORS = {
    // Primary neon colors
    neonCyan: 0x00ffff,      // Bright cyan/aqua
    neonMagenta: 0xff00ff,   // Hot pink/magenta
    neonYellow: 0xffff00,    // Bright yellow
    neonGreen: 0x00ff00,     // Bright green
    neonRed: 0xff0000,       // Bright red
    neonOrange: 0xff6600,    // Orange

    // Dark backgrounds
    darkBg: 0x0a0a1a,        // Very dark blue/black
    mediumBg: 0x1a1a3a,      // Dark blue
    panelBg: 0x111122,       // Dark panel background

    // Neutrals
    white: 0xffffff,
    black: 0x000000,
    gray: 0x666666,

    // Game specific
    primary: 0x00ffcc,       // Cyan (Velocity theme)
    secondary: 0xff0099,     // Magenta
    accent: 0xffcc00,        // Yellow
};

export const ARCADE_FONTS = {
    primary: 'Orbitron, Arial, sans-serif',     // Arcade font
    secondary: 'Arial, sans-serif',              // Fallback
    monospace: 'Courier New, monospace',         // For scores
};

export const ARCADE_SIZES = {
    // Button sizes
    buttonSmall: { width: 80, height: 40 },
    buttonMedium: { width: 120, height: 50 },
    buttonLarge: { width: 160, height: 60 },

    // Text sizes
    fontSize: {
        tiny: 12,
        small: 14,
        medium: 18,
        large: 24,
        xlarge: 32,
        xxlarge: 48,
    },

    // Spacing
    padding: 16,
    margin: 8,
    borderWidth: 2,
    cornerRadius: 8,

    // Panel sizes
    panelSmall: { width: 300, height: 200 },
    panelMedium: { width: 500, height: 350 },
    panelLarge: { width: 700, height: 500 },
};

export interface ArcadeButtonStyle {
    backgroundColor: number;
    textColor: number;
    borderColor: number;
    hoverColor?: number;
    fontSize: number;
    fontFamily: string;
    borderWidth: number;
    cornerRadius: number;
}

export const ARCADE_BUTTON_STYLES = {
    // Primary action button (cyan/neon)
    primary: {
        backgroundColor: ARCADE_COLORS.darkBg,
        textColor: ARCADE_COLORS.neonCyan,
        borderColor: ARCADE_COLORS.neonCyan,
        hoverColor: ARCADE_COLORS.neonCyan,
        fontSize: 16,
        fontFamily: ARCADE_FONTS.primary,
        borderWidth: 2,
        cornerRadius: 8,
    },

    // Secondary button (magenta)
    secondary: {
        backgroundColor: ARCADE_COLORS.darkBg,
        textColor: ARCADE_COLORS.neonMagenta,
        borderColor: ARCADE_COLORS.neonMagenta,
        hoverColor: ARCADE_COLORS.neonMagenta,
        fontSize: 16,
        fontFamily: ARCADE_FONTS.primary,
        borderWidth: 2,
        cornerRadius: 8,
    },

    // Danger button (red)
    danger: {
        backgroundColor: ARCADE_COLORS.darkBg,
        textColor: ARCADE_COLORS.neonRed,
        borderColor: ARCADE_COLORS.neonRed,
        hoverColor: ARCADE_COLORS.neonRed,
        fontSize: 16,
        fontFamily: ARCADE_FONTS.primary,
        borderWidth: 2,
        cornerRadius: 8,
    },

    // Success button (green)
    success: {
        backgroundColor: ARCADE_COLORS.darkBg,
        textColor: ARCADE_COLORS.neonGreen,
        borderColor: ARCADE_COLORS.neonGreen,
        hoverColor: ARCADE_COLORS.neonGreen,
        fontSize: 16,
        fontFamily: ARCADE_FONTS.primary,
        borderWidth: 2,
        cornerRadius: 8,
    },
};

export const ARCADE_PANEL_STYLE = {
    backgroundColor: ARCADE_COLORS.panelBg,
    borderColor: ARCADE_COLORS.primary,
    borderWidth: 3,
    cornerRadius: 12,
    padding: 16,
    shadowColor: ARCADE_COLORS.primary,
    shadowAlpha: 0.3,
    shadowBlur: 20,
};

/**
 * Glow effect configuration for neon styling
 */
export const ARCADE_GLOW = {
    enabled: true,
    color: ARCADE_COLORS.primary,
    alpha: 0.6,
    blurRadius: 10,
};
