/**
 * Four core modes — sequential unlock (no skipping). World Tour is the capstone.
 */
export const GAME_MODES = ['training', 'vsAi', 'p2p', 'tour'] as const;
export type GameMode = (typeof GAME_MODES)[number];

export const MODE_LABEL: Record<GameMode, string> = {
    training: 'TRAINING',
    vsAi: 'VS AI',
    p2p: 'P2P',
    tour: 'WORLD TOUR',
};

export const MODE_BLURB: Record<GameMode, string> = {
    training: 'Regional vocal drills — learn pitch & breath before you race.',
    vsAi: 'Same charts with a rival — stay ahead on the course.',
    p2p: 'Ghost duel lane — human vs human async (live sync next).',
    tour: 'Continental campaign — your home region, then the globe.',
};

/** What the player must do to open the next mode */
export const UNLOCK_HELP: Record<GameMode, string> = {
    training: 'Always open — start here.',
    vsAi: 'Finish one training flight (return to menu from a run).',
    p2p: 'Win one VS AI leg (pull ahead of the rival).',
    tour: 'Complete one P2P session (finish a P2P chart run).',
};
