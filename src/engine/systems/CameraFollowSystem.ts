import { Application, Container } from 'pixi.js';
import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { GameState } from '../GameState';

/**
 * Scrolls the gameplay world container so the player stays at a fixed screen position.
 *
 * For a left-to-right side-scrolling plane game:
 *   - Horizontal anchor: 27% from the left edge — gives the pilot a clear view ahead.
 *   - Vertical anchor: screen centre — the plane cruises on the horizon line.
 *
 * worldLayer is shifted each frame so that:
 *   worldLayer.x = anchorX - player.worldX
 *   worldLayer.y = anchorY - player.worldY
 *
 * All world children (plane sprite, gates) are in local worldLayer space, so
 * this single translation keeps the plane locked at the anchor while the world
 * scrolls behind it.
 */
export class CameraFollowSystem implements System {
    /** After SpriteSystem (100) so worldLayer tracks the final sprite transform each frame. */
    public readonly priority: number = 110;

    // Plane sits 27% from the left so the player can see plenty of runway ahead.
    private static readonly ANCHOR_X_RATIO = 0.27;
    // Plane sits at vertical screen centre (horizon line).
    private static readonly ANCHOR_Y_RATIO = 0.50;

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

    private anchorX(): number {
        return this.app.screen.width * CameraFollowSystem.ANCHOR_X_RATIO;
    }

    private anchorY(): number {
        return this.app.screen.height * CameraFollowSystem.ANCHOR_Y_RATIO;
    }

    /** Snap camera immediately (e.g. at run start) — no lerp lag. */
    public snapToPlayer(world: World): void {
        if (!this.playerEntity) return;
        const t = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!t) return;
        this.worldLayer.position.set(this.anchorX() - t.x, this.anchorY() - t.y);
    }

    /** When not in a run, leave the world layer untransformed. */
    public reset(): void {
        this.worldLayer.position.set(0, 0);
    }

    public render(_entities: Entity[], world: World, _interpolation: number): void {
        if (!GameState.runActive || GameState.paused || !this.playerEntity) return;

        const t = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!t) return;

        this.worldLayer.position.set(this.anchorX() - t.x, this.anchorY() - t.y);
    }
}
