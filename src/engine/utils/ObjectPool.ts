/**
 * Generic Object Pool to minimize garbage collection (GC) by recycling objects.
 */
export class ObjectPool<T> {
    private pool: T[] = [];
    private factory: () => T;
    private reset: (obj: T) => void;

    constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 0) {
        this.factory = factory;
        this.reset = reset;

        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }

    /**
     * Retrieves an object from the pool or creates a new one if the pool is empty.
     */
    public acquire(): T {
        return this.pool.length > 0 ? this.pool.pop()! : this.factory();
    }

    /**
     * Returns an object to the pool for later reuse.
     */
    public release(obj: T): void {
        this.reset(obj);
        this.pool.push(obj);
    }

    public get size(): number {
        return this.pool.length;
    }
}
