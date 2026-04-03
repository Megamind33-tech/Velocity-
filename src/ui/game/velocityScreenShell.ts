/**
 * Shared “game skin”: live menu backdrop + dimmer for full-screen UI states.
 */

import { Application, Container, Graphics } from 'pixi.js';
import { createMenuBackdrop, createModalDimmer } from './GameUIComponents';
import { createLiveMenuBackdrop } from './menuLiveBackdrop';

export type VelocityShellParts = {
    backdrop: Container;
    dimmer: Graphics;
    /** Present when backdrop is the live menu variant; call from screen update. */
    backdropTick?: (t: number) => void;
};

/**
 * Insert animated starfield at index 0 and dimmer at index 1 under `parent`.
 * Call `resizeVelocityShell` on orientation/size changes.
 */
export type VelocityShellOptions = {
    /** Main menu only: animated depth + twinkle (other screens keep static starfield). */
    liveBackdrop?: boolean;
};

export function mountVelocityShell(
    parent: Container,
    app: Application,
    dimAlpha = 0.82,
    opts?: VelocityShellOptions,
): VelocityShellParts {
    const w = app.screen.width;
    const h = app.screen.height;
    const dimmer = createModalDimmer(w, h, dimAlpha);
    if (opts?.liveBackdrop) {
        const live = createLiveMenuBackdrop(w, h);
        parent.addChildAt(live.root, 0);
        parent.addChildAt(dimmer, 1);
        return { backdrop: live.root, dimmer, backdropTick: live.tick };
    }
    const backdrop = createMenuBackdrop(w, h);
    parent.addChildAt(backdrop, 0);
    parent.addChildAt(dimmer, 1);
    return { backdrop, dimmer };
}

export function resizeVelocityShell(
    parts: VelocityShellParts,
    parent: Container,
    w: number,
    h: number,
    dimAlpha = 0.82,
    opts?: VelocityShellOptions,
): void {
    const { backdrop, dimmer } = parts;
    const bi = parent.getChildIndex(backdrop);
    parent.removeChild(backdrop);
    backdrop.destroy({ children: true });
    if (opts?.liveBackdrop) {
        const live = createLiveMenuBackdrop(w, h);
        parent.addChildAt(live.root, Math.min(bi, parent.children.length));
        parts.backdrop = live.root;
        parts.backdropTick = live.tick;
    } else {
        const nb = createMenuBackdrop(w, h);
        parent.addChildAt(nb, Math.min(bi, parent.children.length));
        parts.backdrop = nb;
        parts.backdropTick = undefined;
    }

    dimmer.clear();
    dimmer.rect(0, 0, w, h);
    dimmer.fill({ color: 0x050510, alpha: dimAlpha });
}
