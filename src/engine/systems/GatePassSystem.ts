import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { GateComponent } from '../components/GateComponent';
import { GameState } from '../GameState';
import { RunContext } from '../RunContext';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';
import type { LevelSystem } from './LevelSystem';

/**
 * Detects player flying through each gate; when every planned gate is cleared, emits LEVEL_COMPLETE.
 */
export class GatePassSystem implements System {
    public readonly priority: number = 55;

    constructor(private readonly levelSystem: LevelSystem) {}

    public update(_entities: Entity[], world: World, _delta: number): void {
        if (GameState.paused) return;
        const p = RunContext.playerEntity;
        if (p == null) return;
        const pt = world.getComponent<TransformComponent>(p, TransformComponent.TYPE_ID);
        if (!pt) return;

        const gates = world.getEntities(GateComponent.TYPE_ID);
        for (let i = 0; i < gates.length; i++) {
            const ge = gates[i];
            const gc = world.getComponent<GateComponent>(ge, GateComponent.TYPE_ID)!;
            if (gc.cleared) continue;
            const gt = world.getComponent<TransformComponent>(ge, TransformComponent.TYPE_ID);
            if (!gt) continue;

            const halfW = gc.width * 0.5 + 18;
            const halfH = gc.height * 0.5 + 28;
            const throughX = pt.x >= gt.x - 25 && pt.x <= gt.x + 35;
            const inY = Math.abs(pt.y - gt.y) <= halfH;
            if (throughX && inY) {
                gc.cleared = true;
                this.levelSystem.onGateCleared();
                EventBus.getInstance().emit(GameEvents.GATE_PASSED, { gateEntity: ge });
                const total = this.levelSystem.totalGatesPlanned;
                if (
                    total > 0 &&
                    this.levelSystem.gatesCleared >= total &&
                    !this.levelSystem.runAllGatesClearedEmitted
                ) {
                    this.levelSystem.runAllGatesClearedEmitted = true;
                    EventBus.getInstance().emit(GameEvents.LEVEL_COMPLETE);
                }
            }
        }
    }
}
