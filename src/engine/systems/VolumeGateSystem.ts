import { Entity, World, System } from '../World';
import { GateComponent } from '../components/GateComponent';
import { VoiceInputManager } from '../input/VoiceInputManager';
import { GameState } from '../GameState';
import {
    VOLUME_GATE_GAP_CLOSED_PX,
    VOLUME_GATE_RMS_MAX,
    VOLUME_GATE_RMS_MIN,
} from '../../game/vocalFlightRules';

/**
 * Volume pillars: RMS opens the vertical gap toward gapMaxPx.
 */
export class VolumeGateSystem implements System {
    public readonly priority = 7;
    private readonly queryMask = GateComponent.TYPE_ID;

    public update(_entities: Entity[], world: World, delta: number): void {
        if (!GameState.runActive || GameState.paused) return;

        const vol = VoiceInputManager.getInstance().isInitialized
            ? VoiceInputManager.getInstance().volume
            : 0;

        const gates = world.getEntities(this.queryMask);
        for (let i = 0; i < gates.length; i++) {
            const g = world.getComponent<GateComponent>(gates[i], GateComponent.TYPE_ID)!;
            if (g.kind === 'pitch') {
                g.gapEffectivePx = g.gapMaxPx;
                continue;
            }

            const t = Math.max(
                0,
                Math.min(1, (vol - VOLUME_GATE_RMS_MIN) / (VOLUME_GATE_RMS_MAX - VOLUME_GATE_RMS_MIN)),
            );
            const target = VOLUME_GATE_GAP_CLOSED_PX + t * Math.max(0, g.gapMaxPx - VOLUME_GATE_GAP_CLOSED_PX);
            const lerp = 1 - Math.pow(0.88, delta * 60);
            g.gapEffectivePx += (target - g.gapEffectivePx) * lerp;
        }
    }
}
