import { Entity, World, System } from '../World';
import { VelocityComponent } from '../components/VelocityComponent';
import { FlightDynamicsComponent } from '../components/FlightDynamicsComponent';
import { VoiceInputManager } from '../input/VoiceInputManager';
import { GameState } from '../GameState';
import { VOICE_FLIGHT } from '../../data/constants';
import { DemoTouchFlight } from '../../debug/DemoTouchFlight';
import { RunContext } from '../RunContext';

/**
 * Vocal-only vertical steering: high pitch → up, low pitch → down.
 * Horizontal speed is owned by AutoForwardSystem. No touch/joystick in production.
 */
export class VoiceInputSystem implements System {
    public readonly priority: number = 0;
    private readonly voiceManager: VoiceInputManager;
    private readonly queryMask: number;

    constructor() {
        this.voiceManager = VoiceInputManager.getInstance();
        this.queryMask = VelocityComponent.TYPE_ID | FlightDynamicsComponent.TYPE_ID;
    }

    public update(_entities: Entity[], world: World, delta: number): void {
        if (GameState.paused) return;

        if (!this.voiceManager.isInitialized) return;

        this.voiceManager.update();

        const vol = this.voiceManager.volume;
        const hz = this.voiceManager.pitchHz;

        const matchingEntities = world.getEntities(this.queryMask);

        const playerOnly = RunContext.playerEntity;

        for (let i = 0; i < matchingEntities.length; i++) {
            const entity = matchingEntities[i];
            if (playerOnly != null && entity !== playerOnly) continue;

            const velocity = world.getComponent<VelocityComponent>(entity, VelocityComponent.TYPE_ID)!;

            let verticalAccel = 0;

            if (vol > VOICE_FLIGHT.VOLUME_GATE && hz > 0) {
                const { PITCH_HZ_MIN, PITCH_HZ_MAX } = VOICE_FLIGHT;
                const t = Math.max(0, Math.min(1, (hz - PITCH_HZ_MIN) / (PITCH_HZ_MAX - PITCH_HZ_MIN)));
                // High t (high pitch) → negative accel → upward on screen
                verticalAccel = (0.5 - t) * 2 * VOICE_FLIGHT.PITCH_VERTICAL_STRENGTH;
            }

            // DEV-only: edge touch simulates pitch up/down for testing (strip wiring later)
            const demo = DemoTouchFlight.getVertical();
            if (demo !== 0) {
                // demo -1 = up (negative vy accel), +1 = down
                verticalAccel += demo * VOICE_FLIGHT.DEMO_TOUCH_STRENGTH;
            }

            velocity.vy += verticalAccel * delta;
        }
    }
}
