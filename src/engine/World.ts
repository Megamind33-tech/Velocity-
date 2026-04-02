import { Entity, EntityManager } from './Entity';
export type { Entity };
export { EntityManager };
import { Component, ComponentRegistry } from './Component';

/**
 * Interface for systems that process entities in the World.
 */
export interface System {
    readonly priority: number;
    update?(entities: Entity[], world: World, delta: number): void;
    render?(entities: Entity[], world: World, interpolation: number): void;
}

/**
 * The World is the central registry for ECS. 
 * It manages entities, components, and systems with cached queries.
 */
export class World {
    private entityManager: EntityManager;
    private entitiesCount: number = 0;
    private entityComponents: Map<Entity, Map<number, Component>>;
    private entityMasks: Map<Entity, number>;
    private systems: System[];

    // Query Cache: Component Mask -> List of Entities
    private queryCache: Map<number, Entity[]>;

    constructor() {
        this.entityManager = new EntityManager();
        this.entityComponents = new Map();
        this.entityMasks = new Map();
        this.systems = [];
        this.queryCache = new Map();
    }

    /**
     * Creates a new entity.
     */
    public createEntity(): Entity {
        const entity = this.entityManager.createEntity();
        this.entityComponents.set(entity, new Map());
        this.entityMasks.set(entity, 0);
        this.entitiesCount++;
        return entity;
    }

    /**
     * Destroys an entity and cleans up its components.
     */
    public destroyEntity(entity: Entity): void {
        this.entityComponents.delete(entity);
        this.entityMasks.delete(entity);
        this.entityManager.destroyEntity(entity);
        this.entitiesCount--;
        
        // Remove from all caches
        for (const entities of this.queryCache.values()) {
            const index = entities.indexOf(entity);
            if (index !== -1) {
                entities.splice(index, 1);
            }
        }
    }

    /**
     * Adds a component to an entity.
     */
    public addComponent(entity: Entity, component: Component): void {
        const components = this.entityComponents.get(entity);
        if (!components) return;

        components.set(component._typeId, component);
        const oldMask = this.entityMasks.get(entity) || 0;
        const newMask = oldMask | component._typeId;
        this.entityMasks.set(entity, newMask);

        this.updateCache(entity, oldMask, newMask);
    }

    /**
     * Removes a component from an entity.
     */
    public removeComponent(entity: Entity, typeId: number): void {
        const components = this.entityComponents.get(entity);
        if (!components) return;

        if (components.delete(typeId)) {
            const oldMask = this.entityMasks.get(entity) || 0;
            const newMask = oldMask & ~typeId;
            this.entityMasks.set(entity, newMask);
            this.updateCache(entity, oldMask, newMask);
        }
    }

    /**
     * Gets a component from an entity.
     */
    public getComponent<T extends Component>(entity: Entity, typeId: number): T | undefined {
        return this.entityComponents.get(entity)?.get(typeId) as T;
    }

    /**
     * Registers a system and sorts systems by priority.
     */
    public addSystem(system: System): void {
        this.systems.push(system);
        this.systems.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Retrieves entities that match a specific combination of components via the cache.
     * Use ComponentRegistry.getTypeId('Name') | ComponentRegistry.getTypeId('Other') for the mask.
     */
    public getEntities(mask: number): Entity[] {
        if (!this.queryCache.has(mask)) {
            // Build initial cache for this query
            const entities: Entity[] = [];
            for (const [entity, entityMask] of this.entityMasks.entries()) {
                if ((entityMask & mask) === mask) {
                    entities.push(entity);
                }
            }
            this.queryCache.set(mask, entities);
        }
        return this.queryCache.get(mask)!;
    }

    /**
     * Updates the query caches when an entity's component mask changes.
     */
    private updateCache(entity: Entity, oldMask: number, newMask: number): void {
        for (const [queryMask, cachedEntities] of this.queryCache.entries()) {
            const matchesOld = (oldMask & queryMask) === queryMask;
            const matchesNew = (newMask & queryMask) === queryMask;

            if (!matchesOld && matchesNew) {
                cachedEntities.push(entity);
            } else if (matchesOld && !matchesNew) {
                const index = cachedEntities.indexOf(entity);
                if (index !== -1) {
                    cachedEntities.splice(index, 1);
                }
            }
        }
    }

    /**
     * Runs the update phase for all registered systems.
     */
    public update(delta: number): void {
        for (const system of this.systems) {
            if (system.update) {
                system.update([], this, delta);
            }
        }
    }

    /**
     * Runs the render phase for all registered systems with interpolation.
     */
    public render(interpolation: number): void {
        for (const system of this.systems) {
            if (system.render) {
                system.render([], this, interpolation);
            }
        }
    }
}
