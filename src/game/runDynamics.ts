/**
 * Dynamic cruise multiplier from score, distance, combo, perfect streak, silence.
 */
import {
    CRUISE_LOW_COMBO_PENALTY,
    CRUISE_MAX_MULT,
    CRUISE_MIN_MULT,
    CRUISE_PERFECT_STREAK_DIV,
    CRUISE_SCORE_DIV,
    CRUISE_SCROLL_DIV,
    CRUISE_SILENCE_PENALTY,
} from './vocalFlightRules';

export function computeDynamicCruiseMult(
    score: number,
    scrollX: number,
    comboTier: number,
    perfectStreak: number,
    silentFrames: number,
): number {
    let m = 1;
    m += score / CRUISE_SCORE_DIV;
    m += scrollX / CRUISE_SCROLL_DIV;
    m += perfectStreak / CRUISE_PERFECT_STREAK_DIV;
    if (comboTier <= 1 && score > 500) m *= CRUISE_LOW_COMBO_PENALTY;
    if (silentFrames > 45) m *= CRUISE_SILENCE_PENALTY;
    return Math.max(CRUISE_MIN_MULT, Math.min(CRUISE_MAX_MULT, m));
}
