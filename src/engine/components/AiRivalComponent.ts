import { Component, ComponentRegistry } from '../Component';

/** Marks the AI opponent craft in VS AI mode. */
export class AiRivalComponent implements Component {
    public static readonly TYPE_ID = ComponentRegistry.getTypeId('AiRival');
    public readonly _typeId = AiRivalComponent.TYPE_ID;
}
