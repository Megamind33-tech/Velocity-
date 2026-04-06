import { World, System } from '../World';
import { GameState } from '../GameState';
import { advanceWorldScroll } from '../../game/worldScroll';

/**
 * Advances horizontal world scroll each fixed tick (fixed-player architecture).
 */
export class WorldScrollSystem implements System {
    public readonly priority: number = 8;

    public update(_entities: unknown[], _world: World, delta: number): void {
        if (!GameState.runActive || GameState.paused) return;
        advanceWorldScroll(delta);
    }
}
