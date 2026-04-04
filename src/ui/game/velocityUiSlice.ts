/**
 * Nine-slice insets for Kenney UI Pack rectangles (192×64): buttons + input outline panel.
 */

export const VELOCITY_UI_SLICE = {
    button: { L: 56, R: 56, T: 20, B: 20 },
    panel: { L: 56, R: 56, T: 20, B: 20 },
    slide: { L: 44, R: 44, T: 28, B: 28 },
    /** Kenney UI Pack — Sci-Fi (OGA mirror) — 192×64 chrome */
    scifiButton: { L: 56, R: 56, T: 20, B: 20 },
    scifiPanelRect: { L: 56, R: 56, T: 20, B: 20 },
    /** 64×64 glass panels — conservative insets */
    scifiGlass: { L: 22, R: 22, T: 22, B: 22 },
} as const;
