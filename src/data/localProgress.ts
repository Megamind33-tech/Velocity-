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
