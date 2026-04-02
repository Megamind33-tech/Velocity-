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
}

export const SONGS: Song[] = [
    {
        id: 'track_01',
        name: 'Neon Velocity',
        bpm: 128,
        notes: [
            { time: 1.0, pitch: 0.5 },
            { time: 2.5, pitch: 0.7 },
            { time: 4.0, pitch: 0.3 },
            { time: 5.5, pitch: 0.8 },
            { time: 7.0, pitch: 0.4 },
            { time: 8.5, pitch: 0.6 },
            { time: 10.0, pitch: 0.5 }
        ]
    }
];
