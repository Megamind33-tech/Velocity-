/**
 * Entity is represented as a numerical ID for high performance.
 */
export type Entity = number;

/**
 * Manages creation and recycling of numerical entity IDs.
 */
export class EntityManager {
    private nextEntityId: Entity = 0;
    private recycledEntities: Entity[] = [];

    /**
     * Creates a new entity ID, recycling old ones if available.
     */
    public createEntity(): Entity {
        if (this.recycledEntities.length > 0) {
            return this.recycledEntities.pop()!;
        }
        return this.nextEntityId++;
    }

    /**
     * Recycles an entity ID for future use.
     */
    public destroyEntity(entity: Entity): void {
        this.recycledEntities.push(entity);
    }
}
