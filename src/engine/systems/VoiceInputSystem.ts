import { Entity, World, System } from '../World';
import { VelocityComponent } from '../components/VelocityComponent';
import { FlightDynamicsComponent } from '../components/FlightDynamicsComponent';
import { VoiceInputManager } from '../input/VoiceInputManager';

/**
 * System that bridges real-time voice input to ECS components.
 */
export class VoiceInputSystem implements System {
    public readonly priority: number = 0; // Run first to capture input
    private readonly voiceManager: VoiceInputManager;
    private readonly queryMask: number;

    constructor() {
        this.voiceManager = VoiceInputManager.getInstance();
        this.queryMask = VelocityComponent.TYPE_ID | FlightDynamicsComponent.TYPE_ID;
    }

    public update(entities: Entity[], world: World, delta: number): void {
        if (!this.voiceManager.isInitialized) return;

        // Poll latest levels from audio context
        this.voiceManager.update();
        
        const volume = this.voiceManager.volume;
        const frequency = this.voiceManager.frequency;

        const matchingEntities = world.getEntities(this.queryMask);

        for (let i = 0; i < matchingEntities.length; i++) {
            const entity = matchingEntities[i];
            const velocity = world.getComponent<VelocityComponent>(entity, VelocityComponent.TYPE_ID)!;
            const flight = world.getComponent<FlightDynamicsComponent>(entity, FlightDynamicsComponent.TYPE_ID)!;

            // 1. Map Volume to Upward Thrust
            // Noise floor threshold (e.g., ignore volume below 10%)
            if (volume > 0.1) {
                const thrustForce = (volume - 0.1) * flight.thrustPower;
                velocity.vy -= thrustForce * delta;
            }

            // 2. Map Frequency to Horizontal Speed Bias (Optional)
            // Higher pitch = tilt forward? (For now just log for debug)
            if (volume > 0.2) {
                // If frequency > 0.5 (high pitch), slightly boost horizontal speed
                const speedBoost = (frequency > 0.5) ? 50 : -20;
                velocity.vx += speedBoost * delta;
            }
        }
    }
}
