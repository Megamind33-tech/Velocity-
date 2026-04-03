const STORAGE_KEY = 'velocity_level_unlock_v1';

function readUnlockedSet(): Set<number> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set([1]);
        const arr = JSON.parse(raw) as number[];
        if (!Array.isArray(arr) || arr.length === 0) return new Set([1]);
        return new Set(arr.filter((n) => typeof n === 'number' && n > 0));
    } catch {
        return new Set([1]);
    }
}

function writeUnlockedSet(ids: Set<number>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids].sort((a, b) => a - b)));
}

export function getUnlockedLevelIds(): Set<number> {
    return readUnlockedSet();
}

export function isLevelUnlocked(id: number): boolean {
    return readUnlockedSet().has(id);
}

/** Unlock the next level after completing `completedLevelId`. */
export function unlockAfterComplete(completedLevelId: number): void {
    const s = readUnlockedSet();
    s.add(completedLevelId + 1);
    writeUnlockedSet(s);
}

const HIGH_SCORE_KEY = 'velocity_menu_high_score_v1';

export function getMenuHighScore(): number {
    try {
        const n = Number(localStorage.getItem(HIGH_SCORE_KEY));
        return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    } catch {
        return 0;
    }
}

export function recordMenuHighScore(score: number): void {
    const cur = getMenuHighScore();
    if (score > cur) {
        try {
            localStorage.setItem(HIGH_SCORE_KEY, String(Math.floor(score)));
        } catch {
            /* ignore */
        }
    }
}

/** Furthest unlocked level and how many levels are open (for menu stats strip). */
export function getMainMenuProgress(): { maxUnlocked: number; unlockedCount: number; totalLevels: number } {
    const s = readUnlockedSet();
    const maxUnlocked = s.size ? Math.max(...s) : 1;
    return { maxUnlocked, unlockedCount: s.size, totalLevels: 20 };
}

/** Clear unlocks and menu high score (settings “reset progress”). */
export function resetLocalProgress(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HIGH_SCORE_KEY);
    } catch {
        /* ignore */
    }
}
