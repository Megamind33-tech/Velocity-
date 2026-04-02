import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { GateComponent } from '../components/GateComponent';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';

/**
 * Detects when the player crosses a gate centerline and whether they stayed within the gap.
 */
export class GatePassSystem implements System {
    public readonly priority: number = 25;
    private readonly queryMask: number;
    private playerEntity: Entity;

    constructor(playerEntity: Entity) {
        this.playerEntity = playerEntity;
        this.queryMask = TransformComponent.TYPE_ID | GateComponent.TYPE_ID;
    }

    public setPlayer(entity: Entity): void {
        this.playerEntity = entity;
    }

    public update(_entities: Entity[], world: World, _delta: number): void {
        const pt = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!pt) return;

        const gates = world.getEntities(this.queryMask);
        const margin = 14;

        for (let i = 0; i < gates.length; i++) {
            const gateEntity = gates[i];
            const gate = world.getComponent<GateComponent>(gateEntity, GateComponent.TYPE_ID);
            const gt = world.getComponent<TransformComponent>(gateEntity, TransformComponent.TYPE_ID);
            if (!gate || !gt || gate.passed) continue;

            const halfGap = gate.width * 0.5;
            const halfH = gate.height * 0.5;

            if (pt.x >= gt.x) {
                gate.passed = true;
                const dy = Math.abs(pt.y - gt.y);
                if (dy <= halfGap + margin && dy <= halfH + margin) {
                    EventBus.getInstance().emit(GameEvents.GATE_PASSED);
                } else {
                    EventBus.getInstance().emit(GameEvents.CRASH);
                }
            }
        }
    }
}
