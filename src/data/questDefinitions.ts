export interface QuestTier {
    id: 'bronze' | 'silver' | 'gold';
    requirement: number;
    rewardXP: number;
    rewardStars: number;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: 'gate_count' | 'distance' | 'dodge_count' | 'level_complete' | 'star_collect';
    tiers: QuestTier[];
}

export const QUEST_DEFINITIONS: Quest[] = [
    {
        id: 'the_sky_is_falling',
        title: 'The Sky Is Falling',
        description: 'Pass consecutive gates without crashing.',
        type: 'gate_count',
        tiers: [
            { id: 'bronze', requirement: 5, rewardXP: 100, rewardStars: 1 },
            { id: 'silver', requirement: 20, rewardXP: 500, rewardStars: 3 },
            { id: 'gold', requirement: 50, rewardXP: 1500, rewardStars: 10 }
        ]
    },
    {
        id: 'velocity_junkie',
        title: 'Velocity Junkie',
        description: 'Travel total distance at high speed.',
        type: 'distance',
        tiers: [
            { id: 'bronze', requirement: 1000, rewardXP: 200, rewardStars: 1 },
            { id: 'silver', requirement: 5000, rewardXP: 1000, rewardStars: 5 },
            { id: 'gold', requirement: 20000, rewardXP: 3000, rewardStars: 15 }
        ]
    },
    {
        id: 'learner_pilot',
        title: 'Learner Pilot',
        description: 'Complete levels to prove your flight skills.',
        type: 'level_complete',
        tiers: [
            { id: 'bronze', requirement: 3, rewardXP: 300, rewardStars: 2 },
            { id: 'silver', requirement: 10, rewardXP: 1200, rewardStars: 6 },
            { id: 'gold', requirement: 20, rewardXP: 4000, rewardStars: 20 }
        ]
    },
    {
        id: 'star_collector',
        title: 'Star Collector',
        description: 'Earn stars by acing levels.',
        type: 'star_collect',
        tiers: [
            { id: 'bronze', requirement: 5, rewardXP: 250, rewardStars: 2 },
            { id: 'silver', requirement: 20, rewardXP: 1500, rewardStars: 8 },
            { id: 'gold', requirement: 50, rewardXP: 5000, rewardStars: 25 }
        ]
    },
];
