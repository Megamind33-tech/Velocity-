import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { GameState } from '../GameState';
import { RunContext } from '../RunContext';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';

const LEAD_PX = 220;
const WIN_HOLD_SEC = 2.2;

/**
 * VS AI: player wins after holding a horizontal lead for WIN_HOLD_SEC.
 */
export class VsAiRaceSystem implements System {
    public readonly priority: number = 25;
    private leadAccum = 0;
    private won = false;

    reset(): void {
        this.leadAccum = 0;
        this.won = false;
    }

    public update(_entities: Entity[], world: World, delta: number): void {
        if (!RunContext.vsAiActive || GameState.paused || this.won) return;
        const p = RunContext.playerEntity;
        const a = RunContext.aiEntity;
        if (p == null || a == null) return;

        const pt = world.getComponent<TransformComponent>(p, TransformComponent.TYPE_ID);
        const at = world.getComponent<TransformComponent>(a, TransformComponent.TYPE_ID);
        if (!pt || !at) return;

        if (pt.x >= at.x + LEAD_PX) {
            this.leadAccum += delta;
            if (this.leadAccum >= WIN_HOLD_SEC) {
                this.won = true;
                EventBus.getInstance().emit(GameEvents.VS_AI_PLAYER_WON);
            }
        } else {
            this.leadAccum = Math.max(0, this.leadAccum - delta * 0.5);
        }
    }
}
