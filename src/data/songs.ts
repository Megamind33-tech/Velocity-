/**
 * Chart definitions: vocal training tiers, star gates, secret credit unlocks, per-chart speed & look.
 * Same musical idea can appear at multiple difficulties via `sourceTrackKey`.
 */
import type { VocalStage } from './vocalStages';

export interface SongNote {
    time: number;
    pitch: number;
}

export interface Song {
    id: string;
    /** Grouping for UI and progression */
    stage: VocalStage;
    orderInStage: number;
    /** Same tune, harder chart */
    sourceTrackKey?: string;
    name: string;
    displaySubtitle?: string;
    bpm: number;
    notes: SongNote[];
    /** Career stars required to play (unless permanently unlocked via credits). */
    starsRequired: number;
    /** Hidden in list until unlocked by stars/credits */
    secret?: boolean;
    /** One-time permanent unlock with bonus credits (ads / store). */
    bonusUnlockCost?: number;
    /** Multiplier on base cruise px/s (220) */
    cruiseSpeedMultiplier: number;
    /** Parallax layer tints for this tier feel */
    parallaxPalette: [number, number, number];
    /**
     * World map route node (1 = first tier). Omitted for off-route charts (e.g. secret).
     */
    worldMapNodeId?: number;
}

export const SONGS: Song[] = [
    // --- BEGINNER ---
    {
        id: 'beg_neon_easy',
        stage: 'beginner',
        orderInStage: 1,
        sourceTrackKey: 'neon',
        name: 'Neon Velocity',
        displaySubtitle: 'TRAINING',
        bpm: 110,
        starsRequired: 0,
        cruiseSpeedMultiplier: 0.82,
        parallaxPalette: [0x0a1220, 0x122038, 0x1a3050],
        worldMapNodeId: 1,
        notes: [
            { time: 1.2, pitch: 0.52 },
            { time: 2.8, pitch: 0.58 },
            { time: 4.2, pitch: 0.45 },
            { time: 5.6, pitch: 0.62 },
            { time: 7.0, pitch: 0.48 },
            { time: 8.4, pitch: 0.55 },
        ],
    },
    {
        id: 'beg_pulse_easy',
        stage: 'beginner',
        orderInStage: 2,
        sourceTrackKey: 'pulse',
        name: 'Pulse Grid',
        displaySubtitle: 'TRAINING',
        bpm: 118,
        starsRequired: 3,
        cruiseSpeedMultiplier: 0.88,
        parallaxPalette: [0x100818, 0x201028, 0x301838],
        worldMapNodeId: 1,
        notes: [
            { time: 1.0, pitch: 0.4 },
            { time: 2.4, pitch: 0.55 },
            { time: 3.8, pitch: 0.48 },
            { time: 5.2, pitch: 0.62 },
            { time: 6.6, pitch: 0.5 },
        ],
    },
    // --- INTERMEDIATE ---
    {
        id: 'int_neon_std',
        stage: 'intermediate',
        orderInStage: 1,
        sourceTrackKey: 'neon',
        name: 'Neon Velocity',
        displaySubtitle: 'STANDARD',
        bpm: 128,
        starsRequired: 8,
        cruiseSpeedMultiplier: 1.0,
        parallaxPalette: [0x111122, 0x1a1a3a, 0x24244a],
        worldMapNodeId: 2,
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
        id: 'int_pulse_std',
        stage: 'intermediate',
        orderInStage: 2,
        sourceTrackKey: 'pulse',
        name: 'Pulse Grid',
        displaySubtitle: 'STANDARD',
        bpm: 140,
        starsRequired: 12,
        cruiseSpeedMultiplier: 1.05,
        parallaxPalette: [0x120a1a, 0x22142e, 0x321e42],
        worldMapNodeId: 2,
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
    // --- AMATEUR ---
    {
        id: 'ama_neon_hard',
        stage: 'amateur',
        orderInStage: 1,
        sourceTrackKey: 'neon',
        name: 'Neon Velocity',
        displaySubtitle: 'CHALLENGE',
        bpm: 138,
        starsRequired: 22,
        cruiseSpeedMultiplier: 1.12,
        parallaxPalette: [0x180810, 0x281420, 0x382030],
        worldMapNodeId: 3,
        notes: [
            { time: 0.9, pitch: 0.45 },
            { time: 2.1, pitch: 0.72 },
            { time: 3.3, pitch: 0.38 },
            { time: 4.5, pitch: 0.8 },
            { time: 5.7, pitch: 0.42 },
            { time: 6.9, pitch: 0.65 },
            { time: 8.1, pitch: 0.5 },
            { time: 9.3, pitch: 0.75 },
        ],
    },
    // --- SEMI-PRO ---
    {
        id: 'semi_vault',
        stage: 'semiPro',
        orderInStage: 1,
        name: 'Vault Run',
        bpm: 145,
        starsRequired: 35,
        cruiseSpeedMultiplier: 1.18,
        parallaxPalette: [0x0c1018, 0x182030, 0x243048],
        worldMapNodeId: 4,
        notes: [
            { time: 0.7, pitch: 0.55 },
            { time: 1.9, pitch: 0.35 },
            { time: 3.1, pitch: 0.68 },
            { time: 4.3, pitch: 0.42 },
            { time: 5.5, pitch: 0.78 },
            { time: 6.7, pitch: 0.5 },
            { time: 7.9, pitch: 0.62 },
        ],
    },
    // --- PRO ---
    {
        id: 'pro_strike',
        stage: 'pro',
        orderInStage: 1,
        name: 'Strike Lane',
        bpm: 152,
        starsRequired: 50,
        cruiseSpeedMultiplier: 1.25,
        parallaxPalette: [0x1a0808, 0x2a1018, 0x3a1828],
        worldMapNodeId: 5,
        notes: [
            { time: 0.6, pitch: 0.48 },
            { time: 1.8, pitch: 0.7 },
            { time: 3.0, pitch: 0.4 },
            { time: 4.2, pitch: 0.75 },
            { time: 5.4, pitch: 0.52 },
            { time: 6.6, pitch: 0.65 },
            { time: 7.8, pitch: 0.45 },
            { time: 9.0, pitch: 0.72 },
        ],
    },
    // --- LEGENDARY ---
    {
        id: 'leg_eclipse',
        stage: 'legendary',
        orderInStage: 1,
        name: 'Eclipse',
        bpm: 160,
        starsRequired: 70,
        cruiseSpeedMultiplier: 1.32,
        parallaxPalette: [0x080818, 0x101028, 0x181838],
        worldMapNodeId: 6,
        notes: [
            { time: 0.55, pitch: 0.5 },
            { time: 1.65, pitch: 0.68 },
            { time: 2.75, pitch: 0.36 },
            { time: 3.85, pitch: 0.74 },
            { time: 4.95, pitch: 0.44 },
            { time: 6.05, pitch: 0.62 },
            { time: 7.15, pitch: 0.52 },
            { time: 8.25, pitch: 0.7 },
        ],
    },
    // --- MASTER LEGENDARY ---
    {
        id: 'mleg_omega',
        stage: 'masterLegendary',
        orderInStage: 1,
        name: 'Omega Line',
        bpm: 168,
        starsRequired: 95,
        cruiseSpeedMultiplier: 1.4,
        parallaxPalette: [0x120404, 0x220808, 0x320c10],
        worldMapNodeId: 7,
        notes: [
            { time: 0.5, pitch: 0.52 },
            { time: 1.5, pitch: 0.72 },
            { time: 2.5, pitch: 0.38 },
            { time: 3.5, pitch: 0.78 },
            { time: 4.5, pitch: 0.46 },
            { time: 5.5, pitch: 0.66 },
            { time: 6.5, pitch: 0.54 },
            { time: 7.5, pitch: 0.74 },
            { time: 8.5, pitch: 0.48 },
        ],
    },
    // --- SECRET (credit gate) ---
    {
        id: 'secret_prism',
        stage: 'pro',
        orderInStage: 99,
        name: 'Prism',
        displaySubtitle: 'SECRET',
        bpm: 155,
        starsRequired: 999,
        secret: true,
        /** Tune up when ads/IAP grant credits; starter gives 3 for flow testing */
        bonusUnlockCost: 3,
        cruiseSpeedMultiplier: 1.28,
        parallaxPalette: [0x180818, 0x281038, 0x381858],
        notes: [
            { time: 0.65, pitch: 0.5 },
            { time: 1.85, pitch: 0.65 },
            { time: 3.05, pitch: 0.42 },
            { time: 4.25, pitch: 0.7 },
            { time: 5.45, pitch: 0.48 },
            { time: 6.65, pitch: 0.62 },
        ],
    },
];
