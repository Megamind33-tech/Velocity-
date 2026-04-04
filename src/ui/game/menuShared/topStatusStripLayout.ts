/**
 * Top utility rail — width budgets must never exceed `contentW` (no Math.max chip width
 * that inflates past available space → overlap / clipping).
 */

export type TopStripLayout = {
    avatarW: number;
    chipW: number;
    gap: number;
    chip0X: number;
    endPad: number;
};

const GAP = 8;
const END_PAD = 8;
/** Preferred chip width target; we shrink below this before overlapping parent. */
const TARGET_CHIP = 72;
const AVATAR_PREFERRED = 56;
const AVATAR_COMPACT = 50;
const AVATAR_MIN = 46;

function rawChipW(cw: number, avatar: number): number {
    return Math.floor((cw - avatar - GAP * 3 - END_PAD) / 3);
}

/**
 * Three equal chips after avatar. `chipW` is always the floor of available space
 * (never bumped upward past what fits).
 */
export function computeTopStripLayout(contentW: number): TopStripLayout {
    let av = AVATAR_PREFERRED;
    let chipW = rawChipW(contentW, av);
    if (chipW < TARGET_CHIP) {
        av = AVATAR_COMPACT;
        chipW = rawChipW(contentW, av);
    }
    if (chipW < TARGET_CHIP) {
        av = AVATAR_MIN;
        chipW = rawChipW(contentW, av);
    }
    chipW = Math.max(1, chipW);

    return {
        avatarW: av,
        chipW,
        gap: GAP,
        chip0X: av + GAP,
        endPad: END_PAD,
    };
}

/** Icon lane [0, iconEnd); text starts here. */
export const CHIP_TEXT_X = 28;
/** Right column reserved when a corner badge is shown (icon + padding). */
export const CHIP_BADGE_COL_W = 26;

export function chipLabelMaxW(chipW: number, hasBadge: boolean): number {
    const right = hasBadge ? CHIP_BADGE_COL_W + 4 : 6;
    return Math.max(24, chipW - CHIP_TEXT_X - right);
}

export function chipValueMaxW(chipW: number, hasBadge: boolean): number {
    const right = hasBadge ? CHIP_BADGE_COL_W + 4 : 6;
    return Math.max(28, chipW - CHIP_TEXT_X - right);
}
