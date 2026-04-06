import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { FlightDynamicsComponent } from '../components/FlightDynamicsComponent';
import { PlayerFlightComponent } from '../components/PlayerFlightComponent';
import { GameState } from '../GameState';

/**
 * System that implements flight dynamics for a side-scrolling plane game.
 * The plane flies in a straight horizontal line (left to right) by default.
 * Vertical movement is voice-controlled; drag returns the plane to level flight
 * when no input is active.  Gravity is intentionally absent so the cruise
 * path stays horizontal like a real fixed-wing aircraft at trim speed.
 */
export class FlightDynamicsSystem implements System {
    public readonly priority: number = 5; // Run before MovementSystem
    private readonly queryMask: number;

    // Vertical return-to-level damping (fraction of vy shed per second via extra drag).
    // This is in addition to the quadratic aerodynamic drag below.
    private static readonly VERTICAL_DAMPING = 4.5; // s⁻¹  (vy ≈ halved every ~0.15 s with no input)
    private static readonly AIR_DENSITY = 1.2;

    constructor() {
        this.queryMask = TransformComponent.TYPE_ID | VelocityComponent.TYPE_ID | FlightDynamicsComponent.TYPE_ID;
    }

    public update(entities: Entity[], world: World, delta: number): void {
        if (GameState.paused || !GameState.runActive) return;

        const matchingEntities = world.getEntities(this.queryMask);

        for (let i = 0; i < matchingEntities.length; i++) {
            const entity = matchingEntities[i];
            if (world.getComponent(entity, PlayerFlightComponent.TYPE_ID)) continue;

            const velocity = world.getComponent<VelocityComponent>(entity, VelocityComponent.TYPE_ID)!;
            const flight = world.getComponent<FlightDynamicsComponent>(entity, FlightDynamicsComponent.TYPE_ID)!;
            const transform = world.getComponent<TransformComponent>(entity, TransformComponent.TYPE_ID)!;

            // Gravity is disabled — the plane trims to straight and level at cruise speed.
            // gravityScale is kept in FlightDynamicsComponent for optional future use.

            // Quadratic aerodynamic drag (F = -½ ρ v² Cd A) — opposes velocity.
            const speedSq = velocity.vx * velocity.vx + velocity.vy * velocity.vy;
            if (speedSq > 0.1) {
                const speed = Math.sqrt(speedSq);
                const dragAmount = 0.5 * FlightDynamicsSystem.AIR_DENSITY * speedSq * flight.dragCoeff;
                const dragX = -(velocity.vx / speed) * dragAmount;
                const dragY = -(velocity.vy / speed) * dragAmount;
                velocity.vx += (dragX / flight.mass) * delta;
                velocity.vy += (dragY / flight.mass) * delta;
            }

            // Extra vertical damping — returns vy to zero (level flight) when voice input stops.
            // AutoForwardSystem already keeps vx at cruise speed, so we only damp vy here.
            velocity.vy -= velocity.vy * FlightDynamicsSystem.VERTICAL_DAMPING * delta;

            // Side-view sprite: always horizontal — no pitch tilt from vy.
            transform.rotation = 0;
        }
    }
}
