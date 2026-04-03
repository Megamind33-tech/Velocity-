/**
 * Main menu backdrop — layered depth, soft aurora, twinkling stars (liveness without heavy redraw).
 */

import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { GAME_COLORS } from './GameUITheme';

const N_TWINKLE = 72;

export type MenuLiveBackdrop = {
    root: Container;
    /** Call from screen update(timeSeconds). */
    tick: (t: number) => void;
};

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

    const horizon = new Graphics();
    horizon.moveTo(0, screenH * 0.42);
    horizon.lineTo(screenW, screenH * 0.38);
    horizon.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.12 });
    root.addChild(horizon);

    const glow = new Graphics();
    const gr = Math.min(screenW, screenH) * 0.55;
    glow.circle(screenW * 0.5, screenH * 0.28, gr);
    glow.fill({ color: GAME_COLORS.primary, alpha: 0.07 });
    root.addChild(glow);

    const glow2 = new Graphics();
    glow2.ellipse(screenW * 0.85, screenH * 0.55, screenW * 0.35, screenH * 0.25);
    glow2.fill({ color: 0x6644aa, alpha: 0.045 });
    root.addChild(glow2);

    const aurora = new Container();
    const a1 = new Graphics();
    a1.ellipse(0, 0, screenW * 0.4, screenH * 0.18);
    a1.fill({ color: GAME_COLORS.primary, alpha: 0.06 });
    a1.position.set(screenW * 0.2, screenH * 0.52);
    const a2 = new Graphics();
    a2.ellipse(0, 0, screenW * 0.35, screenH * 0.14);
    a2.fill({ color: 0x4488cc, alpha: 0.05 });
    a2.position.set(screenW * 0.65, screenH * 0.48);
    aurora.addChild(a1, a2);
    root.addChild(aurora);

    const staticStars = new Graphics();
    let seed = 0x56454c;
    const rnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 0xffffffff;
    };
    for (let i = 0; i < 100; i++) {
        const x = rnd() * screenW;
        const y = rnd() * screenH;
        const a = 0.08 + rnd() * 0.35;
        const rr = rnd() < 0.88 ? 1 : 2;
        staticStars.circle(x, y, rr).fill({ color: 0xffffff, alpha: a });
    }
    root.addChild(staticStars);

    const twinkleLayer = new Container();
    const phases: number[] = [];
    const baseX: number[] = [];
    const baseY: number[] = [];
    const scales: number[] = [];
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
        scales.push(sc);
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
        a1.alpha = 0.75 + Math.sin(t * 0.8) * 0.25;
        a2.alpha = 0.7 + Math.cos(t * 0.65) * 0.3;
        glow.alpha = 0.85 + Math.sin(t * 0.5) * 0.15;

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
