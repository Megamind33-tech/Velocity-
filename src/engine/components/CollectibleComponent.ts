import { Component, ComponentRegistry } from '../Component';

export type CollectibleKind = 'gold' | 'mult';

/** Score orb (gold) or multiplier orb (purple). */
export class CollectibleComponent implements Component {
    public static readonly TYPE_ID = ComponentRegistry.getTypeId('Collectible');
    public readonly _typeId = CollectibleComponent.TYPE_ID;

    constructor(
        public readonly kind: CollectibleKind,
        public collected: boolean = false,
    ) {}
}
