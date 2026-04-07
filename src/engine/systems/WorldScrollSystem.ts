import { World, System } from '../World';
import { GameState } from '../GameState';
import { advanceWorldScroll, applyCruiseMultiplier, getWorldScrollX } from '../../game/worldScroll';
import { computeDynamicCruiseMult } from '../../game/runDynamics';
import { getSilentFrames } from '../../game/vocalSilenceState';
import { runSessionHooks } from '../../game/runSessionHooks';
import { COMBO_TIER_EVERY } from '../../game/vocalFlightRules';

/**
 * Advances horizontal world scroll each fixed tick (fixed-player architecture).
 */
export class WorldScrollSystem implements System {
    public readonly priority: number = 8;

    public update(_entities: unknown[], _world: World, delta: number): void {
        if (!GameState.runActive || GameState.paused) return;
        const comboTier = 1 + Math.floor(runSessionHooks.getComboStreak() / COMBO_TIER_EVERY);
        const m = computeDynamicCruiseMult(
            runSessionHooks.getScore(),
            getWorldScrollX(),
            comboTier,
            runSessionHooks.getPerfectStreak(),
            getSilentFrames(),
        );
        applyCruiseMultiplier(m);
        advanceWorldScroll(delta);
    }
}
