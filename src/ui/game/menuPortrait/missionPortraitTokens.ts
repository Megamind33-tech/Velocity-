/**
 * SECTION A — DESIGN TOKENS (Velocity portrait mission console)
 * PixiJS: colors are 0xRRGGBB. Motion: seconds + easing names for tick() usage.
 */

export const P_COLORS = {
    bgBase: 0x04060c,
    bgElevated: 0x0a1018,
    bgPanel: 0x0c141e,
    bgPanelActive: 0x101a26,
    bgPanelLocked: 0x080c12,
    strokeSubtle: 0x1e2a38,
    strokeActive: 0x00c4a8,
    textPrimary: 0xf2f6fb,
    textSecondary: 0xb8c4d4,
    textMuted: 0x6a7a8c,
    accentCyan: 0x00e6c4,
    accentCyanSoft: 0x00a896,
    accentGold: 0xe8b829,
    accentGoldSoft: 0x8a7020,
    stateLive: 0x2ee88a,
    stateLocked: 0x5c6674,
    statePressed: 0x001a16,
    navActive: 0x00e6c4,
    navInactive: 0x7a8a9c,
    shadowDeep: 0x000000,
    shadowGlowCyan: 0x00e6c4,
    shadowGlowGold: 0xe8b829,
} as const;

export const P_TYPO = {
    heroTitle: { fontSize: 28, lineHeight: 32, fontWeight: '800' as const, letterSpacing: 2 },
    heroSubtitle: { fontSize: 14, lineHeight: 18, fontWeight: '600' as const, letterSpacing: 0.3 },
    label: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 0.8 },
    meta: { fontSize: 12, lineHeight: 15, fontWeight: '500' as const, letterSpacing: 0 },
    chip: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.2 },
    tab: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.2 },
    missionTitle: { fontSize: 16, lineHeight: 20, fontWeight: '700' as const, letterSpacing: 0 },
    missionBody: { fontSize: 12, lineHeight: 15, fontWeight: '500' as const, letterSpacing: 0 },
    button: { fontSize: 14, lineHeight: 18, fontWeight: '800' as const, letterSpacing: 0.6 },
    navLabel: { fontSize: 10, lineHeight: 12, fontWeight: '700' as const, letterSpacing: 0.2 },
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
    lockedSurface: 0.92,
    lockedStroke: 0.55,
    motif: 0.08,
    dockBg: 0.96,
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
