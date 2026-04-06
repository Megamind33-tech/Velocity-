import { Component, ComponentRegistry } from '../Component';

/** Marks the player entity for fixed-horizontal movement + vocal Y steering. */
export class PlayerFlightComponent implements Component {
    public static readonly TYPE_ID = ComponentRegistry.getTypeId('PlayerFlight');
    public readonly _typeId = PlayerFlightComponent.TYPE_ID;
}
