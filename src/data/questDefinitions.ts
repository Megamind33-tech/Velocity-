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
    type: 'gate_count' | 'distance' | 'dodge_count';
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
    }
];
