import { Component, ComponentRegistry } from '../Component';

/**
 * Data-only component for Gates.
 */
export class GateComponent implements Component {
    public static readonly TYPE_ID = ComponentRegistry.getTypeId('Gate');
    public readonly _typeId = GateComponent.TYPE_ID;

    public passed: boolean = false;

    constructor(
        public width: number = 100,
        public height: number = 200,
        public points: number = 10
    ) {}
}
