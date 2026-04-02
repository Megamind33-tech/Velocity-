/**
 * Mock rhythm charts for level generation.
 * Maps time (seconds) to relative vertical pitch (0 = bottom, 1 = top).
 */
export interface SongNote {
    time: number;
    pitch: number;
}

export const EDUCATIONAL_COPY = {
    steady_pitch: 'Hold a centered tone and let the lane teach stable pitch control.',
    small_steps: 'Move one lane at a time so your ear learns each interval cleanly.',
    phrase_air: 'Plan the breath before the long lane instead of chasing it late.',
    mix_bridge: 'Ease through the middle register and avoid pushing upward.',
    recovery_reset: 'If you miss a gate, recover on the next target and keep singing.',
    interval_leaps: 'Hear the landing pitch before the leap starts, then commit.',
    rhythm_lock: 'Enter the lane on time first, then fine-tune the pitch center.',
    pedal_hold: 'Hold the harmony lane steady and resist drifting toward the lead.',
    chord_tones: 'Root, third, and fifth should feel like separate landing pads.',
    moving_harmony: 'Track the harmony contour, not the imaginary melody line.',
    head_register: 'Stay tall and light in the upper lane instead of forcing volume.',
    tour_review: 'This run recycles earlier skills under tighter spacing.'
} as const;

export type EducationalCopyId = keyof typeof EDUCATIONAL_COPY;
export type LessonType =
    | 'melody'
    | 'harmony_static'
    | 'harmony_moving'
    | 'interval'
    | 'rhythm'
    | 'registration'
    | 'style';
export type HarmonyRole = 'none' | 'root' | 'third' | 'fifth' | 'moving' | 'pedal';
export type RegisterFocus = 'low' | 'mid' | 'high' | 'mixed';

export interface Song {
    id: string;
    name: string;
    bpm: number;
    notes: SongNote[];
    lessonType?: LessonType;
    primarySkill?: string;
    secondarySkills?: string[];
    harmonyRole?: HarmonyRole;
    registerFocus?: RegisterFocus;
    educationalCopyId?: EducationalCopyId;
    difficultyTier?: 1 | 2 | 3 | 4 | 5;
}

function sequence(pitches: number[], startTime: number = 1, step: number = 1.1): SongNote[] {
    return pitches.map((pitch, index) => ({
        time: Number((startTime + (index * step)).toFixed(2)),
        pitch
    }));
}

export const SONGS: Song[] = [
    {
        id: 'track_01',
        name: 'Neon Velocity',
        bpm: 120,
        lessonType: 'melody',
        primarySkill: 'pitch_center',
        secondarySkills: ['onset_clean'],
        harmonyRole: 'none',
        registerFocus: 'mid',
        educationalCopyId: 'steady_pitch',
        difficultyTier: 1,
        notes: sequence([0.5, 0.52, 0.48, 0.5, 0.54, 0.5, 0.46, 0.5], 1, 1.15)
    },
    {
        id: 'track_02',
        name: 'Skyline Steps',
        bpm: 122,
        lessonType: 'interval',
        primarySkill: 'interval_step',
        secondarySkills: ['pitch_center'],
        harmonyRole: 'none',
        registerFocus: 'mid',
        educationalCopyId: 'small_steps',
        difficultyTier: 1,
        notes: sequence([0.42, 0.5, 0.58, 0.5, 0.62, 0.54, 0.46, 0.5], 1, 1.05)
    },
    {
        id: 'track_03',
        name: 'Breathline Glide',
        bpm: 116,
        lessonType: 'melody',
        primarySkill: 'breath_phrase',
        secondarySkills: ['pitch_center'],
        harmonyRole: 'none',
        registerFocus: 'mid',
        educationalCopyId: 'phrase_air',
        difficultyTier: 1,
        notes: sequence([0.45, 0.45, 0.48, 0.48, 0.52, 0.52, 0.5, 0.5], 1, 0.95)
    },
    {
        id: 'track_04',
        name: 'Echo Ladder',
        bpm: 126,
        lessonType: 'interval',
        primarySkill: 'interval_step',
        secondarySkills: ['breath_phrase'],
        harmonyRole: 'none',
        registerFocus: 'mid',
        educationalCopyId: 'small_steps',
        difficultyTier: 2,
        notes: sequence([0.38, 0.46, 0.54, 0.62, 0.7, 0.62, 0.54, 0.46, 0.38], 1, 0.92)
    },
    {
        id: 'track_05',
        name: 'Mix Bridge',
        bpm: 124,
        lessonType: 'registration',
        primarySkill: 'register_mix',
        secondarySkills: ['pitch_center', 'onset_clean'],
        harmonyRole: 'none',
        registerFocus: 'mixed',
        educationalCopyId: 'mix_bridge',
        difficultyTier: 2,
        notes: sequence([0.45, 0.55, 0.63, 0.7, 0.74, 0.7, 0.63, 0.55, 0.48], 1, 0.96)
    },
    {
        id: 'track_06',
        name: 'Recovery Route',
        bpm: 128,
        lessonType: 'melody',
        primarySkill: 'pitch_center',
        secondarySkills: ['interval_step', 'recovery_reset'],
        harmonyRole: 'none',
        registerFocus: 'mid',
        educationalCopyId: 'recovery_reset',
        difficultyTier: 2,
        notes: sequence([0.52, 0.52, 0.4, 0.52, 0.52, 0.64, 0.52, 0.52], 1, 0.9)
    },
    {
        id: 'track_07',
        name: 'Leap Logic',
        bpm: 132,
        lessonType: 'interval',
        primarySkill: 'interval_skip',
        secondarySkills: ['pitch_center'],
        harmonyRole: 'none',
        registerFocus: 'mixed',
        educationalCopyId: 'interval_leaps',
        difficultyTier: 3,
        notes: sequence([0.38, 0.62, 0.42, 0.68, 0.46, 0.72, 0.5, 0.76], 1, 0.95)
    },
    {
        id: 'track_08',
        name: 'Pulse Runner',
        bpm: 138,
        lessonType: 'rhythm',
        primarySkill: 'rhythm_consonant',
        secondarySkills: ['pitch_center'],
        harmonyRole: 'none',
        registerFocus: 'mid',
        educationalCopyId: 'rhythm_lock',
        difficultyTier: 3,
        notes: sequence([0.48, 0.56, 0.48, 0.6, 0.52, 0.64, 0.56, 0.68, 0.6], 1, 0.78)
    },
    {
        id: 'track_09',
        name: 'Pedal Partner',
        bpm: 110,
        lessonType: 'harmony_static',
        primarySkill: 'harmony_static',
        secondarySkills: ['pitch_center', 'breath_phrase'],
        harmonyRole: 'pedal',
        registerFocus: 'mid',
        educationalCopyId: 'pedal_hold',
        difficultyTier: 2,
        notes: sequence([0.58, 0.58, 0.58, 0.58, 0.6, 0.6, 0.58, 0.58], 1, 0.82)
    },
    {
        id: 'track_10',
        name: 'Chord Tone Climb',
        bpm: 118,
        lessonType: 'harmony_static',
        primarySkill: 'harmony_chord_tone',
        secondarySkills: ['interval_step', 'harmony_static'],
        harmonyRole: 'moving',
        registerFocus: 'mixed',
        educationalCopyId: 'chord_tones',
        difficultyTier: 3,
        notes: sequence([0.44, 0.58, 0.72, 0.58, 0.44, 0.6, 0.74, 0.6], 1, 0.94)
    },
    {
        id: 'track_11',
        name: 'Third Above',
        bpm: 126,
        lessonType: 'harmony_moving',
        primarySkill: 'harmony_moving',
        secondarySkills: ['harmony_chord_tone', 'interval_step'],
        harmonyRole: 'third',
        registerFocus: 'mixed',
        educationalCopyId: 'moving_harmony',
        difficultyTier: 4,
        notes: sequence([0.6, 0.66, 0.7, 0.74, 0.68, 0.64, 0.6, 0.56], 1, 0.88)
    },
    {
        id: 'track_12',
        name: 'Counter Drift',
        bpm: 130,
        lessonType: 'harmony_moving',
        primarySkill: 'harmony_moving',
        secondarySkills: ['pitch_center', 'rhythm_consonant'],
        harmonyRole: 'moving',
        registerFocus: 'mixed',
        educationalCopyId: 'moving_harmony',
        difficultyTier: 4,
        notes: sequence([0.64, 0.58, 0.62, 0.54, 0.6, 0.5, 0.56, 0.46, 0.52], 1, 0.82)
    },
    {
        id: 'track_13',
        name: 'Headwind Focus',
        bpm: 124,
        lessonType: 'registration',
        primarySkill: 'register_head',
        secondarySkills: ['onset_clean', 'pitch_center'],
        harmonyRole: 'none',
        registerFocus: 'high',
        educationalCopyId: 'head_register',
        difficultyTier: 4,
        notes: sequence([0.68, 0.72, 0.76, 0.8, 0.78, 0.74, 0.7, 0.74], 1, 0.9)
    },
    {
        id: 'track_14',
        name: 'Tour of Intervals',
        bpm: 136,
        lessonType: 'style',
        primarySkill: 'interval_skip',
        secondarySkills: ['rhythm_consonant', 'register_mix'],
        harmonyRole: 'none',
        registerFocus: 'mixed',
        educationalCopyId: 'tour_review',
        difficultyTier: 5,
        notes: sequence([0.36, 0.5, 0.42, 0.58, 0.46, 0.64, 0.52, 0.7, 0.58, 0.74], 1, 0.82)
    },
    {
        id: 'track_15',
        name: 'Velocity Finale',
        bpm: 140,
        lessonType: 'melody',
        primarySkill: 'pitch_center',
        secondarySkills: ['interval_skip', 'harmony_moving', 'rhythm_consonant'],
        harmonyRole: 'moving',
        registerFocus: 'mixed',
        educationalCopyId: 'tour_review',
        difficultyTier: 5,
        notes: sequence([0.48, 0.62, 0.54, 0.72, 0.6, 0.78, 0.56, 0.7, 0.5, 0.64, 0.44, 0.58], 1, 0.78)
    }
];
