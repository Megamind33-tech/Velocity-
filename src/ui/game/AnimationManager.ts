/**
 * AnimationManager — Central hub for managing all UI animations.
 *
 * Provides:
 *   - Animation queuing and priority management
 *   - Global animation pause/resume (for menu interactions)
 *   - Animation cancellation and cleanup
 *   - Performance monitoring (frame timing)
 *   - Animation lifecycle hooks
 */

import { DisplayObject } from 'pixi.js';

interface AnimationRecord {
    id: string;
    cancel: () => void;
    priority: 'low' | 'normal' | 'high';
    group?: string;
    createdAt: number;
    target?: DisplayObject;
}

interface AnimationConfig {
    priority?: 'low' | 'normal' | 'high';
    group?: string;
    onStart?: () => void;
    onComplete?: () => void;
}

export class AnimationManager {
    private static instance: AnimationManager;
    private animations = new Map<string, AnimationRecord>();
    private animationCounter = 0;
    private paused = false;
    private pausedAnimations = new Set<string>();

    private constructor() {}

    /**
     * Get the singleton instance of AnimationManager.
     */
    static getInstance(): AnimationManager {
        if (!AnimationManager.instance) {
            AnimationManager.instance = new AnimationManager();
        }
        return AnimationManager.instance;
    }

    /**
     * Register and track a new animation.
     * @param cancel Cancel function for the animation
     * @param config Animation configuration
     * @returns Animation ID for later reference
     */
    register(cancel: () => void, config: AnimationConfig = {}): string {
        const id = `anim_${++this.animationCounter}`;
        const { priority = 'normal', group, onStart, onComplete } = config;

        onStart?.();

        const wrappedCancel = () => {
            this.animations.delete(id);
            this.pausedAnimations.delete(id);
            cancel();
            onComplete?.();
        };

        this.animations.set(id, {
            id,
            cancel: wrappedCancel,
            priority,
            group,
            createdAt: Date.now(),
        });

        return id;
    }

    /**
     * Cancel a specific animation by ID.
     */
    cancel(id: string): boolean {
        const anim = this.animations.get(id);
        if (!anim) return false;
        anim.cancel();
        return true;
    }

    /**
     * Cancel all animations in a group.
     */
    cancelGroup(group: string): number {
        let count = 0;
        for (const [id, anim] of this.animations.entries()) {
            if (anim.group === group) {
                anim.cancel();
                count++;
            }
        }
        return count;
    }

    /**
     * Cancel all animations for a specific object.
     */
    cancelObject(target: DisplayObject): number {
        let count = 0;
        for (const [id, anim] of this.animations.entries()) {
            if (anim.target === target) {
                anim.cancel();
                count++;
            }
        }
        return count;
    }

    /**
     * Clear all active animations.
     */
    clear(): number {
        const count = this.animations.size;
        for (const anim of this.animations.values()) {
            anim.cancel();
        }
        this.animations.clear();
        this.pausedAnimations.clear();
        return count;
    }

    /**
     * Pause all animations (used during menu transitions).
     */
    pauseAll(): void {
        if (this.paused) return;
        this.paused = true;
        this.pausedAnimations.clear();
        // In a full implementation, we would pause requestAnimationFrame callbacks
        // For now, this is a marker for the animation system
    }

    /**
     * Resume all animations.
     */
    resumeAll(): void {
        if (!this.paused) return;
        this.paused = false;
        this.pausedAnimations.clear();
    }

    /**
     * Check if animations are globally paused.
     */
    isPaused(): boolean {
        return this.paused;
    }

    /**
     * Get count of active animations.
     */
    getActiveCount(): number {
        return this.animations.size;
    }

    /**
     * Get animations by priority.
     */
    getByPriority(priority: 'low' | 'normal' | 'high'): string[] {
        return Array.from(this.animations.entries())
            .filter(([_, anim]) => anim.priority === priority)
            .map(([id]) => id);
    }

    /**
     * Get all animation IDs in a group.
     */
    getGroup(group: string): string[] {
        return Array.from(this.animations.entries())
            .filter(([_, anim]) => anim.group === group)
            .map(([id]) => id);
    }

    /**
     * Debug: Log all active animations.
     */
    debug(): void {
        console.group('AnimationManager Debug');
        console.log(`Total Active: ${this.animations.size}`);
        console.log(`Paused: ${this.paused}`);

        const byPriority = {
            high: this.getByPriority('high'),
            normal: this.getByPriority('normal'),
            low: this.getByPriority('low'),
        };

        console.log('By Priority:', byPriority);

        const groups = new Map<string, string[]>();
        for (const [id, anim] of this.animations.entries()) {
            if (anim.group) {
                if (!groups.has(anim.group)) {
                    groups.set(anim.group, []);
                }
                groups.get(anim.group)!.push(id);
            }
        }

        if (groups.size > 0) {
            console.log('By Group:', Object.fromEntries(groups));
        }

        console.groupEnd();
    }
}
