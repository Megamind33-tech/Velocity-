/**
 * Nine-slice insets for SunGraphica PNGs.
 * Button keys match `velocityUiArt` — pause-menu buttons are wide (~900–1250×~244–250);
 * insets keep beveled corners stable when scaled to touch heights (36–48px).
 */

import type { VelocityUiTextureKey } from './velocityUiArt';

export const VELOCITY_UI_SLICE = {
    /** Panel frame + fill (364×363, 297×297) */
    panel: { L: 72, R: 72, T: 72, B: 72 },
    /** Horizontal strip for progress tiling (~350×202) */
    slide: { L: 44, R: 44, T: 28, B: 28 },
} as const;

/** Per-button texture insets (SunGraphica pause exports + neutral plate). */
export function velocityUiButtonSlice(
    key:
        | 'button_primary'
        | 'button_secondary'
        | 'button_accent'
        | 'button_danger'
        | 'button_plate',
): { L: number; R: number; T: number; B: number } {
    switch (key) {
        case 'button_primary':
            /** PAUSE-MENU … RESUME.png ~1205×250 */
            return { L: 138, R: 138, T: 52, B: 52 };
        case 'button_secondary':
            /** PAUSE-MENU … SETTING.png ~1250×249 */
            return { L: 142, R: 142, T: 52, B: 52 };
        case 'button_accent':
            /** PAUSE-MENU … RETRY.png ~911×244 */
            return { L: 104, R: 104, T: 50, B: 50 };
        case 'button_danger':
            /** PAUSE-MENU … EXIT.png ~620×242 */
            return { L: 72, R: 72, T: 50, B: 50 };
        case 'button_plate':
        default:
            /** LEVELS_0000s_0004_Layer-5.png ~241×241 */
            return { L: 56, R: 56, T: 56, B: 56 };
    }
}

/** Map semantic menu keys to slice preset (for stat chip / row chrome). */
export function velocityUiSliceForTextureKey(key: VelocityUiTextureKey): {
    L: number;
    R: number;
    T: number;
    B: number;
} {
    if (
        key === 'button_primary' ||
        key === 'button_secondary' ||
        key === 'button_accent' ||
        key === 'button_danger' ||
        key === 'button_plate'
    ) {
        return velocityUiButtonSlice(key);
    }
    if (key === 'panel_frame' || key === 'panel_fill') {
        return VELOCITY_UI_SLICE.panel;
    }
    return velocityUiButtonSlice('button_plate');
}
