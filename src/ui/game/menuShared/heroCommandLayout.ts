/**
 * Shared hero “command header” — explicit vertical bands (no overlap) + zoned class chip.
 */

import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { getVelocityCustomTexture } from '../velocityUiArt';
import { spriteIcon } from '../menuLandscape/kenneyLandscapeWidgets';

export type MainMenuProgressLite = {
    unlockedCount: number;
    totalLevels: number;
    /** Portrait featured card: route star bonus (two-line block above Routes). */
    rewardStars?: number;
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
    textStyle: (size: number, weight: '400' | '500' | '600' | '700' | '800', fill: number, letterSpacing?: number) => TextStyle;
    icoRadar: (g: Graphics, cx: number, cy: number, s: number) => void;
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
const TITLE_H = 34;
const SUB_H = 15;
const TAG_H = 14;
const GAP_STACK = 5;
const RIGHT_EMBLEM = 68;
const CLASS_ICON_LANE = 30;

export type HeroCommandMountResult = {
    flyCta: Container | null;
    routeBarW: number;
    routeSweep: Graphics;
    rankGlow: Graphics;
    heroMotif: Graphics;
    rewardShimmer: Graphics;
    heroGlow: Graphics;
    bottomRailY: number;
    /** First line Y for portrait route bonus (e.g. stars). */
    bonusLineY: number;
    /** Second line Y (e.g. “ROUTE BONUS”) — FIX C: never stack on one line. */
    bonusSecondLineY: number;
};

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

    const leftTextMax = Math.max(120, contentW - RIGHT_EMBLEM - GRID * 2);
    const btnHDefault = 48;
    const bottomPad = 8;
    const barH = 14;
    const progLblH = 15;
    const gapBarToRail = 10;

    let useBtnH = btnHDefault;
    let rowY = innerH - useBtnH - bottomPad;
    let barY = rowY - gapBarToRail - barH;
    let progLblY = barY - progLblH;

    const subY = TITLE_H + GAP_STACK;
    const tagY = subY + SUB_H + GAP_STACK;
    const minProgTop = tagY + TAG_H + GAP_STACK;
    if (progLblY < minProgTop) {
        progLblY = minProgTop;
        barY = progLblY + progLblH;
        rowY = barY + barH + gapBarToRail;
        if (rowY + useBtnH + bottomPad > innerH) {
            useBtnH = Math.max(36, innerH - bottomPad - rowY);
        }
        if (rowY + useBtnH + bottomPad > innerH) {
            rowY = Math.max(0, innerH - useBtnH - bottomPad);
            barY = Math.min(barY, rowY - gapBarToRail - barH);
            progLblY = barY - progLblH;
        }
    }

    const showTag = progLblY >= tagY + TAG_H + GAP_STACK;

    const rowBudget = Math.max(160, contentW - GRID * 2);
    let flyW = Math.min(220, Math.max(120, Math.floor(rowBudget * 0.48)));
    let clsW = rowBudget - flyW - GRID;
    if (clsW < 128) {
        clsW = 128;
        flyW = Math.max(96, rowBudget - clsW - GRID);
    }
    clsW = Math.min(Math.floor(rowBudget * 0.58), clsW);
    flyW = rowBudget - clsW - GRID;

    const titleMaxW = Math.max(100, leftTextMax - ox - 4);
    let titleFs = 32;
    let title: Text | null = null;
    for (; titleFs >= 22; titleFs -= 2) {
        const t2 = new Text({
            text: 'VELOCITY',
            style: new TextStyle({
                fontFamily,
                fontSize: titleFs,
                fontWeight: '800',
                fill: colors.text,
                letterSpacing: titleFs >= 28 ? 3 : 2,
                dropShadow: { alpha: 0.6, blur: 5, color: colors.cyan, distance: 0 },
                stroke: { color: 0x000000, width: 1 },
            }),
        });
        if (t2.width <= titleMaxW) {
            title = t2;
            break;
        }
        t2.destroy();
    }
    if (!title) {
        title = new Text({
            text: 'VELOCITY',
            style: new TextStyle({
                fontFamily,
                fontSize: 22,
                fontWeight: '800',
                fill: colors.text,
                letterSpacing: 2,
                dropShadow: { alpha: 0.6, blur: 5, color: colors.cyan, distance: 0 },
                stroke: { color: 0x000000, width: 1 },
            }),
        });
    }
    title.position.set(ox, 0);
    content.addChild(title);

    const sub = new Text({
        text: 'VOICE-POWERED FLIGHT',
        style: helpers.textStyle(11, '600', colors.muted, 1.5),
    });
    sub.position.set(ox, subY);
    content.addChild(sub);

    if (showTag) {
        const tag = new Text({
            text: 'Precision · Pitch · Signal',
            style: helpers.textStyle(12, '500', 0x55bbaa),
        });
        tag.position.set(ox, tagY);
        content.addChild(tag);
    }

    const emblemCx = ox + contentW - RIGHT_EMBLEM / 2;
    const emblemCy = Math.min(36, TITLE_H + SUB_H / 2 + 4);
    const emblemR = 26;
    const rg = new Graphics();
    if (helpers.drawHeroEmblem) {
        helpers.drawHeroEmblem(rg, emblemCx, emblemCy, emblemR);
    } else {
        rg.circle(emblemCx, emblemCy, emblemR);
        rg.stroke({ color: colors.cyan, width: 1.5, alpha: 0.35 });
        helpers.icoRadar(rg, emblemCx, emblemCy, 18);
    }
    content.addChild(rg);

    const rankTex = getVelocityCustomTexture('rank_prestige');
    if (rankTex) {
        const rs = new Sprite(rankTex);
        rs.anchor.set(0.5, 0.5);
        const br = Math.min(22, emblemR * 0.78);
        rs.width = br * 2;
        rs.height = br * 2;
        rs.position.set(emblemCx, emblemCy);
        rs.alpha = 0.9;
        content.addChild(rs);
    }

    const rewardShimmer = new Graphics();
    rewardShimmer.position.set(emblemCx - emblemR, emblemCy - emblemR);
    content.addChild(rewardShimmer);

    const motifRight = ox + contentW - RIGHT_EMBLEM - 6;
    const heroMotif = new Graphics();
    content.addChild(heroMotif);

    const contentFloor = (showTag ? tagY + TAG_H : subY + SUB_H) + 4;
    const bonusStars = prog.rewardStars;
    let bonusLineY = 0;
    let bonusSecondLineY = 0;
    if (bonusStars != null && bonusStars > 0) {
        const lineH = 13;
        const gapBetween = 4;
        const gapAboveRoutes = 3;
        let line2Y = progLblY - gapAboveRoutes - lineH;
        let line1Y = line2Y - gapBetween - lineH;
        if (line1Y < contentFloor) {
            const shift = contentFloor - line1Y;
            line1Y += shift;
            line2Y += shift;
        }
        if (line2Y + lineH > progLblY - gapAboveRoutes) {
            line2Y = progLblY - gapAboveRoutes - lineH;
            line1Y = line2Y - gapBetween - lineH;
        }
        bonusLineY = line1Y;
        bonusSecondLineY = line2Y;
        const starT = new Text({
            text: `${bonusStars}★`,
            style: helpers.textStyle(11, '700', colors.gold, 0.4),
        });
        starT.position.set(ox, bonusLineY);
        content.addChild(starT);
        const routeBonusT = new Text({
            text: 'ROUTE BONUS',
            style: helpers.textStyle(10, '700', colors.gold, 1.0),
        });
        routeBonusT.position.set(ox, bonusSecondLineY);
        content.addChild(routeBonusT);
    }

    const prog01 = prog.totalLevels > 0 ? prog.unlockedCount / prog.totalLevels : 0;
    const progLbl = new Text({
        text: `Routes  ${prog.unlockedCount} / ${prog.totalLevels}`,
        style: helpers.textStyle(12, '600', colors.muted),
    });
    progLbl.position.set(ox, progLblY);
    content.addChild(progLbl);

    const barW = Math.min(leftTextMax, motifRight - ox - GRID);
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

    const wingX = CLASS_ICON_LANE / 2;
    const classIcon = spriteIcon('menu_pilot_class_star', Math.min(22, CLASS_ICON_LANE - 2), colors.gold);
    if (classIcon) {
        classIcon.position.set(wingX, useBtnH / 2);
        classIcon.alpha = 0.95;
        cls.addChild(classIcon);
    } else {
        const wg = new Graphics();
        helpers.icoWing(wg, wingX, useBtnH / 2, 12);
        cls.addChild(wg);
    }

    const textX = CLASS_ICON_LANE;
    const maxLabelW = Math.max(48, clsW - textX - 10);
    const rankUpper = rank.toUpperCase();
    let labelText = `CLASS: ${rankUpper}`;
    let clab = new Text({
        text: labelText,
        style: helpers.textStyle(12, '700', colors.gold),
    });
    if (clab.width > maxLabelW) {
        clab.destroy();
        const maxChars = Math.max(6, Math.floor(maxLabelW / 7));
        labelText = helpers.trunc(`CLASS: ${rankUpper}`, maxChars);
        clab = new Text({
            text: labelText,
            style: helpers.textStyle(12, '700', colors.gold),
        });
    }
    clab.position.set(textX, Math.floor((useBtnH - 13) / 2));
    cls.addChild(clab);

    const rankGlow = new Graphics();
    rankGlow.roundRect(0, 0, clsW, useBtnH, 12);
    rankGlow.stroke({ color: colors.gold, width: 2, alpha: 0.28 });
    cls.addChild(rankGlow);

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
        heroMotif,
        rewardShimmer,
        heroGlow,
        bottomRailY: rowY,
        bonusLineY,
        bonusSecondLineY,
    };
}
