import { Entity, World, System } from '../World';
import { GameState } from '../GameState';
import { getWorldScrollX } from '../../game/worldScroll';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';

/**
 * Emits distance deltas for distance-based quests (scaled to match tier numbers).
 */
export class DistanceQuestSystem implements System {
    public readonly priority: number = 27;
    private playerEntity: Entity | null = null;
    private lastScroll = 0;

    public configure(player: Entity): void {
        this.playerEntity = player;
        this.lastScroll = 0;
    }

    public syncBaseline(world: World): void {
        if (!this.playerEntity) return;
        this.lastScroll = getWorldScrollX();
    }

    public clear(): void {
        this.playerEntity = null;
        this.lastScroll = 0;
    }

    public update(_entities: Entity[], world: World, _delta: number): void {
        if (!GameState.runActive || GameState.paused || !this.playerEntity) return;

        const scroll = getWorldScrollX();
        const dx = scroll - this.lastScroll;
        this.lastScroll = scroll;
        if (dx > 0) {
            const units = Math.floor(dx / 8);
            if (units > 0) {
                EventBus.getInstance().emit(GameEvents.DISTANCE_DELTA, { units });
            }
        }
    }
}
