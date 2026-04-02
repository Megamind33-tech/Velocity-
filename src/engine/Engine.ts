import { Application, Ticker } from 'pixi.js';
import { World } from './World';

/**
 * The Engine manages the PixiJS Application and the high-stability game loop.
 * It uses a fixed-step accumulator pattern for physics/logic stability.
 */
export class Engine {
    private app: Application;
    private world: World;
    
    // Fixed Time Step Configuration
    private readonly fixedTimeStep: number = 1 / 60; // 60 FPS fixed logic
    private accumulator: number = 0;
    
    constructor(app: Application, world: World) {
        this.app = app;
        this.world = world;
        
        // Setup Ticker
        Ticker.shared.add(this.onTick, this);
    }

    /**
     * The main ticker callback executed by PixiJS.
     * Implements the Variable-Delta Accumulator (Fixed Update / Variable Render).
     */
    private onTick(): void {
        const delta = Ticker.shared.elapsedMS / 1000;
        
        // Cap delta to prevent "spiral of death" during extreme lag
        this.accumulator += Math.min(delta, 0.25);

        // Fixed Update Phase
        while (this.accumulator >= this.fixedTimeStep) {
            this.world.update(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
        }

        // Render Phase (Variable Delta)
        // Interpolation factor to smooth visuals between fixed updates
        const interpolation = this.accumulator / this.fixedTimeStep;
        this.render(interpolation);
    }

    /**
     * Executes the render phase for all systems.
     */
    private render(interpolation: number): void {
        this.world.render(interpolation);
    }

    public start(): void {
        Ticker.shared.start();
        console.log(`Velocity Engine: Loop started (Fixed: ${1/this.fixedTimeStep}Hz)`);
    }

    public stop(): void {
        Ticker.shared.stop();
    }
}
