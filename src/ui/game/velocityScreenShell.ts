/**
 * Shared “game skin”: starfield backdrop + dimmer for full-screen UI states.
 * Keeps menus, map, and results visually consistent and slightly richer than flat color.
 */

import { Application, Container, Graphics } from 'pixi.js';
import { createMenuBackdrop, createModalDimmer } from './GameUIComponents';

export type VelocityShellParts = {
    backdrop: Container;
    dimmer: Graphics;
};

/**
 * Insert animated starfield at index 0 and dimmer at index 1 under `parent`.
 * Call `resizeVelocityShell` on orientation/size changes.
 */
export function mountVelocityShell(parent: Container, app: Application, dimAlpha = 0.82): VelocityShellParts {
    const w = app.screen.width;
    const h = app.screen.height;
    const backdrop = createMenuBackdrop(w, h);
    const dimmer = createModalDimmer(w, h, dimAlpha);
    parent.addChildAt(backdrop, 0);
    parent.addChildAt(dimmer, 1);
    return { backdrop, dimmer };
}

export function resizeVelocityShell(parts: VelocityShellParts, parent: Container, w: number, h: number, dimAlpha = 0.82): void {
    const { backdrop, dimmer } = parts;
    const bi = parent.getChildIndex(backdrop);
    parent.removeChild(backdrop);
    backdrop.destroy({ children: true });
    const nb = createMenuBackdrop(w, h);
    parent.addChildAt(nb, Math.min(bi, parent.children.length));
    parts.backdrop = nb;

    dimmer.clear();
    dimmer.rect(0, 0, w, h);
    dimmer.fill({ color: 0x050510, alpha: dimAlpha });
}
