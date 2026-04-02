import { ZoneId } from '../data/levelDefinitions';

/**
 * Logic for learning-curve-aware difficulty scaling across levels.
 * Each zone introduces mechanics gradually so players learn as they play.
 */
export class DifficultyScaler {
    /**
     * Returns a difficulty multiplier based on the level index.
     * Uses a logarithmic curve for a smooth but challenging progression.
     */
    public static getMultiplier(level: number): number {
        return 1 + Math.log10(Math.max(1, level + 1));
    }

    /**
     * Calculates the frequency of hazards/obstacles.
     */
    public static getHazardFrequency(level: number): number {
        const baseFreq = 0.2;
        const growth = 0.1;
        return baseFreq + (growth * Math.log2(level + 1));
    }

    /**
     * Zone-aware gate width scaling.
     * Tutorial zones have wider gates; expert zones have narrower ones.
     */
    public static getGateWidth(baseWidth: number, level: number, zone: ZoneId): number {
        const zoneFactors: Record<ZoneId, number> = {
            tutorial: 1.3,
            rhythm_basics: 1.0,
            advanced_flight: 0.85,
            expert: 0.7,
        };
        const factor = zoneFactors[zone] ?? 1.0;
        const levelShrink = Math.max(0.6, 1 - (level - 1) * 0.015);
        return Math.max(80, baseWidth * factor * levelShrink);
    }

    /**
     * Zone-aware scroll speed scaling.
     * Starts slow in tutorial and ramps up through zones.
     */
    public static getScrollSpeed(baseSpeed: number, level: number, zone: ZoneId): number {
        const zoneFactors: Record<ZoneId, number> = {
            tutorial: 0.75,
            rhythm_basics: 1.0,
            advanced_flight: 1.15,
            expert: 1.3,
        };
        const factor = zoneFactors[zone] ?? 1.0;
        const levelRamp = 1 + (level - 1) * 0.02;
        return baseSpeed * factor * levelRamp;
    }

    /**
     * Returns how forgiving the gate hit detection should be (extra radius in px).
     * Higher = more forgiving. Tutorial levels are generous.
     */
    public static getGateForgiveness(level: number, zone: ZoneId): number {
        const base: Record<ZoneId, number> = {
            tutorial: 30,
            rhythm_basics: 18,
            advanced_flight: 10,
            expert: 4,
        };
        return Math.max(2, (base[zone] ?? 10) - level * 0.5);
    }
}
