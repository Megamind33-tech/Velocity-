const K = {
    stars: 'velocity_career_stars',
    bonusCredits: 'velocity_bonus_credits',
    unlockedIds: 'velocity_unlocked_song_ids',
    seeded: 'velocity_progress_seeded',
} as const;

function readStars(): number {
    try {
        const v = localStorage.getItem(K.stars);
        if (v == null) return 0;
        const n = Number(v);
        return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    } catch {
        return 0;
    }
}

function writeStars(n: number): void {
    try {
        localStorage.setItem(K.stars, String(Math.max(0, Math.floor(n))));
    } catch {
        /* ignore */
    }
}

function readCredits(): number {
    try {
        const v = localStorage.getItem(K.bonusCredits);
        if (v == null) return 0;
        const n = Number(v);
        return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    } catch {
        return 0;
    }
}

function writeCredits(n: number): void {
    try {
        localStorage.setItem(K.bonusCredits, String(Math.max(0, Math.floor(n))));
    } catch {
        /* ignore */
    }
}

function readUnlockedSet(): Set<string> {
    try {
        const raw = localStorage.getItem(K.unlockedIds);
        if (!raw) return new Set();
        const arr = JSON.parse(raw) as unknown;
        if (!Array.isArray(arr)) return new Set();
        return new Set(arr.filter((x) => typeof x === 'string'));
    } catch {
        return new Set();
    }
}

function writeUnlockedSet(s: Set<string>): void {
    try {
        localStorage.setItem(K.unlockedIds, JSON.stringify([...s]));
    } catch {
        /* ignore */
    }
}

export interface SongUnlockRules {
    id: string;
    starsRequired: number;
    secret?: boolean;
    /** Spend this many bonus credits (ads / store) to own the chart forever. */
    bonusUnlockCost?: number;
}

/**
 * Career stars, bonus economy, and credit-based permanent unlocks (local).
 */
export const CareerProgress = {
    getStars(): number {
        return readStars();
    },

    addStars(amount: number): void {
        if (amount <= 0) return;
        writeStars(this.getStars() + amount);
    },

    /** Dev / rewarded ad / IAP hook */
    addBonusCredits(amount: number): void {
        if (amount <= 0) return;
        writeCredits(this.getBonusCredits() + amount);
    },

    getBonusCredits(): number {
        return readCredits();
    },

    spendBonusCredits(amount: number): boolean {
        if (amount <= 0) return true;
        const c = this.getBonusCredits();
        if (c < amount) return false;
        writeCredits(c - amount);
        return true;
    },

    isSongPermanentlyUnlocked(songId: string): boolean {
        return readUnlockedSet().has(songId);
    },

    permanentlyUnlockSong(songId: string): void {
        const s = readUnlockedSet();
        s.add(songId);
        writeUnlockedSet(s);
    },

    /** Playable this run: enough career stars OR bought with credits OR dev unlock list. */
    canPlaySong(rules: SongUnlockRules): boolean {
        if (this.isSongPermanentlyUnlocked(rules.id)) return true;
        return this.getStars() >= rules.starsRequired;
    },

    /**
     * Can spend credits to own a secret / gated chart (one-time permanent unlock).
     */
    canUnlockWithCredits(rules: SongUnlockRules): boolean {
        if (rules.bonusUnlockCost == null) return false;
        if (this.canPlaySong(rules)) return false;
        return this.getBonusCredits() >= rules.bonusUnlockCost;
    },

    tryUnlockWithCredits(rules: SongUnlockRules): boolean {
        const cost = rules.bonusUnlockCost;
        if (cost == null) return false;
        if (this.canPlaySong(rules)) return true;
        if (!this.spendBonusCredits(cost)) return false;
        this.permanentlyUnlockSong(rules.id);
        return true;
    },

    /** One-time starter stars so new installs can see tier gates (tune for prod). */
    ensureStarterProgress(): void {
        try {
            if (localStorage.getItem(K.seeded) === '1') return;
            if (this.getStars() > 0) {
                localStorage.setItem(K.seeded, '1');
                return;
            }
            writeStars(5);
            this.addBonusCredits(3);
            localStorage.setItem(K.seeded, '1');
        } catch {
            /* ignore */
        }
    },
};
