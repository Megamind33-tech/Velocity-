/** Mutable hooks so WorldScrollSystem can read live run stats without circular imports. */
export const runSessionHooks = {
    getScore: (): number => 0,
    getComboStreak: (): number => 0,
    getPerfectStreak: (): number => 0,
};
