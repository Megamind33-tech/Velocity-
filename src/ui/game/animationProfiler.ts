/**
 * Animation Profiler — Monitor and analyze animation performance.
 *
 * Tracks:
 *   - Frame time for each animation
 *   - CPU usage
 *   - Animation completion times
 *   - Performance bottlenecks
 */

interface AnimationMetrics {
    id: string;
    duration: number;
    startTime: number;
    endTime?: number;
    frameTimes: number[];
    averageFrameTime: number;
    maxFrameTime: number;
    minFrameTime: number;
    completed: boolean;
    error?: Error;
}

/**
 * Animation profiler for performance monitoring.
 */
export class AnimationProfiler {
    private static instance: AnimationProfiler;
    private metrics: Map<string, AnimationMetrics> = new Map();
    private enabled = false;
    private lastFrameTime = 0;

    private constructor() {}

    static getInstance(): AnimationProfiler {
        if (!AnimationProfiler.instance) {
            AnimationProfiler.instance = new AnimationProfiler();
        }
        return AnimationProfiler.instance;
    }

    /**
     * Enable profiling.
     */
    enable(): void {
        this.enabled = true;
        console.log('[AnimationProfiler] Enabled');
    }

    /**
     * Disable profiling.
     */
    disable(): void {
        this.enabled = false;
        console.log('[AnimationProfiler] Disabled');
    }

    /**
     * Check if profiling is enabled.
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Record animation start.
     */
    recordStart(id: string, duration: number): void {
        if (!this.enabled) return;

        this.metrics.set(id, {
            id,
            duration,
            startTime: performance.now(),
            frameTimes: [],
            averageFrameTime: 0,
            maxFrameTime: 0,
            minFrameTime: Infinity,
            completed: false,
        });
    }

    /**
     * Record frame time for animation.
     */
    recordFrame(id: string, frameTime: number): void {
        if (!this.enabled) return;

        const metric = this.metrics.get(id);
        if (!metric) return;

        metric.frameTimes.push(frameTime);
        metric.maxFrameTime = Math.max(metric.maxFrameTime, frameTime);
        metric.minFrameTime = Math.min(metric.minFrameTime, frameTime);

        // Update average
        const sum = metric.frameTimes.reduce((a, b) => a + b, 0);
        metric.averageFrameTime = sum / metric.frameTimes.length;

        // Warn if frame time exceeds 16ms (60fps target)
        if (frameTime > 16) {
            console.warn(
                `[AnimationProfiler] Slow frame for ${id}: ${frameTime.toFixed(2)}ms (target: 16ms)`,
            );
        }
    }

    /**
     * Record animation completion.
     */
    recordComplete(id: string): void {
        if (!this.enabled) return;

        const metric = this.metrics.get(id);
        if (!metric) return;

        metric.endTime = performance.now();
        metric.completed = true;

        const actualDuration = metric.endTime - metric.startTime;
        const expectedDuration = metric.duration;
        const drift = actualDuration - expectedDuration;

        if (Math.abs(drift) > 10) {
            console.warn(
                `[AnimationProfiler] Animation ${id} timing drift: ${drift.toFixed(2)}ms ` +
                `(expected: ${expectedDuration}ms, actual: ${actualDuration.toFixed(2)}ms)`,
            );
        }
    }

    /**
     * Record animation error.
     */
    recordError(id: string, error: Error): void {
        if (!this.enabled) return;

        const metric = this.metrics.get(id);
        if (metric) {
            metric.error = error;
        }
    }

    /**
     * Get metrics for a specific animation.
     */
    getMetrics(id: string): AnimationMetrics | undefined {
        return this.metrics.get(id);
    }

    /**
     * Get all metrics.
     */
    getAllMetrics(): AnimationMetrics[] {
        return Array.from(this.metrics.values());
    }

    /**
     * Get animations exceeding frame time threshold.
     */
    getSlowAnimations(threshold: number = 16): AnimationMetrics[] {
        return Array.from(this.metrics.values()).filter(
            (m) => m.maxFrameTime > threshold,
        );
    }

    /**
     * Get average frame time across all animations.
     */
    getAverageFrameTime(): number {
        const allMetrics = this.getAllMetrics();
        if (allMetrics.length === 0) return 0;

        const sum = allMetrics.reduce((acc, m) => acc + m.averageFrameTime, 0);
        return sum / allMetrics.length;
    }

    /**
     * Get 60fps compliance percentage.
     */
    get60fpCompliancePercentage(): number {
        const allMetrics = this.getAllMetrics();
        if (allMetrics.length === 0) return 100;

        let compliantFrames = 0;
        let totalFrames = 0;

        for (const metric of allMetrics) {
            totalFrames += metric.frameTimes.length;
            compliantFrames += metric.frameTimes.filter((t) => t <= 16).length;
        }

        return totalFrames === 0 ? 100 : (compliantFrames / totalFrames) * 100;
    }

    /**
     * Print performance report.
     */
    printReport(): void {
        if (!this.enabled) {
            console.log('[AnimationProfiler] Profiling disabled');
            return;
        }

        const allMetrics = this.getAllMetrics();
        if (allMetrics.length === 0) {
            console.log('[AnimationProfiler] No animations recorded');
            return;
        }

        console.group('[AnimationProfiler] Performance Report');
        console.log(`Total Animations: ${allMetrics.length}`);
        console.log(`Completed: ${allMetrics.filter((m) => m.completed).length}`);
        console.log(`Errors: ${allMetrics.filter((m) => m.error).length}`);
        console.log(`Average Frame Time: ${this.getAverageFrameTime().toFixed(2)}ms`);
        console.log(`60fps Compliance: ${this.get60fpCompliancePercentage().toFixed(1)}%`);

        const slowAnimations = this.getSlowAnimations();
        if (slowAnimations.length > 0) {
            console.group('Slow Animations (>16ms)');
            for (const metric of slowAnimations) {
                console.log(
                    `  ${metric.id}: max=${metric.maxFrameTime.toFixed(2)}ms, ` +
                    `avg=${metric.averageFrameTime.toFixed(2)}ms`,
                );
            }
            console.groupEnd();
        }

        console.groupEnd();
    }

    /**
     * Clear all metrics.
     */
    clear(): void {
        this.metrics.clear();
    }

    /**
     * Export metrics as JSON.
     */
    export(): string {
        return JSON.stringify(
            Array.from(this.metrics.values()).map((m) => ({
                id: m.id,
                duration: m.duration,
                actualDuration: m.endTime ? m.endTime - m.startTime : 'N/A',
                averageFrameTime: m.averageFrameTime.toFixed(2),
                maxFrameTime: m.maxFrameTime.toFixed(2),
                minFrameTime: m.minFrameTime === Infinity ? 'N/A' : m.minFrameTime.toFixed(2),
                frameCount: m.frameTimes.length,
                completed: m.completed,
                hasError: !!m.error,
            })),
            null,
            2,
        );
    }
}
