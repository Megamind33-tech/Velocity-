/**
 * Logic for logarithmic difficulty scaling across levels.
 */
export class DifficultyScaler {
    /**
     * Returns a difficulty multiplier based on the level index.
     * Uses a logarithmic curve for a smooth but challenging progression.
     */
    public static getMultiplier(level: number): number {
        // multiplier = 1 + log10(level + 1)
        return 1 + Math.log10(Math.max(1, level + 1));
    }

    /**
     * Calculates the frequency of hazards/obstacles.
     */
    public static getHazardFrequency(level: number): number {
        const baseFreq = 0.2; // 20% chance
        const growth = 0.1;
        return baseFreq + (growth * Math.log2(level + 1));
    }
}
