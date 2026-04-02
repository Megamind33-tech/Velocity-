import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { FlightDynamicsComponent } from '../components/FlightDynamicsComponent';

/**
 * System that implements high-fidelity flight dynamics.
 * Calculates gravity, aerodynamic drag, and lift based on velocity.
 */
export class FlightDynamicsSystem implements System {
    public readonly priority: number = 5; // Run before MovementSystem
    private readonly queryMask: number;
    
    // Global Constants
    private static readonly GRAVITY = 9.8 * 60; // Pixels per second squared (scaled for gameplay)
    private static readonly AIR_DENSITY = 1.2;

    constructor() {
        this.queryMask = TransformComponent.TYPE_ID | VelocityComponent.TYPE_ID | FlightDynamicsComponent.TYPE_ID;
    }

    public update(entities: Entity[], world: World, delta: number): void {
        const matchingEntities = world.getEntities(this.queryMask);

        for (let i = 0; i < matchingEntities.length; i++) {
            const entity = matchingEntities[i];
            const velocity = world.getComponent<VelocityComponent>(entity, VelocityComponent.TYPE_ID)!;
            const flight = world.getComponent<FlightDynamicsComponent>(entity, FlightDynamicsComponent.TYPE_ID)!;
            const transform = world.getComponent<TransformComponent>(entity, TransformComponent.TYPE_ID)!;

            // 1. Apply Gravity
            velocity.vy += FlightDynamicsSystem.GRAVITY * flight.gravityScale * delta;

            // 2. Apply Quadratic Drag (F = -0.5 * rho * v^2 * Cd * A)
            // Simplified for 2D: Force is proportional to speed squared in opposite direction
            const speedSq = velocity.vx * velocity.vx + velocity.vy * velocity.vy;
            if (speedSq > 0.1) {
                const speed = Math.sqrt(speedSq);
                const dragAmount = 0.5 * FlightDynamicsSystem.AIR_DENSITY * speedSq * flight.dragCoeff;
                
                // Direction of drag is opposite to velocity
                const dragX = -(velocity.vx / speed) * dragAmount;
                const dragY = -(velocity.vy / speed) * dragAmount;

                velocity.vx += (dragX / flight.mass) * delta;
                velocity.vy += (dragY / flight.mass) * delta;
            }

            // 3. Apply "Angle of Attack" Rotation
            // Tilt the sprite based on its trajectory
            if (Math.abs(velocity.vx) > 10) {
                const targetRotation = Math.atan2(velocity.vy, velocity.vx);
                // Smoothly interpolate rotation (Lerp)
                transform.rotation += (targetRotation - transform.rotation) * 0.1;
            }
        }
    }
}
