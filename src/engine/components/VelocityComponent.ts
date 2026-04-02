import { Component, ComponentRegistry } from '../Component';

/**
 * Data-only component for movement velocity.
 */
export class VelocityComponent implements Component {
    public static readonly TYPE_ID = ComponentRegistry.getTypeId('Velocity');
    public readonly _typeId = VelocityComponent.TYPE_ID;

    constructor(
        public vx: number = 0,
        public vy: number = 0
    ) {}
}
