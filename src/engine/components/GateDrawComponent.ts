import { Graphics } from 'pixi.js';
import { Component, ComponentRegistry } from '../Component';

/** Pixi graphics for a gate obstacle (two pillars + gap). */
export class GateDrawComponent implements Component {
    public static readonly TYPE_ID = ComponentRegistry.getTypeId('GateDraw');
    public readonly _typeId = GateDrawComponent.TYPE_ID;

    constructor(public readonly graphics: Graphics) {}
}
