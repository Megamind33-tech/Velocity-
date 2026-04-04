/**
 * Ship-mode UI: replace vector roundRect "wireframes" with Kenney / Sci-Fi nine-slice plates.
 */

import { Container, Graphics, NineSliceSprite, Sprite } from 'pixi.js';
import { getVelocityUiTexture } from '../velocityUiArt';
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';

const PS = VELOCITY_UI_SLICE.panel;
const SCIFI_GL = VELOCITY_UI_SLICE.scifiGlass;
const SCIFI_BTN = VELOCITY_UI_SLICE.scifiButton;

export type TexturedPlateVariant = 'meta' | 'reward' | 'well' | 'tier' | 'plaque' | 'actionDock' | 'spine';

/**
 * Mount a textured inset plate at (x,y) with size (w,h). Falls back to vector `g` if no textures.
 * @returns true when Kenney/sci-fi sprites were used (caller should not add fallback graphics).
 */
export function mountTexturedInsetPlate(
    parent: Container,
    x: number,
    y: number,
    w: number,
    h: number,
    variant: TexturedPlateVariant,
    vectorFallback: Graphics,
    colors: {
        fill: number;
        fillAlpha: number;
        stroke: number;
        strokeAlpha: number;
    },
): boolean {
    if (w < 8 || h < 6) return false;

    const glass = getVelocityUiTexture('scifi_panel_glass');
    const chrome = getVelocityUiTexture('scifi_panel_rectangle_screws');
    const fillT = getVelocityUiTexture('panel_fill');
    const frameT = getVelocityUiTexture('panel_frame');

    const useScifi = !!glass && !!chrome;
    const fillTex = useScifi ? glass : fillT;
    const frameTex = useScifi ? chrome : frameT;
    if (!fillTex || !frameTex) {
        parent.addChild(vectorFallback);
        return false;
    }

    const fL = useScifi ? SCIFI_GL.L : PS.L;
    const fR = useScifi ? SCIFI_GL.R : PS.R;
    const fT = useScifi ? SCIFI_GL.T : PS.T;
    const fB = useScifi ? SCIFI_GL.B : PS.B;
    const frL = useScifi ? SCIFI_BTN.L : PS.L;
    const frR = useScifi ? SCIFI_BTN.R : PS.R;
    const frT = useScifi ? SCIFI_BTN.T : PS.T;
    const frB = useScifi ? SCIFI_BTN.B : PS.B;

    let fillTint = colors.fill;
    let fillAlpha = colors.fillAlpha;
    let frameTint = colors.stroke;
    let frameAlpha = colors.strokeAlpha;

    switch (variant) {
        case 'tier':
            frameAlpha = Math.min(1, colors.strokeAlpha + 0.1);
            break;
        case 'plaque':
            frameAlpha = Math.min(1, colors.strokeAlpha + 0.08);
            fillAlpha = Math.min(1, fillAlpha + 0.04);
            break;
        case 'actionDock':
            fillAlpha = Math.min(1, fillAlpha + 0.06);
            frameAlpha = Math.min(1, colors.strokeAlpha + 0.12);
            break;
        case 'spine':
            fillAlpha = Math.min(1, fillAlpha + 0.05);
            frameAlpha = Math.min(1, colors.strokeAlpha + 0.15);
            break;
        default:
            break;
    }

    const fill = new NineSliceSprite({
        texture: fillTex,
        leftWidth: fL,
        rightWidth: fR,
        topHeight: fT,
        bottomHeight: fB,
        width: w,
        height: h,
    });
    fill.position.set(x, y);
    fill.tint = fillTint;
    fill.alpha = fillAlpha;

    const frame = new NineSliceSprite({
        texture: frameTex,
        leftWidth: frL,
        rightWidth: frR,
        topHeight: frT,
        bottomHeight: frB,
        width: w,
        height: h,
    });
    frame.position.set(x, y);
    frame.tint = frameTint;
    frame.alpha = frameAlpha;

    parent.addChild(fill, frame);
    vectorFallback.destroy();
    return true;
}

/** Circular route/emblem well — Kenney round node texture or vector fallback. */
export function mountEmblemCircleWell(
    parent: Container,
    cx: number,
    cy: number,
    diameter: number,
    vectorFallback: Graphics,
    opts: { tint: number; alpha?: number },
): boolean {
    const tex = getVelocityUiTexture('node_unlocked') ?? getVelocityUiTexture('node_locked');
    if (!tex) {
        parent.addChild(vectorFallback);
        return false;
    }
    const s = new Sprite(tex);
    s.anchor.set(0.5);
    s.width = diameter * 2;
    s.height = diameter * 2;
    s.position.set(cx, cy);
    s.tint = opts.tint;
    s.alpha = opts.alpha ?? 1;
    parent.addChild(s);
    vectorFallback.destroy();
    return true;
}
