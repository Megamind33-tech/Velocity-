const K = {
    runs: 'velocity_runs',
    bestGates: 'velocity_best_gates',
    highScore: 'velocity_high_score',
    playSeconds: 'velocity_play_seconds',
} as const;

function num(key: string, fallback = 0): number {
    try {
        const v = localStorage.getItem(key);
        if (v == null) return fallback;
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    } catch {
        return fallback;
    }
}

function set(key: string, value: number): void {
    try {
        localStorage.setItem(key, String(Math.floor(value)));
    } catch {
        /* ignore */
    }
}

/**
 * Local-only progression display for the stats screen (cloud sync can map later).
 */
export const LocalPlayerStats = {
    getRuns(): number {
        return num(K.runs, 0);
    },
    getBestGates(): number {
        return num(K.bestGates, 0);
    },
    getHighScore(): number {
        return num(K.highScore, 0);
    },
    getPlaySeconds(): number {
        return num(K.playSeconds, 0);
    },

    recordRunStarted(): void {
        set(K.runs, this.getRuns() + 1);
    },

    recordGatesCleared(count: number): void {
        if (count > this.getBestGates()) set(K.bestGates, count);
    },

    recordScore(score: number): void {
        if (score > this.getHighScore()) set(K.highScore, score);
    },

    addPlaySeconds(sec: number): void {
        if (sec > 0) set(K.playSeconds, this.getPlaySeconds() + sec);
    },
};
