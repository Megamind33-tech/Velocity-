/**
 * Arcade / rhythm-game visual language (Pixi colors as numbers, CSS stacks for Text).
 */
export const GAME_UI = {
    bgDeep: 0x050510,
    bgPanel: 0x0e0c1c,
    bgPanelEdge: 0x1a1530,
    strokeNeon: 0xff3d9a,
    strokeCyan: 0x00f0ff,
    accentHot: 0xff3d9a,
    accentCool: 0x00f0ff,
    textPrimary: 0xffffff,
    textMuted: 0x8899cc,
    gold: 0xffdd44,
    danger: 0xff3355,
    /** Self-hosted; files in /public/fonts/ (see public/fonts/README.txt) */
    fontTitle: '"VelocityGame", monospace',
    fontBody: '"VelocityGame", monospace',
    minTouchPx: 48,
} as const;

export function hexFill(n: number): string {
    return '#' + n.toString(16).padStart(6, '0');
}
