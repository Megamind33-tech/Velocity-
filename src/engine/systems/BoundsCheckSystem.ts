import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { GameState } from '../GameState';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';

const MARGIN = 48;

/**
 * Ends the run when the player leaves the vertical playfield (crash).
 */
export class BoundsCheckSystem implements System {
    public readonly priority: number = 26;
    private playerEntity: Entity | null = null;
    private screenHeight = 600;
    private latched = false;

    public configure(player: Entity, screenHeight: number): void {
        this.playerEntity = player;
        this.screenHeight = screenHeight;
        this.latched = false;
    }

    public clear(): void {
        this.playerEntity = null;
        this.latched = false;
    }

    public update(_entities: Entity[], world: World, _delta: number): void {
        if (!GameState.runActive || GameState.paused || !this.playerEntity || this.latched) return;

        const t = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!t) return;

        if (t.y < MARGIN || t.y > this.screenHeight - MARGIN) {
            this.latched = true;
            EventBus.getInstance().emit(GameEvents.CRASH);
        }
    }
}
