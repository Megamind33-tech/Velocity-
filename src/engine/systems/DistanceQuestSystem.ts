import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { GameState } from '../GameState';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';

/**
 * Emits distance deltas for distance-based quests (scaled to match tier numbers).
 */
export class DistanceQuestSystem implements System {
    public readonly priority: number = 27;
    private playerEntity: Entity | null = null;
    private lastX = 0;

    public configure(player: Entity): void {
        this.playerEntity = player;
        this.lastX = 0;
    }

    public syncBaseline(world: World): void {
        if (!this.playerEntity) return;
        const t = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        this.lastX = t?.x ?? 0;
    }

    public clear(): void {
        this.playerEntity = null;
        this.lastX = 0;
    }

    public update(_entities: Entity[], world: World, _delta: number): void {
        if (!GameState.runActive || GameState.paused || !this.playerEntity) return;

        const t = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!t) return;

        const dx = t.x - this.lastX;
        this.lastX = t.x;
        if (dx > 0) {
            const units = Math.floor(dx / 8);
            if (units > 0) {
                EventBus.getInstance().emit(GameEvents.DISTANCE_DELTA, { units });
            }
        }
    }
}
