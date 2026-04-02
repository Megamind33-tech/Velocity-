import { Component, ComponentRegistry } from '../Component';

/**
 * Component for tracking flight-specific state like thrust and orientation.
 */
export class FlightComponent implements Component {
    public static readonly TYPE_ID = ComponentRegistry.getTypeId('Flight');
    public readonly _typeId = FlightComponent.TYPE_ID;

    constructor(
        public thrust: number = 0, // 0 to 1
        public pitch: number = 0,  // radians
        public targetPitch: number = 0,
        public isStalling: boolean = false
    ) {}
}
