/**
 * DESIGN TOKENS (Velocity portrait mission console)
 * Maps to AAA spec colors in GameUITheme.ts
 */

import { GAME_COLORS } from '../GameUITheme';

export const P_COLORS = {
    // Base elevation layers
    bgBase: GAME_COLORS.bg_base,           // #0D1117
    bgElevated: GAME_COLORS.bg_surface,    // #1A1A2E
    bgPanel: GAME_COLORS.bg_surface,       // #1A1A2E
    bgPanelActive: GAME_COLORS.bg_elevated, // #252540
    bgPanelLocked: GAME_COLORS.bg_base,    // #0D1117

    // Locked card styling
    lockedFace: GAME_COLORS.bg_base,
    lockedFaceElite: GAME_COLORS.bg_base,
    lockedPlaque: GAME_COLORS.bg_base,
    lockedPlaqueElite: GAME_COLORS.bg_base,
    lockedPlaqueRim: GAME_COLORS.bg_elevated,
    lockedPlaqueRimElite: GAME_COLORS.primary_cta,
    lockedGateWell: GAME_COLORS.bg_base,
    lockedGateWellElite: GAME_COLORS.bg_base,

    // Dock styling
    dockDeck: GAME_COLORS.bg_base,
    dockDeckTop: GAME_COLORS.bg_surface,
    dockDeckRim: GAME_COLORS.bg_elevated,
    dockChannel: GAME_COLORS.bg_base,
    dockCellIdle: GAME_COLORS.bg_surface,
    dockCellIdleRim: GAME_COLORS.bg_elevated,
    dockCellActive: GAME_COLORS.bg_surface,
    dockCellActiveRim: GAME_COLORS.accent_cyan,
    dockBolt: GAME_COLORS.text_disabled,

    // Panel lighting
    bgPanelLit: GAME_COLORS.bg_elevated,
    strokeSubtle: GAME_COLORS.bg_elevated,
    strokeActive: GAME_COLORS.accent_cyan,
    strokeGold: GAME_COLORS.primary_cta,

    // Text colors (spec system)
    textPrimary: GAME_COLORS.text_primary,
    textSecondary: GAME_COLORS.text_secondary,
    textMuted: GAME_COLORS.text_disabled,

    // Accent colors (spec system)
    accentCyan: GAME_COLORS.accent_cyan,
    accentCyanSoft: GAME_COLORS.accent_cyan,
    accentGold: GAME_COLORS.primary_cta,
    accentGoldSoft: GAME_COLORS.primary_cta,
    accentPurple: GAME_COLORS.accent_purple,
    accentPurpleSoft: GAME_COLORS.accent_purple,

    // States
    stateLive: GAME_COLORS.success,
    stateLocked: GAME_COLORS.text_disabled,
    statePressed: GAME_COLORS.bg_base,

    // Navigation
    navActive: GAME_COLORS.accent_cyan,
    navActivePill: GAME_COLORS.accent_cyan,
    navInactive: GAME_COLORS.text_disabled,

    // Shadows
    shadowDeep: GAME_COLORS.bg_base,
    shadowGlowCyan: GAME_COLORS.accent_cyan,
    shadowGlowGold: GAME_COLORS.primary_cta,
} as const;

export const P_TYPO = {
    heroTitle: { fontSize: 30, lineHeight: 34, fontWeight: '800' as const, letterSpacing: 3 },
    heroSubtitle: { fontSize: 13, lineHeight: 17, fontWeight: '600' as const, letterSpacing: 1.2 },
    label: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 0.8 },
    meta: { fontSize: 12, lineHeight: 15, fontWeight: '500' as const, letterSpacing: 0 },
    chip: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.2 },
    tab: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.2 },
    missionTitle: { fontSize: 15, lineHeight: 19, fontWeight: '700' as const, letterSpacing: 0.2 },
    missionBody: { fontSize: 11, lineHeight: 14, fontWeight: '500' as const, letterSpacing: 0 },
    button: { fontSize: 13, lineHeight: 17, fontWeight: '800' as const, letterSpacing: 0.8 },
    navLabel: { fontSize: 9, lineHeight: 12, fontWeight: '700' as const, letterSpacing: 0.5 },
    /** Locked plaque primary — must read at a glance */
    lockedPlaqueState: { fontSize: 11, lineHeight: 13, fontWeight: '800' as const, letterSpacing: 1.4 },
    lockedPlaqueSub: { fontSize: 8, lineHeight: 10, fontWeight: '600' as const, letterSpacing: 0.6 },
    dockLabel: { fontSize: 8, lineHeight: 10, fontWeight: '700' as const, letterSpacing: 1.0 },
    dockLabelActive: { fontSize: 8, lineHeight: 10, fontWeight: '800' as const, letterSpacing: 1.2 },
} as const;

export const P_SPACE = {
    s4: 4,
    s6: 6,
    s8: 8,
    s10: 10,
    s12: 12,
    s16: 16,
    s20: 20,
    s24: 24,
    s28: 28,
    s32: 32,
} as const;

export const P_RADIUS = {
    chip: 10,
    button: 12,
    panel: 16,
    dock: 18,
    iconBadge: 14,
} as const;

/** RGBA-like shadow presets (drawn as layered graphics / filters). Alpha scaled in usage. */
export const P_SHADOW = {
    panel: { blur: 8, alpha: 0.45, offsetY: 4 },
    raised: { blur: 4, alpha: 0.35, offsetY: 2 },
    pressed: { blur: 2, alpha: 0.55, offsetY: 1 },
    glowCyan: { blur: 14, alpha: 0.22 },
    glowGold: { blur: 12, alpha: 0.18 },
} as const;

export const P_MOTION = {
    fast: 0.12,
    normal: 0.28,
    slow: 0.55,
    ambientLoop: 14,
    /** Normalized 0–1 per second-ish; applied in tick with sin */
    easeOut: 'cubic-out' as const,
    easeInOut: 'cubic-in-out' as const,
} as const;

export const P_OPACITY = {
    inactive: 0.72,
    lockedSurface: 0.94,
    lockedStroke: 0.5,
    motif: 0.06,
    motifStreak: 0.10,
    dockBg: 0.97,
    chipBevel: 0.07,
    activeGlow: 0.09,
} as const;

/** Stacking: background 0, content 100, modals higher (unused here). */
export const P_Z = {
    ambient: 0,
    shell: 10,
    strip: 20,
    featured: 30,
    tabs: 40,
    list: 50,
    dock: 60,
} as const;

export const P_ICON = {
    strip: 18,
    badge: 22,
    dock: 24,
    emblem: 26,
} as const;
