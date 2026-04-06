import { Application, Container, TilingSprite, Texture } from 'pixi.js';
import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { RENDERING } from '../../data/constants';
import { GameState } from '../GameState';

/**
 * High-performance Parallax System.
 * Manages multiple TilingSprite background layers that scroll at different
 * speeds relative to the player, creating a sense of depth.
 */
export class ParallaxSystem implements System {
    public readonly priority: number = 200;
    private layers: TilingSprite[] = [];
    private container: Container;
    private playerEntity: Entity | null = null;

    constructor(app: Application) {
        this.container = new Container();
        app.stage.addChildAt(this.container, 0); // Background layer — always behind everything
    }

    /**
     * Initialises parallax textures and optional per-layer alpha overrides.
     * @param player   Entity whose TransformComponent drives the scroll offset.
     * @param textures One texture per parallax layer (index matches RENDERING.PARALLAX_LAYERS).
     * @param alphas   Optional alpha per layer; falls back to a neutral 1.0 if omitted.
     */
    public async init(player: Entity, textures: Texture[], alphas?: number[]): Promise<void> {
        // Clear any previously loaded layers so re-init is safe.
        for (const s of this.layers) s.destroy();
        this.layers = [];

        this.playerEntity = player;

        for (let i = 0; i < textures.length; i++) {
            const tilingSprite = new TilingSprite({
                texture: textures[i],
                width: window.innerWidth,
                height: window.innerHeight,
            });

            // Use caller-supplied alpha if provided, else full opacity.
            tilingSprite.alpha = alphas ? (alphas[i] ?? 1.0) : 1.0;
            this.container.addChild(tilingSprite);
            this.layers.push(tilingSprite);
        }
    }

    public update(entities: Entity[], world: World, delta: number): void {
        this.container.visible = GameState.runActive;
        if (!GameState.runActive || !this.playerEntity) return;

        const transform = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!transform) return;

        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const config = RENDERING.PARALLAX_LAYERS[i] || { speed: 0.1, offset: 0 };

            // Scroll horizontally with the player; layers farther back scroll slower.
            layer.tilePosition.x = -transform.x * config.speed;
            layer.tilePosition.y = -transform.y * config.speed * 0.3 + (config.offset ?? 0);
        }
    }
}
