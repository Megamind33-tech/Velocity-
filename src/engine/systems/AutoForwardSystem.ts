import { Entity, World, System } from '../World';
import { VelocityComponent } from '../components/VelocityComponent';
import { GameState } from '../GameState';
import { RunContext } from '../RunContext';

/**
 * Keeps horizontal cruise speed fixed (left-to-right). Vocal input must not steer forward/back.
 */
export class AutoForwardSystem implements System {
    public readonly priority: number = 9;
    private readonly queryMask: number;

    constructor() {
        this.queryMask = VelocityComponent.TYPE_ID;
    }

    public update(_entities: Entity[], world: World, _delta: number): void {
        if (GameState.paused) return;

        const list = world.getEntities(this.queryMask);
        for (let i = 0; i < list.length; i++) {
            const velocity = world.getComponent<VelocityComponent>(list[i], VelocityComponent.TYPE_ID)!;
            velocity.vx = RunContext.cruiseSpeedPx;
        }
    }
}
