/**
 * SECTION A — DESIGN TOKENS (Velocity portrait mission console)
 * PixiJS: colors are 0xRRGGBB. Motion: seconds + easing names for tick() usage.
 */

export const P_COLORS = {
    bgBase: 0x030509,
    bgElevated: 0x08101a,
    bgPanel: 0x0b1220,
    bgPanelActive: 0x0f1a28,
    bgPanelLocked: 0x06080f,
    bgPanelLit: 0x131e2e,     // hover/active highlight surface
    strokeSubtle: 0x1a2638,
    strokeActive: 0x00d4b4,
    strokeGold: 0xc8a020,
    textPrimary: 0xf4f8fd,
    textSecondary: 0xb0c0d2,
    textMuted: 0x58687c,
    accentCyan: 0x00e8c8,
    accentCyanSoft: 0x009880,
    accentGold: 0xeaba28,
    accentGoldSoft: 0x806218,
    accentPurple: 0xb888ff,   // PREMIUM chip
    accentPurpleSoft: 0x6840a8,
    stateLive: 0x28e880,
    stateLocked: 0x48565e,
    statePressed: 0x001410,
    navActive: 0x00e8c8,
    navActivePill: 0x00b89a,   // active indicator pill fill
    navInactive: 0x607080,
    shadowDeep: 0x000000,
    shadowGlowCyan: 0x00e8c8,
    shadowGlowGold: 0xeaba28,
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
