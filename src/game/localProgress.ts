const STORAGE_KEY = 'velocity_max_unlocked_level';

/**
 * Offline-first level unlock state (1-based level index).
 */
export function loadMaxUnlockedLevel(): number {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw == null) return 3;
        const n = parseInt(raw, 10);
        return Number.isFinite(n) && n >= 1 ? n : 3;
    } catch {
        return 3;
    }
}

export function saveMaxUnlockedLevel(level: number): void {
    try {
        const prev = loadMaxUnlockedLevel();
        if (level > prev) {
            localStorage.setItem(STORAGE_KEY, String(level));
        }
    } catch {
        /* ignore quota / private mode */
    }
}
