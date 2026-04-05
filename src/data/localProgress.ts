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

const HANGAR_PLANE_KEY = 'velocity_hangar_plane_v1';
const HANGAR_UNLOCKS_KEY = 'velocity_hangar_unlocks_v1';

/** Hangar: selected craft id (persisted). */
export function getSelectedPlaneId(): string {
    try {
        const v = localStorage.getItem(HANGAR_PLANE_KEY);
        if (v && typeof v === 'string' && v.length > 0) return v;
    } catch {
        /* ignore */
    }
    return 'cadet';
}

export function setSelectedPlaneId(id: string): void {
    try {
        localStorage.setItem(HANGAR_PLANE_KEY, id);
    } catch {
        /* ignore */
    }
}

/** Plane ids the player may equip (cadet always; others unlock with level progress). */
export function getUnlockedPlaneIds(maxUnlockedLevel: number): string[] {
    const base = new Set<string>(['cadet']);
    try {
        const raw = localStorage.getItem(HANGAR_UNLOCKS_KEY);
        if (raw) {
            const arr = JSON.parse(raw) as unknown;
            if (Array.isArray(arr)) {
                for (const x of arr) {
                    if (typeof x === 'string' && x.length > 0) base.add(x);
                }
            }
        }
    } catch {
        /* ignore */
    }
    if (maxUnlockedLevel >= 5) base.add('scout');
    if (maxUnlockedLevel >= 10) base.add('interceptor');
    return [...base];
}

export function unlockHangarPlane(id: string): void {
    try {
        const raw = localStorage.getItem(HANGAR_UNLOCKS_KEY);
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        const arr = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
        const set = new Set(arr);
        set.add(id);
        localStorage.setItem(HANGAR_UNLOCKS_KEY, JSON.stringify([...set]));
    } catch {
        /* ignore */
    }
}

/** Clear unlocks and menu high score (settings “reset progress”). */
export function resetLocalProgress(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HIGH_SCORE_KEY);
        localStorage.removeItem(HANGAR_PLANE_KEY);
        localStorage.removeItem(HANGAR_UNLOCKS_KEY);
    } catch {
        /* ignore */
    }
}

