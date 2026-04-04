/**
 * Hard max-width labels — no clipping, no wall-touching (caller adds padding in maxWidth).
 */

import { Text, TextStyle } from 'pixi.js';
import { truncChars } from './missionCardLayout';

/**
 * Try descending font sizes; then truncate if still too wide at minFont.
 */
export function fitLabelToWidth(
    fullText: string,
    maxWidth: number,
    buildStyle: (fontSize: number) => TextStyle,
    maxFont: number,
    minFont: number,
): Text {
    const safeW = Math.max(40, maxWidth);
    for (let fs = maxFont; fs >= minFont; fs -= 1) {
        const t = new Text({ text: fullText, style: buildStyle(fs) });
        if (t.width <= safeW) return t;
        t.destroy();
    }
    for (let n = fullText.length; n >= 1; n -= 1) {
        const s = truncChars(fullText, n);
        const t = new Text({ text: s, style: buildStyle(minFont) });
        if (t.width <= safeW) return t;
        t.destroy();
    }
    return new Text({ text: '…', style: buildStyle(minFont) });
}
