import { Application, Ticker } from 'pixi.js';
import { World } from './World';
import { GameState } from './GameState';

/**
 * The Engine manages the PixiJS Application and the high-stability game loop.
 * It uses a fixed-step accumulator pattern for physics/logic stability.
 */
export class Engine {
    private app: Application;
    private world: World;

    private readonly fixedTimeStep: number = 1 / 60;
    private accumulator: number = 0;

    constructor(app: Application, world: World) {
        this.app = app;
        this.world = world;

        Ticker.shared.add(this.onTick, this);
    }

    private onTick(): void {
        const delta = Ticker.shared.elapsedMS / 1000;

        if (GameState.gameplayActive && !GameState.paused) {
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
        Ticker.shared.start();
        console.log(`Velocity Engine: Loop started (Fixed: ${1 / this.fixedTimeStep}Hz)`);
    }

    public stop(): void {
        Ticker.shared.stop();
    }
}
