import { Application, Container } from 'pixi.js';
import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { GameState } from '../GameState';

/**
 * Scrolls the gameplay world container so the player stays at the screen center.
 * Global position = worldLayer.position + local (transform). We want player at (cx,cy), so:
 *   worldLayer.position = (cx - player.x, cy - player.y)
 */
export class CameraFollowSystem implements System {
    public readonly priority: number = 105;

    private readonly app: Application;
    private readonly worldLayer: Container;
    private playerEntity: Entity | null = null;

    constructor(app: Application, worldLayer: Container, player: Entity) {
        this.app = app;
        this.worldLayer = worldLayer;
        this.playerEntity = player;
    }

    public setPlayer(player: Entity): void {
        this.playerEntity = player;
    }

    /** Snap camera immediately (e.g. run start). */
    public snapToPlayer(world: World): void {
        if (!this.playerEntity) return;
        const t = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!t) return;
        const cx = this.app.screen.width / 2;
        const cy = this.app.screen.height / 2;
        this.worldLayer.position.set(cx - t.x, cy - t.y);
    }

    /** When not in a run, leave the world layer untransformed so nothing else shifts. */
    public reset(): void {
        this.worldLayer.position.set(0, 0);
    }

    public render(_entities: Entity[], world: World, _interpolation: number): void {
        if (!GameState.runActive || GameState.paused || !this.playerEntity) return;

        const t = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!t) return;

        const cx = this.app.screen.width / 2;
        const cy = this.app.screen.height / 2;
        this.worldLayer.position.set(cx - t.x, cy - t.y);
    }
}
