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
    /** If false, row shows locked (no confirm until unlock system exists). */
    unlocked?: boolean;
}

export const SONGS: Song[] = [
    {
        id: 'track_01',
        name: 'Neon Velocity',
        bpm: 128,
        unlocked: true,
        notes: [
            { time: 1.0, pitch: 0.5 },
            { time: 2.5, pitch: 0.7 },
            { time: 4.0, pitch: 0.3 },
            { time: 5.5, pitch: 0.8 },
            { time: 7.0, pitch: 0.4 },
            { time: 8.5, pitch: 0.6 },
            { time: 10.0, pitch: 0.5 },
        ],
    },
    {
        id: 'track_02',
        name: 'Pulse Grid',
        bpm: 140,
        unlocked: true,
        notes: [
            { time: 0.8, pitch: 0.35 },
            { time: 2.0, pitch: 0.62 },
            { time: 3.4, pitch: 0.48 },
            { time: 4.8, pitch: 0.78 },
            { time: 6.2, pitch: 0.42 },
            { time: 7.6, pitch: 0.55 },
            { time: 9.0, pitch: 0.68 },
            { time: 10.5, pitch: 0.5 },
        ],
    },
    {
        id: 'track_03',
        name: 'Locked Demo',
        bpm: 118,
        unlocked: false,
        notes: [
            { time: 1.2, pitch: 0.5 },
            { time: 2.8, pitch: 0.6 },
            { time: 4.4, pitch: 0.4 },
        ],
    },
];
