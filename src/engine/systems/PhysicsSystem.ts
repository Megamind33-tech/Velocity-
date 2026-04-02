import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { FlightComponent } from '../components/FlightComponent';
import { PHYSICS } from '../../data/constants';

/**
 * System that handles aerodynamic flight physics using semi-implicit Euler integration.
 */
export class PhysicsSystem implements System {
    public readonly priority: number = 20;
    private readonly queryMask: number;

    constructor() {
        this.queryMask = TransformComponent.TYPE_ID | VelocityComponent.TYPE_ID | FlightComponent.TYPE_ID;
    }

    public update(entities: Entity[], world: World, delta: number): void {
        const matchingEntities = world.getEntities(this.queryMask);
        
        for (let i = 0; i < matchingEntities.length; i++) {
            const entity = matchingEntities[i];
            const transform = world.getComponent<TransformComponent>(entity, TransformComponent.TYPE_ID)!;
            const velocity = world.getComponent<VelocityComponent>(entity, VelocityComponent.TYPE_ID)!;
            const flight = world.getComponent<FlightComponent>(entity, FlightComponent.TYPE_ID)!;

            // 1. Calculate Forces
            let fx = 0;
            let fy = PHYSICS.GRAVITY; // Gravity always pulls down

            // Thrust from pitch
            const thrustX = Math.cos(flight.pitch) * flight.thrust * PHYSICS.THRUST_POWER;
            const thrustY = Math.sin(flight.pitch) * flight.thrust * PHYSICS.THRUST_POWER;
            fx += thrustX;
            fy += thrustY;

            // Drag (proportional to velocity squared)
            const speedSq = velocity.vx * velocity.vx + velocity.vy * velocity.vy;
            const speed = Math.sqrt(speedSq);
            if (speed > 0.1) {
                const dragX = - (velocity.vx / speed) * speedSq * PHYSICS.DRAG_COEFF;
                const dragY = - (velocity.vy / speed) * speedSq * PHYSICS.DRAG_COEFF;
                fx += dragX;
                fy += dragY;
            }

            // Lift (aerodynamic simulation)
            // Simplified: Lift is proportional to horizontal speed and orientation
            const liftMagnitude = PHYSICS.LIFT_COEFF * Math.abs(velocity.vx) * Math.cos(flight.pitch);
            
            // Stall simulation: If pitch is too high, lose lift
            flight.isStalling = Math.abs(flight.pitch) > PHYSICS.STALL_ANGLE;
            const liftMultiplier = flight.isStalling ? 0.2 : 1.0;
            
            fy -= liftMagnitude * liftMultiplier;

            // 2. Semi-implicit Euler Integration
            velocity.vx += fx * delta;
            velocity.vy += fy * delta;

            transform.x += velocity.vx * delta;
            transform.y += velocity.vy * delta;

            // Update transform orientation to match flight pitch for visuals
            // (The RenderSystem will smooth this)
            transform.rotation = flight.pitch;
        }
    }
}
