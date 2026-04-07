import { SONGS, Song } from './songs';

export type ZoneId = 'tutorial' | 'rhythm_basics' | 'advanced_flight' | 'expert';

export interface LearningObjective {
    id: string;
    label: string;
    hint: string;
}

export interface LevelDefinition {
    id: number;
    name: string;
    zone: ZoneId;
    songId: string;
    gateWidth: number;
    gateCount: number;
    scrollSpeed: number;
    learningObjectives: LearningObjective[];
    starThresholds: { one: number; two: number; three: number };
    unlockRequirement: number;
}

export interface ZoneDefinition {
    id: ZoneId;
    name: string;
    description: string;
    color: number;
    accentColor: number;
    levelRange: [number, number];
}

export const ZONES: ZoneDefinition[] = [
    {
        id: 'tutorial',
        name: 'Launch Pad',
        description: 'Learn to fly — voice controls, altitude, and steady flight.',
        color: 0x00ffcc,
        accentColor: 0x00cc99,
        levelRange: [1, 5],
    },
    {
        id: 'rhythm_basics',
        name: 'Rhythm Valley',
        description: 'Feel the beat — follow rhythm patterns and time your gates.',
        color: 0x3399ff,
        accentColor: 0x2266cc,
        levelRange: [6, 10],
    },
    {
        id: 'advanced_flight',
        name: 'Sky Gauntlet',
        description: 'Push your limits — tight maneuvers, fast transitions, narrow gaps.',
        color: 0xff6633,
        accentColor: 0xcc4422,
        levelRange: [11, 15],
    },
    {
        id: 'expert',
        name: 'Velocity Core',
        description: 'Master the storm — extreme speed, precision, and endurance.',
        color: 0xff0066,
        accentColor: 0xcc0044,
        levelRange: [16, 20],
    },
];

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
    // === ZONE 1: TUTORIAL (Launch Pad) ===
    {
        id: 1,
        name: 'First Flight',
        zone: 'tutorial',
        songId: 'track_01',
        gateWidth: 220,
        gateCount: 12,
        scrollSpeed: 155,
        learningObjectives: [
            { id: 'fly_straight', label: 'Fly Straight', hint: 'Hold a steady pitch to stay level.' },
        ],
        starThresholds: { one: 5, two: 9, three: 12 },
        unlockRequirement: 0,
    },
    {
        id: 2,
        name: 'Gentle Climb',
        zone: 'tutorial',
        songId: 'track_02',
        gateWidth: 210,
        gateCount: 6,
        scrollSpeed: 190,
        learningObjectives: [
            { id: 'pitch_up', label: 'Pitch Up', hint: 'Raise your voice pitch to climb higher.' },
        ],
        starThresholds: { one: 3, two: 5, three: 6 },
        unlockRequirement: 1,
    },
    {
        id: 3,
        name: 'Sine Wave',
        zone: 'tutorial',
        songId: 'track_03',
        gateWidth: 200,
        gateCount: 7,
        scrollSpeed: 200,
        learningObjectives: [
            { id: 'wave_motion', label: 'Wave Motion', hint: 'Alternate high and low pitch in a smooth wave.' },
        ],
        starThresholds: { one: 3, two: 5, three: 7 },
        unlockRequirement: 2,
    },
    {
        id: 4,
        name: 'Quick Steps',
        zone: 'tutorial',
        songId: 'track_04',
        gateWidth: 190,
        gateCount: 7,
        scrollSpeed: 210,
        learningObjectives: [
            { id: 'quick_adjust', label: 'Quick Adjustments', hint: 'React faster — gates come closer together now.' },
        ],
        starThresholds: { one: 3, two: 5, three: 7 },
        unlockRequirement: 3,
    },
    {
        id: 5,
        name: 'Wings Ready',
        zone: 'tutorial',
        songId: 'track_05',
        gateWidth: 180,
        gateCount: 8,
        scrollSpeed: 220,
        learningObjectives: [
            { id: 'graduate_tutorial', label: 'Tutorial Complete', hint: 'Use everything you learned — fly the full course!' },
        ],
        starThresholds: { one: 4, two: 6, three: 8 },
        unlockRequirement: 4,
    },

    // === ZONE 2: RHYTHM BASICS (Rhythm Valley) ===
    {
        id: 6,
        name: 'Beat Drop',
        zone: 'rhythm_basics',
        songId: 'track_06',
        gateWidth: 170,
        gateCount: 8,
        scrollSpeed: 240,
        learningObjectives: [
            { id: 'follow_rhythm', label: 'Follow the Rhythm', hint: 'Gates appear on the beat — feel the tempo.' },
        ],
        starThresholds: { one: 4, two: 6, three: 8 },
        unlockRequirement: 5,
    },
    {
        id: 7,
        name: 'Melody Line',
        zone: 'rhythm_basics',
        songId: 'track_07',
        gateWidth: 165,
        gateCount: 9,
        scrollSpeed: 250,
        learningObjectives: [
            { id: 'follow_melody', label: 'Follow the Melody', hint: 'Gates trace a melody — match the pattern with your voice.' },
        ],
        starThresholds: { one: 4, two: 7, three: 9 },
        unlockRequirement: 6,
    },
    {
        id: 8,
        name: 'Double Time',
        zone: 'rhythm_basics',
        songId: 'track_08',
        gateWidth: 160,
        gateCount: 10,
        scrollSpeed: 270,
        learningObjectives: [
            { id: 'double_speed', label: 'Double Time', hint: 'Tempo doubles — keep up with rapid gate patterns.' },
        ],
        starThresholds: { one: 5, two: 8, three: 10 },
        unlockRequirement: 7,
    },
    {
        id: 9,
        name: 'High and Low',
        zone: 'rhythm_basics',
        songId: 'track_09',
        gateWidth: 155,
        gateCount: 8,
        scrollSpeed: 260,
        learningObjectives: [
            { id: 'extreme_range', label: 'Full Range', hint: 'Gates span top-to-bottom — stretch your vocal range.' },
        ],
        starThresholds: { one: 4, two: 6, three: 8 },
        unlockRequirement: 8,
    },
    {
        id: 10,
        name: 'Rhythm Master',
        zone: 'rhythm_basics',
        songId: 'track_10',
        gateWidth: 150,
        gateCount: 11,
        scrollSpeed: 280,
        learningObjectives: [
            { id: 'rhythm_mastery', label: 'Rhythm Mastery', hint: 'Combine everything — speed, range, and timing.' },
        ],
        starThresholds: { one: 5, two: 8, three: 11 },
        unlockRequirement: 9,
    },

    // === ZONE 3: ADVANCED FLIGHT (Sky Gauntlet) ===
    {
        id: 11,
        name: 'Zigzag',
        zone: 'advanced_flight',
        songId: 'track_11',
        gateWidth: 145,
        gateCount: 11,
        scrollSpeed: 300,
        learningObjectives: [
            { id: 'zigzag', label: 'Zigzag Maneuver', hint: 'Rapidly alternate altitude with tight timing.' },
        ],
        starThresholds: { one: 5, two: 8, three: 11 },
        unlockRequirement: 10,
    },
    {
        id: 12,
        name: 'Spiral Ascent',
        zone: 'advanced_flight',
        songId: 'track_12',
        gateWidth: 140,
        gateCount: 12,
        scrollSpeed: 290,
        learningObjectives: [
            { id: 'sustained_climb', label: 'Sustained Patterns', hint: 'Hold pitch changes smoothly through long sequences.' },
        ],
        starThresholds: { one: 6, two: 9, three: 12 },
        unlockRequirement: 11,
    },
    {
        id: 13,
        name: 'Speed Burst',
        zone: 'advanced_flight',
        songId: 'track_13',
        gateWidth: 135,
        gateCount: 12,
        scrollSpeed: 330,
        learningObjectives: [
            { id: 'burst_speed', label: 'Speed Burst', hint: 'Clusters of rapid gates demand instant reflexes.' },
        ],
        starThresholds: { one: 6, two: 9, three: 12 },
        unlockRequirement: 12,
    },
    {
        id: 14,
        name: 'Narrow Pass',
        zone: 'advanced_flight',
        songId: 'track_14',
        gateWidth: 120,
        gateCount: 10,
        scrollSpeed: 280,
        learningObjectives: [
            { id: 'precision', label: 'Precision Flying', hint: 'Gates are narrow — fine-tune your pitch control.' },
        ],
        starThresholds: { one: 5, two: 8, three: 10 },
        unlockRequirement: 13,
    },
    {
        id: 15,
        name: 'Sky Dancer',
        zone: 'advanced_flight',
        songId: 'track_15',
        gateWidth: 130,
        gateCount: 12,
        scrollSpeed: 320,
        learningObjectives: [
            { id: 'graceful_flight', label: 'Graceful Flight', hint: 'Flow through complex patterns with grace and control.' },
        ],
        starThresholds: { one: 6, two: 9, three: 12 },
        unlockRequirement: 14,
    },

    // === ZONE 4: EXPERT CHALLENGES (Velocity Core) ===
    {
        id: 16,
        name: 'Neon Velocity',
        zone: 'expert',
        songId: 'track_16',
        gateWidth: 120,
        gateCount: 12,
        scrollSpeed: 350,
        learningObjectives: [
            { id: 'fast_zigzag', label: 'Fast Zigzag', hint: 'Extreme zigzag at blistering speed.' },
        ],
        starThresholds: { one: 6, two: 9, three: 12 },
        unlockRequirement: 15,
    },
    {
        id: 17,
        name: 'Storm Chaser',
        zone: 'expert',
        songId: 'track_17',
        gateWidth: 115,
        gateCount: 13,
        scrollSpeed: 370,
        learningObjectives: [
            { id: 'endurance', label: 'Endurance Run', hint: 'A long gauntlet of dense gates at max tempo.' },
        ],
        starThresholds: { one: 6, two: 10, three: 13 },
        unlockRequirement: 16,
    },
    {
        id: 18,
        name: 'Gravity Well',
        zone: 'expert',
        songId: 'track_18',
        gateWidth: 110,
        gateCount: 14,
        scrollSpeed: 340,
        learningObjectives: [
            { id: 'gravity', label: 'Gravity Pull', hint: 'Gates plunge and soar — fight the gravity well.' },
        ],
        starThresholds: { one: 7, two: 11, three: 14 },
        unlockRequirement: 17,
    },
    {
        id: 19,
        name: 'Final Approach',
        zone: 'expert',
        songId: 'track_19',
        gateWidth: 105,
        gateCount: 14,
        scrollSpeed: 380,
        learningObjectives: [
            { id: 'final_test', label: 'Final Test', hint: 'Everything at maximum intensity — prove your mastery.' },
        ],
        starThresholds: { one: 7, two: 11, three: 14 },
        unlockRequirement: 18,
    },
    {
        id: 20,
        name: 'Velocity Overdrive',
        zone: 'expert',
        songId: 'track_20',
        gateWidth: 100,
        gateCount: 15,
        scrollSpeed: 400,
        learningObjectives: [
            { id: 'overdrive', label: 'Overdrive', hint: 'The ultimate challenge — fastest speed, smallest gates, most notes.' },
        ],
        starThresholds: { one: 7, two: 12, three: 15 },
        unlockRequirement: 19,
    },
    {
        id: 101,
        name: 'Jingle Bells',
        zone: 'tutorial',
        songId: 'track_jingle',
        gateWidth: 200,
        gateCount: 24,
        scrollSpeed: 160,
        learningObjectives: [
            { id: 'sing_along', label: 'Sing Along', hint: 'Higher notes pull you up; lower notes pull you down.' },
        ],
        starThresholds: { one: 8, two: 16, three: 24 },
        unlockRequirement: 0,
    },
];

export function getLevelDefinition(levelId: number): LevelDefinition | undefined {
    return LEVEL_DEFINITIONS.find(l => l.id === levelId);
}

export function getZoneForLevel(levelId: number): ZoneDefinition | undefined {
    return ZONES.find(z => levelId >= z.levelRange[0] && levelId <= z.levelRange[1]);
}

export function getSongForLevel(levelDef: LevelDefinition): Song | undefined {
    return SONGS.find(s => s.id === levelDef.songId);
}

export function getUnlockedLevels(completedLevelIds: number[]): number[] {
    return LEVEL_DEFINITIONS
        .filter(l => l.unlockRequirement === 0 || completedLevelIds.includes(l.unlockRequirement))
        .map(l => l.id);
}
