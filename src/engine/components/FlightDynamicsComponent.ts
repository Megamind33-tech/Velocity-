import { Component, ComponentRegistry } from '../Component';

/**
 * Data-only component for flight-specific physics properties.
 */
export class FlightDynamicsComponent implements Component {
    public static readonly TYPE_ID = ComponentRegistry.getTypeId('FlightDynamics');
    public readonly _typeId = FlightDynamicsComponent.TYPE_ID;

    constructor(
        public mass: number = 1.0,           // Inertia
        public dragCoeff: number = 0.05,     // Air resistance
        public thrustPower: number = 800,    // Vertical/Forward push strength
        public liftFactor: number = 0.1,     // Speed-dependent upward force
        public gravityScale: number = 1.0    // Multiplier for global gravity
    ) {}
}
