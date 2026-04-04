/**
 * Hard width budgets for main menu top rail — prevents chip clipping when
 * avatar + 3 chips + gaps exceed content width (common on portrait ~320–430).
 */

export type TopStripLayout = {
    avatarW: number;
    chipW: number;
    gap: number;
    chip0X: number;
    endPad: number;
};

const GAP = 8;
const END_PAD = 6;
const MIN_CHIP = 76;
const AVATAR_PREFERRED = 58;
const AVATAR_COMPACT = 52;

/**
 * Three equal chips after avatar; chip width derived from remaining space (never optimistic).
 */
export function computeTopStripLayout(contentW: number): TopStripLayout {
    let av = AVATAR_PREFERRED;
    // chip0X = avatar + gap; three chips + two inter-chip gaps + end pad
    const chipW = Math.floor((contentW - av - GAP * 3 - END_PAD) / 3);
    const useCompactAvatar = chipW < MIN_CHIP;
    if (useCompactAvatar) {
        av = AVATAR_COMPACT;
    }
    const wChip = Math.max(
        MIN_CHIP,
        Math.floor((contentW - av - GAP * 3 - END_PAD) / 3),
    );
    return {
        avatarW: av,
        chipW: wChip,
        gap: GAP,
        chip0X: av + GAP,
        endPad: END_PAD,
    };
}

/** Lanes inside each stat chip (icon | label+value | badge). */
export const CHIP_TEXT_X = 30;
export const CHIP_BADGE_RESERVE = 24;
