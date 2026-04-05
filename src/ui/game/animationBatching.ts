/**
 * Animation Batching — Optimize performance for multiple concurrent animations.
 *
 * When many animations run simultaneously, batching improves efficiency by:
 *   - Reducing function call overhead
 *   - Better memory locality
 *   - Simpler garbage collection
 *   - More predictable frame timing
 */

import { AnimationManager } from './AnimationManager';

interface BatchedAnimation {
    id: string;
    update: (progress: number) => void;
    startTime: number;
    duration: number;
    easing: (t: number) => number;
    onComplete?: () => void;
    cancelled: boolean;
}

/**
 * Animation batch for grouping related animations.
 * Processes all animations in the batch with a single requestAnimationFrame.
 */
export class AnimationBatch {
    private animManager = AnimationManager.getInstance();
    private animations: Map<string, BatchedAnimation> = new Map();
    private animationCounter = 0;
    private rafId: number | null = null;
    private groupName: string;

    constructor(groupName: string = 'batch') {
        this.groupName = groupName;
    }

    /**
     * Add an animation to the batch.
     */
    add(
        update: (progress: number) => void,
        duration: number,
        easing: (t: number) => number,
        onComplete?: () => void,
    ): string {
        const id = `batch_${++this.animationCounter}`;

        this.animations.set(id, {
            id,
            update,
            startTime: Date.now(),
            duration,
            easing,
            onComplete,
            cancelled: false,
        });

        // Start processing if not already running
        if (this.rafId === null) {
            this.process();
        }

        return id;
    }

    /**
     * Remove an animation from the batch.
     */
    remove(id: string): boolean {
        const anim = this.animations.get(id);
        if (!anim) return false;
        anim.cancelled = true;
        return true;
    }

    /**
     * Process all animations in the batch.
     */
    private process(): void {
        const currentTime = Date.now();

        for (const [id, anim] of this.animations.entries()) {
            if (anim.cancelled) {
                this.animations.delete(id);
                continue;
            }

            const elapsed = currentTime - anim.startTime;
            const progress = Math.min(elapsed / anim.duration, 1);
            const eased = anim.easing(progress);

            try {
                anim.update(eased);
            } catch (error) {
                console.error(`Batch animation ${id} error:`, error);
                this.animations.delete(id);
                continue;
            }

            if (progress >= 1) {
                try {
                    anim.onComplete?.();
                } catch (error) {
                    console.error(`Batch animation ${id} completion error:`, error);
                }
                this.animations.delete(id);
            }
        }

        // Continue if animations remain
        if (this.animations.size > 0) {
            this.rafId = requestAnimationFrame(() => this.process());
        } else {
            this.rafId = null;
        }
    }

    /**
     * Get count of active animations.
     */
    count(): number {
        return this.animations.size;
    }

    /**
     * Clear all animations in batch.
     */
    clear(): void {
        this.animations.clear();
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Check if batch is empty.
     */
    isEmpty(): boolean {
        return this.animations.size === 0;
    }
}

/**
 * Global animation batch for optimization.
 * Automatically batches animations when enabled.
 */
export class GlobalAnimationBatcher {
    private static instance: GlobalAnimationBatcher;
    private batches: Map<string, AnimationBatch> = new Map();
    private enabled = true;

    private constructor() {}

    static getInstance(): GlobalAnimationBatcher {
        if (!GlobalAnimationBatcher.instance) {
            GlobalAnimationBatcher.instance = new GlobalAnimationBatcher();
        }
        return GlobalAnimationBatcher.instance;
    }

    /**
     * Get or create batch by name.
     */
    getBatch(name: string = 'default'): AnimationBatch {
        if (!this.batches.has(name)) {
            this.batches.set(name, new AnimationBatch(name));
        }
        return this.batches.get(name)!;
    }

    /**
     * Add animation to batch.
     */
    add(
        update: (progress: number) => void,
        duration: number,
        easing: (t: number) => number,
        batchName: string = 'default',
        onComplete?: () => void,
    ): string {
        if (!this.enabled) {
            // Fallback to individual animation if batching disabled
            const animManager = AnimationManager.getInstance();
            let animId: string | null = null;
            const cancel = () => {
                if (animId) animManager.cancel(animId);
            };
            animId = animManager.register(cancel, { group: batchName });
            return animId;
        }

        return this.getBatch(batchName).add(update, duration, easing, onComplete);
    }

    /**
     * Remove animation from batch.
     */
    remove(id: string, batchName: string = 'default'): boolean {
        const batch = this.batches.get(batchName);
        if (!batch) return false;
        return batch.remove(id);
    }

    /**
     * Enable/disable batching.
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Clear all batches.
     */
    clearAll(): void {
        for (const batch of this.batches.values()) {
            batch.clear();
        }
        this.batches.clear();
    }
}
