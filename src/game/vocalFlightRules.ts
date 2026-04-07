/**
 * Vocal Flight — official tuning table & scoring (single source of truth).
 * @see docs/game/VELOCITY_OFFICIAL_RULES_PLAN.md
 */

export type FlightDifficulty = 'easy' | 'medium' | 'hard';

export type DifficultyPreset = {
    /** Frames between gate spawns (reference; timeline still song-driven) */
    spawnIntervalFrames: number;
    /** Maximum vertical gap size (px) for pitch/volume gates */
    gapMaxPx: number;
    /** Beats allowed to traverse one gate segment (BPM speed hint) */
    beatsToCross: number;
    /** Score multiplier for base gate points */
    scoreMultiplier: number;
    /** Hard-only: silent frames at top/bottom before stall crash */
    breathPenaltyFrames: number;
};

export const DIFFICULTY_PRESETS: Record<FlightDifficulty, DifficultyPreset> = {
    easy: {
        spawnIntervalFrames: 180,
        gapMaxPx: 160,
        beatsToCross: 6,
        scoreMultiplier: 0.8,
        breathPenaltyFrames: 0,
    },
    medium: {
        spawnIntervalFrames: 150,
        gapMaxPx: 120,
        beatsToCross: 4,
        scoreMultiplier: 1.0,
        breathPenaltyFrames: 0,
    },
    hard: {
        spawnIntervalFrames: 110,
        gapMaxPx: 80,
        beatsToCross: 3,
        scoreMultiplier: 1.5,
        breathPenaltyFrames: 30,
    },
};

/** Perfect pass: within this many px of gap center vertically */
export const PERFECT_DISTANCE_PX = 30;
/** Perfect pass: sung pitch within this many cents of gate target */
export const PERFECT_CENTS = 15;

/** Volume gate: RMS below this → nearly closed */
export const VOLUME_GATE_RMS_MIN = 0.12;
/** Volume gate: RMS at/above this → full gap */
export const VOLUME_GATE_RMS_MAX = 0.22;
/** Minimum gap when “closed” (px) */
export const VOLUME_GATE_GAP_CLOSED_PX = 28;

/** Silence: sink speed = 2 px/frame @ 60fps */
export const SILENCE_SINK_PX_PER_FRAME = 2;
export const SILENCE_SINK_PX_PER_SEC = SILENCE_SINK_PX_PER_FRAME * 60;

/** Pitch steering lerp (spec 0.15) */
export const PITCH_Y_LERP = 0.15;

/** Combo multiplier tier every N gate passes */
export const COMBO_TIER_EVERY = 5;
export const COMBO_MULT_CAP = 4;

/** Base points per gate before multipliers */
export const BASE_GATE_POINTS = 100;
export const COLLECTIBLE_GOLD_POINTS = 500;

/** Player hit radius added to gap half-height */
export const PLAYER_GATE_HIT_RADIUS = 18;
/** Gate obstacle thickness in scroll space (logical X) */
export const GATE_OBSTACLE_HALF_WIDTH = 36;

/** Dynamic cruise scaling */
export const CRUISE_SCORE_DIV = 8000;
export const CRUISE_SCROLL_DIV = 12000;
export const CRUISE_PERFECT_STREAK_DIV = 12;
export const CRUISE_SILENCE_PENALTY = 0.92;
export const CRUISE_LOW_COMBO_PENALTY = 0.97;
export const CRUISE_MIN_MULT = 0.65;
export const CRUISE_MAX_MULT = 1.45;

/** Visor parallax (default sky): layer tile scale & fog */
export const VISOR_LAYER_SCALES = [0.3, 0.55, 0.8] as const;
export const VISOR_LAYER_WORLD_LOCK = [0.98, 0.94, 0.9] as const;
export const VISOR_LAYER_FOG_ALPHA = [0.45, 0.28, 0.12] as const;

export function getDifficultyPreset(d: FlightDifficulty | undefined): DifficultyPreset {
    return DIFFICULTY_PRESETS[d ?? 'medium'];
}

export function perfectStreakBonusMultiplier(streak: number): number {
    return Math.min(3, 1 + streak * 0.15);
}
