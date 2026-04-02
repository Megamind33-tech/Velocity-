import { VOICE_FLIGHT } from '../data/constants';
import type { Entity } from './Entity';

const DEFAULT_PALETTE: [number, number, number] = [0x111122, 0x1a1a3a, 0x24244a];

/**
 * Per-run tuning (set when a chart starts). Systems read this instead of hardcoded globals.
 */
export const RunContext = {
    cruiseSpeedPx: VOICE_FLIGHT.CRUISE_SPEED_X,
    parallaxColors: [...DEFAULT_PALETTE] as [number, number, number],
    /** Only this entity receives mic steering */
    playerEntity: null as Entity | null,
    aiEntity: null as Entity | null,
    vsAiActive: false,
    screenHeight: 800,

    resetDefaults(cruiseBase: number): void {
        this.cruiseSpeedPx = cruiseBase;
        this.parallaxColors = [DEFAULT_PALETTE[0], DEFAULT_PALETTE[1], DEFAULT_PALETTE[2]];
        this.playerEntity = null;
        this.aiEntity = null;
        this.vsAiActive = false;
    },

    applySongTune(cruiseMultiplier: number, palette?: [number, number, number]): void {
        this.cruiseSpeedPx = Math.round(VOICE_FLIGHT.CRUISE_SPEED_X * cruiseMultiplier);
        if (palette) {
            this.parallaxColors = [palette[0], palette[1], palette[2]];
        }
    },
};
