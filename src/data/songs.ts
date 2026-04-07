/**
 * Mock MIDI/Rhythm data for level generation.
 * Maps time (seconds) to relative vertical pitch (0 to 1).
 */
export interface SongNote {
    time: number;
    pitch: number; // 0 (bottom) to 1 (top)
}

export interface Song {
    id: string;
    name: string;
    bpm: number;
    notes: SongNote[];
    /**
     * Real audio length in seconds (when known). Gate spawn times scale so the last gate
     * lands near this time — aligns world length with the song. Optional for mock charts.
     */
    durationSec?: number;
    /**
     * Optional backing track (e.g. `/music/jingle-bells.mp3`). When set, run length follows
     * `HTMLAudioElement.duration` after load, cruise speed is derived from last gate distance,
     * and level complete fires when the track ends.
     */
    audioUrl?: string;
}

export const SONGS: Song[] = [
    /**
     * Example: add `public/music/jingle-bells.mp3` (licensed file). Run length and cruise speed
     * follow the file’s real duration; session ends when the track ends.
     */
    {
        id: 'track_jingle',
        name: 'Jingle Bells',
        bpm: 120,
        notes: [
            { time: 2.0, pitch: 0.5 },
            { time: 4.0, pitch: 0.55 },
            { time: 6.0, pitch: 0.45 },
            { time: 8.0, pitch: 0.6 },
            { time: 10.0, pitch: 0.4 },
            { time: 12.0, pitch: 0.5 },
        ],
        audioUrl: 'music/jingle-bells.mp3',
    },
    // === ZONE 1: TUTORIAL (Levels 1-5) ===
    {
        id: 'track_01',
        name: 'First Flight',
        bpm: 80,
        notes: [
            { time: 2.0, pitch: 0.5 },
            { time: 4.0, pitch: 0.5 },
            { time: 6.0, pitch: 0.5 },
            { time: 8.0, pitch: 0.5 },
            { time: 10.0, pitch: 0.5 },
        ]
    },
    {
        id: 'track_02',
        name: 'Gentle Climb',
        bpm: 85,
        notes: [
            { time: 2.0, pitch: 0.5 },
            { time: 4.0, pitch: 0.45 },
            { time: 6.0, pitch: 0.4 },
            { time: 8.0, pitch: 0.55 },
            { time: 10.0, pitch: 0.6 },
            { time: 12.0, pitch: 0.5 },
        ]
    },
    {
        id: 'track_03',
        name: 'Sine Wave',
        bpm: 90,
        notes: [
            { time: 1.5, pitch: 0.5 },
            { time: 3.0, pitch: 0.65 },
            { time: 4.5, pitch: 0.5 },
            { time: 6.0, pitch: 0.35 },
            { time: 7.5, pitch: 0.5 },
            { time: 9.0, pitch: 0.65 },
            { time: 10.5, pitch: 0.5 },
        ]
    },
    {
        id: 'track_04',
        name: 'Quick Steps',
        bpm: 95,
        notes: [
            { time: 1.5, pitch: 0.5 },
            { time: 2.5, pitch: 0.6 },
            { time: 3.5, pitch: 0.4 },
            { time: 4.5, pitch: 0.55 },
            { time: 5.5, pitch: 0.45 },
            { time: 7.0, pitch: 0.6 },
            { time: 8.5, pitch: 0.5 },
        ]
    },
    {
        id: 'track_05',
        name: 'Wings Ready',
        bpm: 100,
        notes: [
            { time: 1.0, pitch: 0.5 },
            { time: 2.5, pitch: 0.65 },
            { time: 3.5, pitch: 0.35 },
            { time: 5.0, pitch: 0.7 },
            { time: 6.0, pitch: 0.3 },
            { time: 7.5, pitch: 0.55 },
            { time: 9.0, pitch: 0.5 },
            { time: 10.0, pitch: 0.5 },
        ]
    },

    // === ZONE 2: RHYTHM BASICS (Levels 6-10) ===
    {
        id: 'track_06',
        name: 'Beat Drop',
        bpm: 110,
        notes: [
            { time: 1.0, pitch: 0.5 },
            { time: 2.0, pitch: 0.7 },
            { time: 3.0, pitch: 0.3 },
            { time: 4.0, pitch: 0.6 },
            { time: 5.0, pitch: 0.4 },
            { time: 6.5, pitch: 0.75 },
            { time: 8.0, pitch: 0.25 },
            { time: 9.0, pitch: 0.5 },
        ]
    },
    {
        id: 'track_07',
        name: 'Melody Line',
        bpm: 115,
        notes: [
            { time: 1.0, pitch: 0.4 },
            { time: 2.0, pitch: 0.5 },
            { time: 3.0, pitch: 0.65 },
            { time: 4.0, pitch: 0.7 },
            { time: 5.0, pitch: 0.6 },
            { time: 6.0, pitch: 0.45 },
            { time: 7.0, pitch: 0.3 },
            { time: 8.0, pitch: 0.35 },
            { time: 9.5, pitch: 0.5 },
        ]
    },
    {
        id: 'track_08',
        name: 'Double Time',
        bpm: 128,
        notes: [
            { time: 0.8, pitch: 0.5 },
            { time: 1.6, pitch: 0.6 },
            { time: 2.4, pitch: 0.4 },
            { time: 3.2, pitch: 0.7 },
            { time: 4.0, pitch: 0.3 },
            { time: 4.8, pitch: 0.55 },
            { time: 5.6, pitch: 0.65 },
            { time: 6.4, pitch: 0.35 },
            { time: 7.2, pitch: 0.5 },
            { time: 8.0, pitch: 0.5 },
        ]
    },
    {
        id: 'track_09',
        name: 'High and Low',
        bpm: 120,
        notes: [
            { time: 1.0, pitch: 0.8 },
            { time: 2.0, pitch: 0.2 },
            { time: 3.5, pitch: 0.75 },
            { time: 5.0, pitch: 0.25 },
            { time: 6.0, pitch: 0.85 },
            { time: 7.0, pitch: 0.15 },
            { time: 8.5, pitch: 0.7 },
            { time: 10.0, pitch: 0.5 },
        ]
    },
    {
        id: 'track_10',
        name: 'Rhythm Master',
        bpm: 128,
        notes: [
            { time: 0.8, pitch: 0.5 },
            { time: 1.5, pitch: 0.75 },
            { time: 2.2, pitch: 0.3 },
            { time: 3.0, pitch: 0.8 },
            { time: 3.8, pitch: 0.2 },
            { time: 4.5, pitch: 0.65 },
            { time: 5.2, pitch: 0.35 },
            { time: 6.0, pitch: 0.7 },
            { time: 6.8, pitch: 0.4 },
            { time: 7.5, pitch: 0.6 },
            { time: 8.5, pitch: 0.5 },
        ]
    },

    // === ZONE 3: ADVANCED FLIGHT (Levels 11-15) ===
    {
        id: 'track_11',
        name: 'Zigzag',
        bpm: 130,
        notes: [
            { time: 0.8, pitch: 0.8 },
            { time: 1.4, pitch: 0.2 },
            { time: 2.0, pitch: 0.8 },
            { time: 2.6, pitch: 0.2 },
            { time: 3.2, pitch: 0.75 },
            { time: 3.8, pitch: 0.25 },
            { time: 4.4, pitch: 0.7 },
            { time: 5.0, pitch: 0.3 },
            { time: 5.8, pitch: 0.6 },
            { time: 6.6, pitch: 0.4 },
            { time: 7.5, pitch: 0.5 },
        ]
    },
    {
        id: 'track_12',
        name: 'Spiral Ascent',
        bpm: 125,
        notes: [
            { time: 0.8, pitch: 0.5 },
            { time: 1.6, pitch: 0.6 },
            { time: 2.4, pitch: 0.7 },
            { time: 3.2, pitch: 0.75 },
            { time: 4.0, pitch: 0.65 },
            { time: 4.8, pitch: 0.5 },
            { time: 5.6, pitch: 0.35 },
            { time: 6.4, pitch: 0.25 },
            { time: 7.2, pitch: 0.3 },
            { time: 8.0, pitch: 0.45 },
            { time: 8.8, pitch: 0.6 },
            { time: 9.6, pitch: 0.5 },
        ]
    },
    {
        id: 'track_13',
        name: 'Speed Burst',
        bpm: 140,
        notes: [
            { time: 0.5, pitch: 0.5 },
            { time: 1.0, pitch: 0.65 },
            { time: 1.5, pitch: 0.35 },
            { time: 2.0, pitch: 0.7 },
            { time: 2.3, pitch: 0.55 },
            { time: 2.6, pitch: 0.4 },
            { time: 3.0, pitch: 0.5 },
            { time: 4.0, pitch: 0.8 },
            { time: 4.3, pitch: 0.6 },
            { time: 4.6, pitch: 0.3 },
            { time: 5.0, pitch: 0.2 },
            { time: 6.0, pitch: 0.5 },
        ]
    },
    {
        id: 'track_14',
        name: 'Narrow Pass',
        bpm: 118,
        notes: [
            { time: 1.0, pitch: 0.5 },
            { time: 2.0, pitch: 0.52 },
            { time: 3.0, pitch: 0.48 },
            { time: 4.0, pitch: 0.55 },
            { time: 5.0, pitch: 0.45 },
            { time: 5.8, pitch: 0.58 },
            { time: 6.6, pitch: 0.42 },
            { time: 7.4, pitch: 0.6 },
            { time: 8.2, pitch: 0.4 },
            { time: 9.0, pitch: 0.5 },
        ]
    },
    {
        id: 'track_15',
        name: 'Sky Dancer',
        bpm: 135,
        notes: [
            { time: 0.6, pitch: 0.5 },
            { time: 1.2, pitch: 0.75 },
            { time: 1.8, pitch: 0.25 },
            { time: 2.5, pitch: 0.8 },
            { time: 3.0, pitch: 0.6 },
            { time: 3.5, pitch: 0.35 },
            { time: 4.2, pitch: 0.2 },
            { time: 4.8, pitch: 0.45 },
            { time: 5.5, pitch: 0.7 },
            { time: 6.2, pitch: 0.55 },
            { time: 7.0, pitch: 0.3 },
            { time: 7.8, pitch: 0.5 },
        ]
    },

    // === ZONE 4: EXPERT CHALLENGES (Levels 16-20) ===
    {
        id: 'track_16',
        name: 'Neon Velocity',
        bpm: 145,
        notes: [
            { time: 0.5, pitch: 0.5 },
            { time: 1.0, pitch: 0.8 },
            { time: 1.4, pitch: 0.2 },
            { time: 1.8, pitch: 0.75 },
            { time: 2.2, pitch: 0.3 },
            { time: 2.8, pitch: 0.85 },
            { time: 3.4, pitch: 0.15 },
            { time: 4.0, pitch: 0.6 },
            { time: 4.5, pitch: 0.4 },
            { time: 5.2, pitch: 0.7 },
            { time: 5.8, pitch: 0.35 },
            { time: 6.5, pitch: 0.5 },
        ]
    },
    {
        id: 'track_17',
        name: 'Storm Chaser',
        bpm: 150,
        notes: [
            { time: 0.4, pitch: 0.5 },
            { time: 0.9, pitch: 0.85 },
            { time: 1.3, pitch: 0.15 },
            { time: 1.8, pitch: 0.9 },
            { time: 2.2, pitch: 0.1 },
            { time: 2.7, pitch: 0.7 },
            { time: 3.1, pitch: 0.3 },
            { time: 3.6, pitch: 0.8 },
            { time: 4.0, pitch: 0.2 },
            { time: 4.5, pitch: 0.65 },
            { time: 5.0, pitch: 0.45 },
            { time: 5.5, pitch: 0.75 },
            { time: 6.0, pitch: 0.5 },
        ]
    },
    {
        id: 'track_18',
        name: 'Gravity Well',
        bpm: 138,
        notes: [
            { time: 0.6, pitch: 0.5 },
            { time: 1.2, pitch: 0.3 },
            { time: 1.6, pitch: 0.2 },
            { time: 2.0, pitch: 0.15 },
            { time: 2.5, pitch: 0.25 },
            { time: 3.0, pitch: 0.5 },
            { time: 3.5, pitch: 0.75 },
            { time: 3.9, pitch: 0.85 },
            { time: 4.3, pitch: 0.8 },
            { time: 4.8, pitch: 0.6 },
            { time: 5.3, pitch: 0.5 },
            { time: 6.0, pitch: 0.3 },
            { time: 6.5, pitch: 0.7 },
            { time: 7.0, pitch: 0.5 },
        ]
    },
    {
        id: 'track_19',
        name: 'Final Approach',
        bpm: 155,
        notes: [
            { time: 0.4, pitch: 0.5 },
            { time: 0.8, pitch: 0.7 },
            { time: 1.1, pitch: 0.3 },
            { time: 1.5, pitch: 0.8 },
            { time: 1.8, pitch: 0.2 },
            { time: 2.2, pitch: 0.9 },
            { time: 2.5, pitch: 0.1 },
            { time: 3.0, pitch: 0.6 },
            { time: 3.4, pitch: 0.4 },
            { time: 3.8, pitch: 0.75 },
            { time: 4.2, pitch: 0.25 },
            { time: 4.7, pitch: 0.65 },
            { time: 5.2, pitch: 0.5 },
            { time: 5.8, pitch: 0.5 },
        ]
    },
    {
        id: 'track_20',
        name: 'Velocity Overdrive',
        bpm: 160,
        notes: [
            { time: 0.3, pitch: 0.5 },
            { time: 0.7, pitch: 0.85 },
            { time: 1.0, pitch: 0.15 },
            { time: 1.3, pitch: 0.9 },
            { time: 1.6, pitch: 0.1 },
            { time: 2.0, pitch: 0.75 },
            { time: 2.3, pitch: 0.25 },
            { time: 2.7, pitch: 0.8 },
            { time: 3.0, pitch: 0.2 },
            { time: 3.4, pitch: 0.7 },
            { time: 3.7, pitch: 0.3 },
            { time: 4.1, pitch: 0.65 },
            { time: 4.4, pitch: 0.35 },
            { time: 4.8, pitch: 0.6 },
            { time: 5.2, pitch: 0.5 },
        ]
    },
];
