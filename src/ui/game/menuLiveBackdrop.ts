/**
 * Main menu backdrop — depth planes + Kenney sci-fi glass blobs (no vector ellipses/lines for glow).
 * Stars use Texture.WHITE sprites. Call tick(timeSeconds) from the screen loop.
 */

import { BlurFilter, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { GAME_COLORS } from './GameUITheme';
import { getVelocityUiTexture } from './velocityUiArt';

const N_TWINKLE = 72;
const N_STATIC = 100;

export type MenuLiveBackdrop = {
    root: Container;
    tick: (t: number) => void;
};

function makeGlassBlob(
    tex: Texture,
    cx: number,
    cy: number,
    w: number,
    h: number,
    tint: number,
    alpha: number,
): Sprite {
    const s = new Sprite(tex);
    s.anchor.set(0.5);
    s.position.set(cx, cy);
    s.width = w;
    s.height = h;
    s.tint = tint;
    s.alpha = alpha;
    s.roundPixels = true;
    return s;
}

export function createLiveMenuBackdrop(screenW: number, screenH: number): MenuLiveBackdrop {
    const root = new Container();

    const base = new Graphics();
    base.rect(0, 0, screenW, screenH);
    base.fill({ color: 0x060818 });
    root.addChild(base);

    const deep = new Graphics();
    deep.rect(0, screenH * 0.25, screenW, screenH * 0.75);
    deep.fill({ color: 0x0a0e22, alpha: 0.95 });
    root.addChild(deep);

    const glassTex = getVelocityUiTexture('scifi_panel_glass');
    let glow: Sprite | Graphics;
    let glow2: Sprite | Graphics;
    let a1: Sprite | Graphics;
    let a2: Sprite | Graphics;

    const gr = Math.min(screenW, screenH) * 0.55;
    if (glassTex) {
        glow = makeGlassBlob(glassTex, screenW * 0.5, screenH * 0.28, gr * 2, gr * 2, GAME_COLORS.primary, 0.12);
        glow2 = makeGlassBlob(
            glassTex,
            screenW * 0.85,
            screenH * 0.55,
            screenW * 0.7,
            screenH * 0.5,
            0x6644aa,
            0.08,
        );
        try {
            glow.filters = [new BlurFilter({ strength: 8 })];
            glow2.filters = [new BlurFilter({ strength: 10 })];
        } catch {
            /* no blur in headless */
        }
    } else {
        const g = new Graphics();
        g.circle(screenW * 0.5, screenH * 0.28, gr);
        g.fill({ color: GAME_COLORS.primary, alpha: 0.07 });
        glow = g;
        const g2 = new Graphics();
        g2.ellipse(screenW * 0.85, screenH * 0.55, screenW * 0.35, screenH * 0.25);
        g2.fill({ color: 0x6644aa, alpha: 0.045 });
        glow2 = g2;
    }
    root.addChild(glow, glow2);

    const aurora = new Container();
    if (glassTex) {
        a1 = makeGlassBlob(glassTex, 0, 0, screenW * 0.8, screenH * 0.36, GAME_COLORS.primary, 0.1);
        a1.position.set(screenW * 0.2, screenH * 0.52);
        a2 = makeGlassBlob(glassTex, 0, 0, screenW * 0.7, screenH * 0.28, 0x4488cc, 0.09);
        a2.position.set(screenW * 0.65, screenH * 0.48);
        try {
            a1.filters = [new BlurFilter({ strength: 6 })];
            a2.filters = [new BlurFilter({ strength: 6 })];
        } catch {
            /* noop */
        }
    } else {
        const g = new Graphics();
        g.ellipse(0, 0, screenW * 0.4, screenH * 0.18);
        g.fill({ color: GAME_COLORS.primary, alpha: 0.06 });
        g.position.set(screenW * 0.2, screenH * 0.52);
        a1 = g;
        const g2 = new Graphics();
        g2.ellipse(0, 0, screenW * 0.35, screenH * 0.14);
        g2.fill({ color: 0x4488cc, alpha: 0.05 });
        g2.position.set(screenW * 0.65, screenH * 0.48);
        a2 = g2;
    }
    aurora.addChild(a1, a2);
    root.addChild(aurora);

    const a1Base = glassTex ? 0.09 : 0.06;
    const a2Base = glassTex ? 0.08 : 0.05;
    const glowBase = glassTex ? 0.11 : 0.07;

    const staticStars = new Container();
    let seed = 0x56454c;
    const rnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 0xffffffff;
    };
    for (let i = 0; i < N_STATIC; i++) {
        const x = rnd() * screenW;
        const y = rnd() * screenH;
        const a = 0.08 + rnd() * 0.35;
        const rr = rnd() < 0.88 ? 1 : 2;
        const s = new Sprite(Texture.WHITE);
        s.tint = 0xffffff;
        s.anchor.set(0.5);
        s.position.set(x, y);
        s.width = rr * 2;
        s.height = rr * 2;
        s.alpha = a;
        staticStars.addChild(s);
    }
    root.addChild(staticStars);

    const twinkleLayer = new Container();
    const phases: number[] = [];
    const baseX: number[] = [];
    const baseY: number[] = [];
    for (let i = 0; i < N_TWINKLE; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const r1 = seed / 0xffffffff;
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const r2 = seed / 0xffffffff;
        const s = new Sprite(Texture.WHITE);
        s.tint = 0xffffff;
        s.anchor.set(0.5);
        s.position.set(r1 * screenW, r2 * screenH);
        const sc = 0.6 + r2 * 1.8;
        s.width = sc * 2;
        s.height = sc * 2;
        phases.push(r1 * Math.PI * 2);
        baseX.push(s.x);
        baseY.push(s.y);
        twinkleLayer.addChild(s);
    }
    root.addChild(twinkleLayer);

    const floorTint = new Graphics();
    floorTint.rect(0, screenH * 0.72, screenW, screenH * 0.28);
    floorTint.fill({ color: 0x020408, alpha: 0.35 });
    root.addChild(floorTint);

    const tick = (t: number): void => {
        const slow = t * 0.35;
        aurora.x = Math.sin(slow) * 14;
        aurora.y = Math.cos(slow * 0.7) * 8;
        a1.alpha = a1Base + Math.sin(t * 0.8) * 0.04;
        a2.alpha = a2Base + Math.cos(t * 0.65) * 0.035;
        glow.alpha = glowBase + Math.sin(t * 0.5) * 0.03;
        if (glow2 instanceof Sprite) {
            glow2.alpha = 0.06 + Math.sin(t * 0.4) * 0.025;
        }

        twinkleLayer.children.forEach((ch, i) => {
            const spr = ch as Sprite;
            const ph = phases[i];
            const tw = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * 1.6 + ph));
            spr.alpha = tw;
            spr.x = baseX[i] + Math.sin(t * 0.22 + ph) * 1.2;
            spr.y = baseY[i] + Math.cos(t * 0.18 + ph * 0.5) * 1.2;
        });
    };

    return { root, tick };
}
