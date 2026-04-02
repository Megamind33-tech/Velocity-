const K = {
    trainingDone: 'velocity_mode_training_done',
    vsAiWon: 'velocity_mode_vs_ai_won',
    p2pDone: 'velocity_mode_p2p_done',
} as const;

/**
 * Strict mode chain: training → vs AI → P2P → world tour.
 */
export const ModeProgress = {
    isTrainingComplete(): boolean {
        try {
            return localStorage.getItem(K.trainingDone) === '1';
        } catch {
            return false;
        }
    },

    setTrainingComplete(): void {
        try {
            localStorage.setItem(K.trainingDone, '1');
        } catch {
            /* ignore */
        }
    },

    hasVsAiWin(): boolean {
        try {
            return localStorage.getItem(K.vsAiWon) === '1';
        } catch {
            return false;
        }
    },

    setVsAiWin(): void {
        try {
            localStorage.setItem(K.vsAiWon, '1');
        } catch {
            /* ignore */
        }
    },

    isP2PComplete(): boolean {
        try {
            return localStorage.getItem(K.p2pDone) === '1';
        } catch {
            return false;
        }
    },

    setP2PComplete(): void {
        try {
            localStorage.setItem(K.p2pDone, '1');
        } catch {
            /* ignore */
        }
    },

    canPlayMode(mode: import('../data/gameModes').GameMode): boolean {
        switch (mode) {
            case 'training':
                return true;
            case 'vsAi':
                return this.isTrainingComplete();
            case 'p2p':
                return this.hasVsAiWin();
            case 'tour':
                return this.isP2PComplete();
            default:
                return false;
        }
    },
};
