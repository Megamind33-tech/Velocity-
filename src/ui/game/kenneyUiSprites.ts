/**
 * Mount Kenney UI Pack sprites for menus (centered glyph helpers).
 */

import { Container, Sprite } from 'pixi.js';
import { getVelocityUiTexture, type VelocityUiTextureKey } from './velocityUiArt';

/**
 * Adds a centered sprite to `parent` if the texture is loaded. Returns the sprite or null.
 */
export function mountKenneySpriteIcon(
    parent: Container,
    key: VelocityUiTextureKey,
    cx: number,
    cy: number,
    size: number,
    opts?: { tint?: number; alpha?: number },
): Sprite | null {
    const tex = getVelocityUiTexture(key);
    if (!tex) return null;
    const s = new Sprite(tex);
    s.anchor.set(0.5);
    s.width = size;
    s.height = size;
    s.position.set(cx, cy);
    if (opts?.tint !== undefined) s.tint = opts.tint;
    if (opts?.alpha !== undefined) s.alpha = opts.alpha;
    parent.addChild(s);
    return s;
}
