import { Application, UPDATE_PRIORITY } from 'pixi.js';
import { World } from './World';
import { GameState } from './GameState';

/**
 * The Engine manages the PixiJS Application and the high-stability game loop.
 * It uses a fixed-step accumulator pattern for physics/logic stability.
 *
 * Must use the Application's ticker: Pixi v8 defaults to a per-Application ticker
 * (not Ticker.shared), so registering on Ticker.shared would never run with app.render().
 */
export class Engine {
    private app: Application;
    private world: World;

    private readonly fixedTimeStep: number = 1 / 60;
    private accumulator: number = 0;
    private loopRegistered = false;

    constructor(app: Application, world: World) {
        this.app = app;
        this.world = world;
    }

    private onTick(): void {
        const delta = this.app.ticker.elapsedMS / 1000;

        if (!GameState.paused) {
            this.accumulator += Math.min(delta, 0.25);

            while (this.accumulator >= this.fixedTimeStep) {
                this.world.update(this.fixedTimeStep);
                this.accumulator -= this.fixedTimeStep;
            }
        }

        const interpolation = this.accumulator / this.fixedTimeStep;
        this.render(interpolation);
    }

    private render(interpolation: number): void {
        this.world.render(interpolation);
    }

    public start(): void {
        if (!this.loopRegistered) {
            // NORMAL runs before Application.render (UPDATE_PRIORITY.LOW) on the same ticker.
            this.app.ticker.add(this.onTick, this, UPDATE_PRIORITY.NORMAL);
            this.loopRegistered = true;
        }
        this.app.ticker.start();
        console.log(`Velocity Engine: Loop started (Fixed: ${1 / this.fixedTimeStep}Hz)`);
    }

    public stop(): void {
        if (this.loopRegistered) {
            this.app.ticker.remove(this.onTick, this);
            this.loopRegistered = false;
        }
    }
}
