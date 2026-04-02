import { Component, ComponentRegistry } from '../Component';

/**
 * Data-only component for spatial properties.
 */
export class TransformComponent implements Component {
    public static readonly TYPE_ID = ComponentRegistry.getTypeId('Transform');
    public readonly _typeId = TransformComponent.TYPE_ID;

    constructor(
        public x: number = 0,
        public y: number = 0,
        public rotation: number = 0,
        public scaleX: number = 1,
        public scaleY: number = 1
    ) {}
}
