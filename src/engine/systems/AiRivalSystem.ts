import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { AiRivalComponent } from '../components/AiRivalComponent';
import { GameState } from '../GameState';
import { RunContext } from '../RunContext';

/**
 * VS AI: rival chases a weaving altitude while matching cruise speed (horizontal from AutoForward).
 */
export class AiRivalSystem implements System {
    public readonly priority: number = 2;
    private t = 0;

    public update(_entities: Entity[], world: World, delta: number): void {
        if (!RunContext.vsAiActive || GameState.paused) return;

        const ai = RunContext.aiEntity;
        if (ai == null) return;

        const transform = world.getComponent<TransformComponent>(ai, TransformComponent.TYPE_ID);
        const velocity = world.getComponent<VelocityComponent>(ai, VelocityComponent.TYPE_ID);
        const tag = world.getComponent<AiRivalComponent>(ai, AiRivalComponent.TYPE_ID);
        if (!transform || !velocity || !tag) return;

        this.t += delta;
        const h = RunContext.screenHeight;
        const desiredY = h * 0.48 + Math.sin(this.t * 1.15) * (h * 0.14) + Math.sin(this.t * 2.3) * (h * 0.04);
        const err = desiredY - transform.y;
        const k = 2.8;
        const damp = 1.2;
        velocity.vy += (k * err - damp * velocity.vy) * delta;
    }
}
