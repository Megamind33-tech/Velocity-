import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { GameState } from '../GameState';

/**
 * System that handles spatial movement based on velocity.
 * Runs during the fixed update phase.
 */
export class MovementSystem implements System {
    public readonly priority: number = 10;
    private readonly queryMask: number;

    constructor() {
        this.queryMask = TransformComponent.TYPE_ID | VelocityComponent.TYPE_ID;
    }

    public update(entities: Entity[], world: World, delta: number): void {
        if (GameState.paused || !GameState.runActive) return;

        const matchingEntities = world.getEntities(this.queryMask);
        
        // High-performance loop avoiding object allocation
        for (let i = 0; i < matchingEntities.length; i++) {
            const entity = matchingEntities[i];
            const transform = world.getComponent<TransformComponent>(entity, TransformComponent.TYPE_ID)!;
            const velocity = world.getComponent<VelocityComponent>(entity, VelocityComponent.TYPE_ID)!;

            transform.x += velocity.vx * delta;
            transform.y += velocity.vy * delta;
        }
    }
}
