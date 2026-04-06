import { Entity, World, System } from '../World';
import { VelocityComponent } from '../components/VelocityComponent';
import { PlayerFlightComponent } from '../components/PlayerFlightComponent';
import { GameState } from '../GameState';
import { VOICE_FLIGHT } from '../../data/constants';

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
        if (GameState.paused || !GameState.runActive) return;

        const list = world.getEntities(this.queryMask);
        for (let i = 0; i < list.length; i++) {
            const e = list[i];
            if (world.getComponent(e, PlayerFlightComponent.TYPE_ID)) continue;
            const velocity = world.getComponent<VelocityComponent>(e, VelocityComponent.TYPE_ID)!;
            velocity.vx = VOICE_FLIGHT.CRUISE_SPEED_X;
        }
    }
}
