/**
 * Uniform buttons: Kenney UI Pack when preloaded, else vector fallback.
 */

import { Container } from 'pixi.js';
import { createGameButton } from './GameUIComponents';
import { createKenneyNineSliceButton, type KenneyButtonVariant } from './kenneyNineSlice';
import { velocityUiArtReady } from './velocityUiArt';

export type VelocityButtonType = 'primary' | 'secondary' | 'accent' | 'danger' | 'success';

function toKenneyVariant(type: VelocityButtonType): KenneyButtonVariant {
    if (type === 'danger') return 'danger';
    if (type === 'accent') return 'accent';
    if (type === 'success') return 'primary';
    if (type === 'primary') return 'primary';
    return 'neutral';
}

/**
 * Standard game button — same chrome everywhere (menus, modals, map, results).
 */
export function createVelocityGameButton(
    label: string,
    type: VelocityButtonType,
    onClick: () => void,
    opts?: { width?: number; height?: number }
): Container {
    const w = opts?.width ?? 200;
    const h = opts?.height ?? 48;
    const fallbackType =
        type === 'success' ? 'success' : type === 'primary' ? 'primary' : type === 'danger' ? 'danger' : type === 'accent' ? 'accent' : 'secondary';

    const kenney =
        velocityUiArtReady() &&
        createKenneyNineSliceButton(label, w, h, toKenneyVariant(type), onClick);
    if (kenney) return kenney;

    return createGameButton(label, onClick, fallbackType, 'large', { width: w, height: h });
}
