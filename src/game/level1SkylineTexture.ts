/**
 * Procedural far skyline strip (135px tall) to sit behind OGA city parallax.
 * Same height as OGA strips so one tileScale fills the screen; slow parallax drift.
 */

import { Graphics, Renderer, Texture } from 'pixi.js';

const STRIP_W = 640;
const STRIP_H = 135;

function hash01(n: number): number {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

/**
 * Distant silhouettes + haze — not a substitute for OGA layers, only depth behind them.
 */
export function buildLevel1DistantSkylineTexture(renderer: Renderer): Texture {
    const g = new Graphics();
    // Upper twilight
    g.rect(0, 0, STRIP_W, STRIP_H * 0.42).fill({ color: 0x1b1030 });
    g.rect(0, STRIP_H * 0.42, STRIP_W, STRIP_H * 0.2).fill({ color: 0x241838 });
    // Horizon glow
    g.rect(0, STRIP_H * 0.62, STRIP_W, STRIP_H * 0.12).fill({ color: 0x3d2848, alpha: 0.55 });
    // Distant building mass (varied widths)
    let x = 0;
    let i = 0;
    while (x < STRIP_W + 40) {
        const w = 14 + Math.floor(hash01(i * 2.1) * 28);
        const h = 18 + Math.floor(hash01(i * 3.7) * 45);
        const y0 = STRIP_H - h;
        g.rect(x, y0, w, h).fill({ color: 0x0d0618, alpha: 0.92 });
        x += w + Math.floor(hash01(i * 5.3) * 6);
        i++;
    }
    // Sparse window lights
    for (let k = 0; k < 40; k++) {
        const wx = hash01(k * 11.1) * STRIP_W;
        const wy = STRIP_H * 0.35 + hash01(k * 7.2) * STRIP_H * 0.55;
        if (hash01(k * 13) > 0.55) {
            g.rect(wx, wy, 2, 2).fill({ color: 0xffe8a8, alpha: 0.35 });
        }
    }
    const tex = renderer.generateTexture(g);
    tex.source.scaleMode = 'nearest';
    g.destroy();
    return tex;
}

export const LEVEL1_SKYLINE_STRIP_HEIGHT = STRIP_H;
