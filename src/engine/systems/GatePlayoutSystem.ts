import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { GateComponent } from '../components/GateComponent';
import { GameState } from '../GameState';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';

/**
 * Detects when the player passes gate centers and drives level-complete when all gates are cleared.
 */
export class GatePlayoutSystem implements System {
    public readonly priority: number = 25;
    private readonly queryMask: number;
    private playerEntity: Entity | null = null;
    private totalGatesInRun = 0;
    private completeEmitted = false;

    constructor() {
        this.queryMask = TransformComponent.TYPE_ID | GateComponent.TYPE_ID;
    }

    public configure(player: Entity, totalGates: number): void {
        this.playerEntity = player;
        this.totalGatesInRun = totalGates;
        this.completeEmitted = false;
    }

    public clear(): void {
        this.playerEntity = null;
        this.totalGatesInRun = 0;
        this.completeEmitted = false;
    }

    public update(_entities: Entity[], world: World, _delta: number): void {
        if (!GameState.runActive || GameState.paused || !this.playerEntity) return;

        const playerT = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!playerT) return;

        const gates = world.getEntities(this.queryMask);
        let passedCount = 0;

        for (let i = 0; i < gates.length; i++) {
            const gate = gates[i];
            const gt = world.getComponent<TransformComponent>(gate, TransformComponent.TYPE_ID);
            const gc = world.getComponent<GateComponent>(gate, GateComponent.TYPE_ID);
            if (!gt || !gc) continue;

            if (!gc.passed && playerT.x > gt.x) {
                gc.passed = true;
                EventBus.getInstance().emit(GameEvents.GATE_PASSED);
            }
            if (gc.passed) passedCount++;
        }

        if (
            !this.completeEmitted &&
            this.totalGatesInRun > 0 &&
            passedCount >= this.totalGatesInRun
        ) {
            this.completeEmitted = true;
            EventBus.getInstance().emit(GameEvents.LEVEL_COMPLETE);
        }
    }
}
