/**
 * Shared mission / event card zone math + text fitting (portrait + landscape).
 * Hard vertical bands prevent title / subtitle / meta / helper / reward collisions.
 */

import { Text, TextStyle } from 'pixi.js';

/** ~px per character at fontSize 15–17 with Kenney Future (uppercase names) */
export const CHAR_PX_TITLE = 7.4;
export const CHAR_PX_BODY = 6.0;
export const CHAR_PX_SMALL = 5.2;

export type CardVerticalBands = {
    rowH: number;
    padT: number;
    centerX: number;
    centerW: number;
    titleY: number;
    titleMaxH: number;
    tierY: number;
    tierH: number;
    subY: number;
    subMaxH: number;
    metaY: number;
    metaH: number;
    helpY: number;
    helpH: number;
    rewardY: number;
    rewardH: number;
};

/**
 * Fixed band stack (ratios of row height). Subtitle gets all space between tier strip and meta.
 */
export function computeCardVerticalBands(
    rowH: number,
    centerX: number,
    centerW: number,
    hasEliteTier: boolean,
): CardVerticalBands {
    const padT = Math.max(6, Math.floor(rowH * 0.07));
    const titleH = Math.max(17, Math.floor(rowH * 0.19));
    const tierH = hasEliteTier ? Math.max(14, Math.floor(rowH * 0.14)) : 0;
    const gapSm = Math.max(3, Math.floor(rowH * 0.03));
    const metaH = Math.max(14, Math.floor(rowH * 0.14));
    const helpH = Math.max(12, Math.floor(rowH * 0.11));
    const rewardH = Math.max(15, Math.floor(rowH * 0.16));
    const rewardY = rowH - rewardH - Math.max(4, Math.floor(rowH * 0.04));
    const helpY = rewardY - helpH - gapSm;
    const metaY = helpY - metaH - gapSm;
    const titleY = padT;
    const tierY = titleY + titleH + gapSm;
    const subY = (hasEliteTier ? tierY + tierH : titleY + titleH) + gapSm;
    const subMaxH = Math.max(14, metaY - subY - gapSm);

    return {
        rowH,
        padT,
        centerX,
        centerW,
        titleY,
        titleMaxH: titleH,
        tierY,
        tierH,
        subY,
        subMaxH,
        metaY,
        metaH,
        helpY,
        helpH,
        rewardY,
        rewardH,
    };
}

export function truncChars(s: string, maxChars: number): string {
    if (s.length <= maxChars) return s;
    return `${s.slice(0, Math.max(0, maxChars - 1))}…`;
}

/** Single-line title: shrink font until it fits or hit floor. */
export function fitTitleText(
    fullText: string,
    maxWidth: number,
    reserveRightForTag: number,
    styleBase: { fontFamily: string; fontWeight: string; letterSpacing?: number; fill: number },
    maxFont = 16,
    minFont = 12,
): Text {
    const usable = Math.max(40, maxWidth - reserveRightForTag - 4);
    let fs = maxFont;
    let t: Text | null = null;
    for (; fs >= minFont; fs -= 1) {
        const t2 = new Text({
            text: fullText,
            style: new TextStyle({
                fontFamily: styleBase.fontFamily,
                fontSize: fs,
                fontWeight: styleBase.fontWeight as '700' | '800',
                fill: styleBase.fill,
                letterSpacing: styleBase.letterSpacing ?? 0.2,
            }),
        });
        if (t2.width <= usable) {
            t = t2;
            break;
        }
        t2.destroy();
    }
    if (!t) {
        const approxChars = Math.max(6, Math.floor(usable / CHAR_PX_TITLE));
        t = new Text({
            text: truncChars(fullText, approxChars),
            style: new TextStyle({
                fontFamily: styleBase.fontFamily,
                fontSize: minFont,
                fontWeight: styleBase.fontWeight as '700' | '800',
                fill: styleBase.fill,
                letterSpacing: styleBase.letterSpacing ?? 0.2,
            }),
        });
    }
    return t;
}

/** Multi-line body inside a fixed vertical slot: word wrap + font downscale. */
export function fitBodyText(
    fullText: string,
    zoneW: number,
    maxHeight: number,
    styleBase: { fontFamily: string; fontWeight: string; fill: number; letterSpacing?: number },
    maxFont = 11,
    minFont = 9,
): Text {
    let fs = maxFont;
    for (; fs >= minFont; fs -= 1) {
        const t = new Text({
            text: fullText,
            style: new TextStyle({
                fontFamily: styleBase.fontFamily,
                fontSize: fs,
                fontWeight: styleBase.fontWeight as '500' | '600',
                fill: styleBase.fill,
                letterSpacing: styleBase.letterSpacing ?? 0,
                wordWrap: true,
                wordWrapWidth: Math.max(40, zoneW - 4),
                breakWords: true,
            }),
        });
        if (t.height <= maxHeight) return t;
        t.destroy();
    }
    const approx = Math.max(24, Math.floor((zoneW / CHAR_PX_BODY) * (maxHeight / 12)));
    return new Text({
        text: truncChars(fullText, approx),
        style: new TextStyle({
            fontFamily: styleBase.fontFamily,
            fontSize: minFont,
            fontWeight: '500',
            fill: styleBase.fill,
            wordWrap: true,
            wordWrapWidth: Math.max(40, zoneW - 4),
            breakWords: true,
        }),
    });
}

export function fitOneLineSmall(
    textStr: string,
    maxWidth: number,
    styleBase: { fontFamily: string; fontWeight: string; fill: number; letterSpacing?: number; fontSize: number },
): Text {
    const st = new TextStyle({
        fontFamily: styleBase.fontFamily,
        fontSize: styleBase.fontSize,
        fontWeight: styleBase.fontWeight as '600' | '700' | '800',
        fill: styleBase.fill,
        letterSpacing: styleBase.letterSpacing ?? 0,
    });
    let t = new Text({ text: textStr, style: st });
    if (t.width <= maxWidth) return t;
    t.destroy();
    const approx = Math.max(8, Math.floor(maxWidth / CHAR_PX_SMALL));
    return new Text({ text: truncChars(textStr, approx), style: st });
}
