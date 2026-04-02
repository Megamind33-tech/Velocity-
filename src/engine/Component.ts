/**
 * Base interface for all components.
 * Components are plain data objects.
 */
export interface Component {
    readonly _typeId: number;
}

/**
 * Component Type Registry to manage unique IDs for bitmasking and caching.
 */
export class ComponentRegistry {
    private static nextId = 0;
    private static types = new Map<string, number>();

    public static getTypeId(name: string): number {
        if (!this.types.has(name)) {
            this.types.set(name, 1 << this.nextId++);
        }
        return this.types.get(name)!;
    }
}
