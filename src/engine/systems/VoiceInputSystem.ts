import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { FlightDynamicsComponent } from '../components/FlightDynamicsComponent';
import { PlayerFlightComponent } from '../components/PlayerFlightComponent';
import { VoiceInputManager } from '../input/VoiceInputManager';
import { GameState } from '../GameState';
import { VOICE_FLIGHT } from '../../data/constants';
import { DemoTouchFlight } from '../../debug/DemoTouchFlight';
import {
    hzToMidi,
    midiToNormalized,
    normalizedPitchToScreenY,
} from '../../game/vocalFlightState';
import { getPlayfieldHeight } from '../../game/runFlightContext';

const PLAYFIELD_PAD = 56;
const PITCH_LERP = 0.15;
const TILT_LERP = 0.12;
const TILT_PER_PX = 0.0025;
const MAX_TILT = 0.4;
/** Downward glide when silent (px/s toward bottom of playfield). */
const SILENT_SINK_SPEED = 95;

/**
 * Fixed-player vocal flight: maps Pitchy Hz → MIDI → normalized pitch → target screen Y,
 * then `playerY += (targetY - playerY) * 0.15`. Dynamic nose tilt from (targetY - y).
 * Other entities keep legacy accel-based steering.
 */
export class VoiceInputSystem implements System {
    public readonly priority: number = 0;
    private readonly voiceManager: VoiceInputManager;
    private readonly queryMask: number;

    constructor() {
        this.voiceManager = VoiceInputManager.getInstance();
        this.queryMask = TransformComponent.TYPE_ID | VelocityComponent.TYPE_ID | FlightDynamicsComponent.TYPE_ID;
    }

    public update(_entities: Entity[], world: World, delta: number): void {
        if (GameState.paused || !GameState.runActive) return;

        if (this.voiceManager.isInitialized) {
            this.voiceManager.update();
        }

        const vol = this.voiceManager.isInitialized ? this.voiceManager.volume : 0;
        const hz = this.voiceManager.isInitialized ? this.voiceManager.pitchHz : 0;

        const matchingEntities = world.getEntities(this.queryMask);

        for (let i = 0; i < matchingEntities.length; i++) {
            const entity = matchingEntities[i];
            const velocity = world.getComponent<VelocityComponent>(entity, VelocityComponent.TYPE_ID)!;
            const transform = world.getComponent<TransformComponent>(entity, TransformComponent.TYPE_ID)!;

            if (world.getComponent(entity, PlayerFlightComponent.TYPE_ID)) {
                this.updateFixedPlayer(transform, velocity, vol, hz, delta);
                continue;
            }

            let verticalAccel = 0;

            if (vol > VOICE_FLIGHT.VOLUME_GATE && hz > 0) {
                const { PITCH_HZ_MIN, PITCH_HZ_MAX } = VOICE_FLIGHT;
                const t = Math.max(0, Math.min(1, (hz - PITCH_HZ_MIN) / (PITCH_HZ_MAX - PITCH_HZ_MIN)));
                verticalAccel = (0.5 - t) * 2 * VOICE_FLIGHT.PITCH_VERTICAL_STRENGTH;
            }

            const demo = DemoTouchFlight.getVertical();
            if (demo !== 0) {
                verticalAccel += demo * VOICE_FLIGHT.DEMO_TOUCH_STRENGTH;
            }

            velocity.vy += verticalAccel * delta;
        }
    }

    private updateFixedPlayer(
        transform: TransformComponent,
        velocity: VelocityComponent,
        vol: number,
        hz: number,
        delta: number,
    ): void {
        const h = getPlayfieldHeight();
        velocity.vx = 0;
        velocity.vy = 0;

        let targetY: number;
        const demo = DemoTouchFlight.getVertical();

        if (demo !== 0) {
            const curNorm =
                (transform.y - PLAYFIELD_PAD) / Math.max(1, h - PLAYFIELD_PAD * 2);
            const bump = demo * 0.08;
            targetY = normalizedPitchToScreenY(
                Math.max(0, Math.min(1, curNorm + bump)),
                h,
                PLAYFIELD_PAD,
            );
        } else if (vol > VOICE_FLIGHT.VOLUME_GATE && hz > 0) {
            const midi = hzToMidi(hz);
            const t = midiToNormalized(midi);
            targetY = normalizedPitchToScreenY(t, h, PLAYFIELD_PAD);
        } else {
            targetY = transform.y + SILENT_SINK_SPEED * delta;
            targetY = Math.min(h - PLAYFIELD_PAD, targetY);
        }

        transform.y += (targetY - transform.y) * PITCH_LERP;

        const tiltTarget = Math.max(
            -MAX_TILT,
            Math.min(MAX_TILT, (targetY - transform.y) * TILT_PER_PX),
        );
        transform.rotation += (tiltTarget - transform.rotation) * TILT_LERP;
    }
}
