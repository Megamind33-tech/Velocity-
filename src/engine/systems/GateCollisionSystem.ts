import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { GateComponent } from '../components/GateComponent';
import { PlayerFlightComponent } from '../components/PlayerFlightComponent';
import { GameState } from '../GameState';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';
import { getPlayerWorldX, getWorldScrollX } from '../../game/worldScroll';
import { GATE_OBSTACLE_HALF_WIDTH, PLAYER_GATE_HIT_RADIUS } from '../../game/vocalFlightRules';

/**
 * Crash if the plane overlaps gate obstacle columns outside the vertical gap.
 */
export class GateCollisionSystem implements System {
    public readonly priority = 24;
    private playerEntity: Entity | null = null;
    private latched = false;
    private readonly queryMask = GateComponent.TYPE_ID;

    public configure(player: Entity): void {
        this.playerEntity = player;
        this.latched = false;
    }

    public clear(): void {
        this.playerEntity = null;
        this.latched = false;
    }

    public update(_entities: Entity[], world: World, _delta: number): void {
        if (!GameState.runActive || GameState.paused || !this.playerEntity || this.latched) return;
        if (!world.getComponent(this.playerEntity, PlayerFlightComponent.TYPE_ID)) return;

        const pt = world.getComponent<TransformComponent>(this.playerEntity!, TransformComponent.TYPE_ID);
        if (!pt) return;

        const scroll = getWorldScrollX();
        const px = scroll + getPlayerWorldX();
        const py = pt.y;

        const gates = world.getEntities(this.queryMask);
        for (let i = 0; i < gates.length; i++) {
            const ge = gates[i];
            const gc = world.getComponent<GateComponent>(ge, GateComponent.TYPE_ID)!;
            if (gc.passed) continue;

            const dx = Math.abs(px - gc.logicalX);
            if (dx > GATE_OBSTACLE_HALF_WIDTH) continue;

            const halfGap = gc.gapEffectivePx * 0.5;
            const distFromCenter = Math.abs(py - gc.gapCenterY);
            if (distFromCenter > halfGap + PLAYER_GATE_HIT_RADIUS) {
                this.latched = true;
                EventBus.getInstance().emit(GameEvents.CRASH);
                return;
            }
        }
    }
}
