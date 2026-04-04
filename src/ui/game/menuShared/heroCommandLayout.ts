/**
 * Shared hero “command header” interior — same mission cockpit layout in portrait + landscape.
 * Mount into Kenney framed `content` container (origin top-left of inner content area).
 */

import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { getVelocityCustomTexture } from '../velocityUiArt';
export type MainMenuProgressLite = {
    unlockedCount: number;
    totalLevels: number;
};

export type HeroCommandLayoutColors = {
    cyan: number;
    muted: number;
    text: number;
    border: number;
    gold: number;
};

export type HeroLayoutHelpers = {
    trunc: (s: string, max: number) => string;
    /** Returns TextStyle */
    textStyle: (size: number, weight: '400' | '500' | '600' | '700' | '800', fill: number, letterSpacing?: number) => TextStyle;
    icoRadar: (g: Graphics, cx: number, cy: number, s: number) => void;
    /** Optional: replace default cyan ring + radar (e.g. portrait gold route emblem). */
    drawHeroEmblem?: (g: Graphics, cx: number, cy: number, radius: number) => void;
    icoWing: (g: Graphics, cx: number, cy: number, s: number) => void;
    kenneyProgressBar: (w: number, h: number) => ((Container & { setProgress: (p: number) => void }) | null);
    kenneyButton: (
        label: string,
        w: number,
        h: number,
        key: 'button_accent',
        textLight: boolean,
        onClick: () => void,
    ) => Container | null;
    fallbackPrimaryBtn: (w: number, h: number, label: string, onClick: () => void) => Container;
};

const GRID = 8;

export type HeroCommandMountResult = {
    flyCta: Container | null;
    routeBarW: number;
    routeSweep: Graphics;
    rankGlow: Graphics;
    heroMotif: Graphics;
    rewardShimmer: Graphics;
    heroGlow: Graphics;
    /** Y of class+FLY rail (for optional labels above). */
    bottomRailY: number;
};

/**
 * Single integrated bottom “command rail”: progress reads into class strip + FLY (not stacked cards).
 */
export function mountHeroCommandLayout(
    content: Container,
    contentW: number,
    innerH: number,
    ox: number,
    prog: MainMenuProgressLite,
    rank: string,
    onFly: () => void,
    colors: HeroCommandLayoutColors,
    fontFamily: string,
    helpers: HeroLayoutHelpers,
): HeroCommandMountResult {
    const heroGlow = new Graphics();
    heroGlow.roundRect(1, 1, contentW - 2, innerH - 2, 14);
    heroGlow.stroke({ color: colors.cyan, width: 2.5, alpha: 0.18 });
    content.addChild(heroGlow);

    const rightEmblem = 64;
    const leftTitleMax = Math.max(160, contentW - rightEmblem - GRID * 2);

    const btnH = 48;
    const rowBudget = Math.max(160, contentW - GRID * 2);
    let flyW = Math.min(220, Math.max(120, Math.floor(rowBudget * 0.5)));
    let clsW = rowBudget - flyW - GRID;
    if (clsW < 120) {
        clsW = 120;
        flyW = Math.min(200, Math.max(96, rowBudget - clsW - GRID));
    }
    clsW = Math.min(Math.floor(rowBudget * 0.62), clsW);
    flyW = rowBudget - clsW - GRID;

    const bottomPad = 8;
    let rowY = innerH - btnH - bottomPad;
    const barH = 14;
    let barY = rowY - 12 - barH;
    let progLblY = barY - 14;
    const subBottom = 36 + 18;
    const tagY = 58;
    const showTag = progLblY >= tagY + 20;
    const minProgY = subBottom + (showTag ? 22 : 10);
    if (progLblY < minProgY) {
        progLblY = minProgY;
        barY = progLblY + 14;
        const minRowY = barY + barH + 8;
        if (rowY < minRowY) rowY = minRowY;
    }
    let useBtnH = btnH;
    if (rowY + useBtnH + bottomPad > innerH) {
        useBtnH = Math.max(36, innerH - bottomPad - rowY);
    }
    if (rowY + useBtnH + bottomPad > innerH) {
        rowY = Math.max(0, innerH - useBtnH - bottomPad);
        barY = Math.min(barY, rowY - 8 - barH);
        progLblY = barY - 14;
        if (progLblY < minProgY) {
            progLblY = minProgY;
            barY = progLblY + 14;
            rowY = Math.max(rowY, barY + barH + 6);
            useBtnH = Math.max(34, innerH - bottomPad - rowY);
        }
    }

    // ── Speed streak (structural, ties to title zone) ─────────────────────
    const streakMot = new Graphics();
    const smy = 16;
    [[0, 72, 0.13], [10, 55, 0.09], [20, 80, 0.11], [30, 40, 0.06], [40, 62, 0.08]].forEach(([dy, len, a]) => {
        const sx = contentW * 0.58 + (dy as number) * 0.3;
        streakMot.moveTo(sx, smy + (dy as number));
        streakMot.lineTo(sx + (len as number), smy + (dy as number) - (len as number) * 0.05);
        streakMot.stroke({ color: colors.cyan, width: 1, alpha: a as number });
    });
    content.addChild(streakMot);

    const continuitySeam = new Graphics();
    continuitySeam.roundRect(0, innerH - 2, contentW - 2, 2, 1);
    continuitySeam.fill({ color: colors.cyan, alpha: 0.22 });
    content.addChild(continuitySeam);
    const continuityShadow = new Graphics();
    continuityShadow.roundRect(0, innerH - 1, contentW - 2, 6, 2);
    continuityShadow.fill({ color: 0x07101b, alpha: 0.34 });
    content.addChild(continuityShadow);

    const title = new Text({
        text: 'VELOCITY',
        style: new TextStyle({
            fontFamily,
            fontSize: 32,
            fontWeight: '800',
            fill: colors.text,
            letterSpacing: 3,
            dropShadow: { alpha: 0.6, blur: 5, color: colors.cyan, distance: 0 },
            stroke: { color: 0x000000, width: 1 },
        }),
    });
    title.position.set(ox, 0);
    content.addChild(title);

    const sub = new Text({
        text: 'VOICE-POWERED FLIGHT',
        style: helpers.textStyle(11, '600', colors.muted, 1.5),
    });
    sub.position.set(ox, 40);
    content.addChild(sub);

    if (showTag) {
        const tag = new Text({
            text: 'Precision · Pitch · Signal',
            style: helpers.textStyle(12, '500', 0x55bbaa),
        });
        tag.position.set(ox, tagY);
        content.addChild(tag);
    }

    const emblemX = ox + contentW - rightEmblem / 2;
    const emblemY = 34;
    const rg = new Graphics();
    const emblemR = 26;
    if (helpers.drawHeroEmblem) {
        helpers.drawHeroEmblem(rg, emblemX, emblemY, emblemR);
    } else {
        rg.circle(emblemX, emblemY, emblemR);
        rg.stroke({ color: colors.cyan, width: 1.5, alpha: 0.35 });
        helpers.icoRadar(rg, emblemX, emblemY, 18);
    }
    content.addChild(rg);

    const rewardShimmer = new Graphics();
    rewardShimmer.position.set(emblemX - emblemR, emblemY - emblemR);
    content.addChild(rewardShimmer);

    const prog01 = prog.totalLevels > 0 ? prog.unlockedCount / prog.totalLevels : 0;
    const progLbl = new Text({
        text: `Routes  ${prog.unlockedCount} / ${prog.totalLevels}`,
        style: helpers.textStyle(12, '600', colors.muted),
    });
    progLbl.position.set(ox, progLblY);
    content.addChild(progLbl);

    const barW = Math.min(leftTitleMax, contentW - rightEmblem - GRID * 2);
    const kBar = helpers.kenneyProgressBar(barW, barH);
    if (kBar) {
        kBar.position.set(ox, barY);
        kBar.setProgress(prog01);
        content.addChild(kBar);
    } else {
        const bbg = new Graphics();
        bbg.roundRect(ox, barY, barW, 10, 5);
        bbg.fill({ color: 0x0a1018, alpha: 1 });
        bbg.stroke({ color: colors.border, width: 1, alpha: 0.6 });
        content.addChild(bbg);
        const f = new Graphics();
        f.roundRect(ox + 2, barY + 2, Math.max(4, (barW - 4) * prog01), 6, 3);
        f.fill({ color: colors.cyan, alpha: 0.9 });
        content.addChild(f);
    }

    const routeSweep = new Graphics();
    routeSweep.position.set(ox, barY);
    content.addChild(routeSweep);

    const cls = new Container();
    const cb = new Graphics();
    cb.roundRect(0, 0, clsW, useBtnH, 12);
    cb.fill({ color: 0x080e16, alpha: 1 });
    cb.stroke({ color: colors.gold, width: 1.5, alpha: 0.5 });
    cls.addChild(cb);
    const cbevel = new Graphics();
    cbevel.roundRect(2, 2, clsW - 4, Math.floor(useBtnH * 0.42), 10);
    cbevel.fill({ color: 0xffffff, alpha: 0.04 });
    cls.addChild(cbevel);
    const cstrip = new Graphics();
    cstrip.roundRect(6, 0, clsW - 12, 3, 1);
    cstrip.fill({ color: colors.gold, alpha: 0.55 });
    cls.addChild(cstrip);
    const wingX = 14;
    const textPad = 34;
    const wg = new Graphics();
    helpers.icoWing(wg, wingX, useBtnH / 2, 12);
    cls.addChild(wg);
    const clab = new Text({
        text: helpers.trunc(`CLASS: ${rank.toUpperCase()}`, Math.max(8, Math.floor((clsW - textPad - 8) / 7))),
        style: helpers.textStyle(12, '700', colors.gold),
    });
    clab.position.set(textPad, Math.floor((useBtnH - 13) / 2));
    cls.addChild(clab);
    const rankGlow = new Graphics();
    rankGlow.roundRect(0, 0, clsW, useBtnH, 12);
    rankGlow.stroke({ color: colors.gold, width: 2, alpha: 0.28 });
    cls.addChild(rankGlow);
    const rankPrestige = getVelocityCustomTexture('rank_prestige');
    if (rankPrestige) {
        const rs = new Sprite(rankPrestige);
        rs.anchor.set(1, 0);
        rs.width = 24;
        rs.height = 24;
        rs.position.set(clsW - 6, 5);
        rs.alpha = 0.9;
        cls.addChild(rs);
    }
    const bottomRailY = rowY;
    cls.position.set(ox, rowY);
    content.addChild(cls);

    const flyX = ox + clsW + GRID;
    const fly =
        helpers.kenneyButton('FLY NOW', flyW, useBtnH, 'button_accent', false, onFly) ??
        helpers.fallbackPrimaryBtn(flyW, useBtnH, 'FLY NOW', onFly);
    fly.label = 'heroFlyCta';
    fly.position.set(flyX, rowY);
    content.addChild(fly);

    return {
        flyCta: fly,
        routeBarW: barW,
        routeSweep,
        rankGlow,
        heroMotif: streakMot,
        rewardShimmer,
        heroGlow,
        bottomRailY,
    };
}
