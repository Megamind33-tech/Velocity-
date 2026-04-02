/**
 * Vocal training tiers — each tier has its own songs, pacing, and difficulty curve.
 */
export const VOCAL_STAGES = [
    'beginner',
    'intermediate',
    'amateur',
    'semiPro',
    'pro',
    'legendary',
    'masterLegendary',
] as const;

export type VocalStage = (typeof VOCAL_STAGES)[number];

export const STAGE_LABEL: Record<VocalStage, string> = {
    beginner: 'BEGINNER',
    intermediate: 'INTERMEDIATE',
    amateur: 'AMATEUR',
    semiPro: 'SEMI-PRO',
    pro: 'PRO',
    legendary: 'LEGENDARY',
    masterLegendary: 'MASTER LEGENDARY',
};

export function stageIndex(s: VocalStage): number {
    return VOCAL_STAGES.indexOf(s);
}
