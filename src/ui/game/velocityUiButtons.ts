/**
 * Uniform buttons: SunGraphica nine-slice when preloaded, else vector fallback.
 * All buttons automatically receive AAA-quality hover and press animations.
 */

import { Container } from 'pixi.js';
import { createGameButton } from './GameUIComponents';
import { createKenneyNineSliceButton, type KenneyButtonVariant } from './kenneyNineSlice';
import { velocityUiArtReady } from './velocityUiArt';
import { enhanceButtonInteraction } from './buttonInteractionEnhancer';

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
 * Automatically includes AAA-quality hover and press animations.
 */
export function createVelocityGameButton(
    label: string,
    type: VelocityButtonType,
    onClick: () => void,
    opts?: { width?: number; height?: number }
): Container {
    const w = opts?.width ?? 180;
    const h = opts?.height ?? 42;
    const fallbackType =
        type === 'success' ? 'success' : type === 'primary' ? 'primary' : type === 'danger' ? 'danger' : type === 'accent' ? 'accent' : 'secondary';

    const kenney =
        velocityUiArtReady() &&
        createKenneyNineSliceButton(label, w, h, toKenneyVariant(type), onClick);
    const button = kenney || createGameButton(label, onClick, fallbackType, 'large', { width: w, height: h });

    // Apply professional animations to all buttons
    enhanceButtonInteraction(button, {
        enableHover: true,
        enablePress: true,
    });

    return button;
}
