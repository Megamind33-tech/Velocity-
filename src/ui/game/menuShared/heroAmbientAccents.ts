/**
 * Hero “life” without vector sweeps: Kenney panel rim, sci-fi corner notches,
 * tiled slide_fill glint on the route bar, optional star accent near emblem.
 */

import { Container, Graphics, NineSliceSprite, Sprite, TilingSprite } from 'pixi.js';
import { getVelocityUiTexture } from '../velocityUiArt';
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';

const PS = VELOCITY_UI_SLICE.panel;

export type HeroAmbientPartsParams = {
    contentW: number;
    innerH: number;
    ox: number;
    colors: { cyan: number; gold: number };
    barW: number;
    barH: number;
    barY: number;
    emblemCx: number;
    emblemCy: number;
    emblemR: number;
    /** Class chip rim (Kenney frame or vector) — optional pulse in tick */
    rankRim: NineSliceSprite | Graphics | null;
};

export type HeroAmbientParts = {
    rim: NineSliceSprite | Graphics;
    motifRoot: Container;
    routeRoot: Container;
    rewardSpr: Sprite | null;
    tick: (t: number) => void;
};

export function buildHeroAmbientParts(p: HeroAmbientPartsParams): HeroAmbientParts {
    const { contentW, innerH, ox, colors, barW, barH, barY, emblemCx, emblemCy, emblemR, rankRim } = p;

    const rimTex = getVelocityUiTexture('panel_frame');
    let rim: NineSliceSprite | Graphics;
    if (rimTex) {
        rim = new NineSliceSprite({
            texture: rimTex,
            leftWidth: PS.L,
            rightWidth: PS.R,
            topHeight: PS.T,
            bottomHeight: PS.B,
            width: Math.max(20, contentW - 2),
            height: Math.max(20, innerH - 2),
        });
        rim.position.set(1, 1);
        rim.tint = colors.cyan;
        rim.alpha = 0.2;
    } else {
        const g = new Graphics();
        g.roundRect(1, 1, contentW - 2, innerH - 2, 14);
        g.stroke({ color: colors.cyan, width: 2.5, alpha: 0.18 });
        rim = g;
    }

    const motifRoot = new Container();
    const notchS = 20;
    const tl = getVelocityUiTexture('scifi_panel_glass_notch_tl');
    const tr = getVelocityUiTexture('scifi_panel_glass_notch_tr');
    if (tl) {
        const s = new Sprite(tl);
        s.width = notchS;
        s.height = notchS;
        s.position.set(ox + 4, 4);
        s.tint = colors.cyan;
        s.alpha = 0.32;
        motifRoot.addChild(s);
    }
    if (tr) {
        const s = new Sprite(tr);
        s.width = notchS;
        s.height = notchS;
        s.position.set(ox + contentW - notchS - 8, 4);
        s.tint = colors.cyan;
        s.alpha = 0.32;
        motifRoot.addChild(s);
    }

    const routeRoot = new Container();
    routeRoot.position.set(ox, barY);
    const fillTex = getVelocityUiTexture('slide_fill');
    let band: TilingSprite | Graphics | null = null;
    if (fillTex && barW > 12 && barH > 4) {
        const bw = Math.min(40, Math.max(14, Math.floor(barW * 0.12)));
        const ts = new TilingSprite({
            texture: fillTex,
            width: bw,
            height: barH,
            tileScale: { x: barH / Math.max(1, fillTex.height), y: barH / Math.max(1, fillTex.height) },
        });
        ts.tint = colors.cyan;
        ts.alpha = 0.55;
        const maskG = new Graphics();
        maskG.rect(0, 0, barW, barH);
        maskG.fill({ color: 0xffffff });
        routeRoot.addChild(maskG);
        routeRoot.mask = maskG;
        routeRoot.addChild(ts);
        band = ts;
    } else {
        const g = new Graphics();
        routeRoot.addChild(g);
        band = g;
    }

    let rewardSpr: Sprite | null = null;
    const starTex = getVelocityUiTexture('icon_star_outline') ?? getVelocityUiTexture('icon_star');
    if (starTex) {
        rewardSpr = new Sprite(starTex);
        rewardSpr.anchor.set(0.5);
        const rs = Math.min(26, emblemR * 1.05);
        rewardSpr.width = rs;
        rewardSpr.height = rs;
        rewardSpr.position.set(emblemCx + emblemR * 0.5, emblemCy - emblemR * 0.48);
        rewardSpr.tint = colors.gold;
        rewardSpr.alpha = 0.3;
    }

    const tick = (t: number): void => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.9);
        if (rim instanceof NineSliceSprite) {
            rim.alpha = 0.14 + pulse * 0.1;
        } else {
            rim.alpha = 0.12 + pulse * 0.08;
        }

        for (const ch of motifRoot.children) {
            (ch as Sprite).alpha = 0.24 + 0.1 * Math.sin(t * 0.55);
        }

        if (band instanceof TilingSprite) {
            band.tilePosition.x = -(t * 32) % 256;
            band.x = (0.5 + 0.5 * Math.sin(t * 1.02)) * Math.max(0, barW - band.width);
        } else if (band instanceof Graphics) {
            band.clear();
            const bw = 8;
            const sx = (0.5 + 0.5 * Math.sin(t * 1.1)) * Math.max(0, barW - bw);
            band.rect(sx, 0, bw, barH);
            band.fill({ color: colors.cyan, alpha: 0.18 });
        }

        if (rewardSpr) {
            rewardSpr.alpha = 0.2 + 0.16 * Math.sin(t * 1.6);
            rewardSpr.rotation = Math.sin(t * 0.35) * 0.05;
        }

        if (rankRim) {
            const rp = 0.5 + 0.5 * Math.sin(t * 2.1);
            if (rankRim instanceof NineSliceSprite) {
                rankRim.alpha = 0.22 + rp * 0.14;
            } else {
                rankRim.alpha = 0.26 + rp * 0.2;
            }
        }
    };

    return { rim, motifRoot, routeRoot, rewardSpr, tick };
}

/**
 * Class chip Kenney frame rim — must render **above** the opaque chip fill or it is invisible.
 * Call after the solid face + content are mounted; appends on top for a readable gold frame.
 */
export function mountClassChipKenneyRim(
    cls: Container,
    clsW: number,
    useBtnH: number,
    gold: number,
): NineSliceSprite | Graphics {
    const rimTex = getVelocityUiTexture('panel_frame');
    if (rimTex) {
        const rim = new NineSliceSprite({
            texture: rimTex,
            leftWidth: PS.L,
            rightWidth: PS.R,
            topHeight: PS.T,
            bottomHeight: PS.B,
            width: clsW,
            height: useBtnH,
        });
        rim.tint = gold;
        rim.alpha = 0.36;
        rim.eventMode = 'none';
        cls.addChild(rim);
        return rim;
    }
    const g = new Graphics();
    g.roundRect(0, 0, clsW, useBtnH, 12);
    g.stroke({ color: gold, width: 2, alpha: 0.28 });
    g.eventMode = 'none';
    cls.addChild(g);
    return g;
}
