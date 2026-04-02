import { Application, Container, TilingSprite, Assets, Texture } from 'pixi.js';
import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { RENDERING } from '../../data/constants';

/**
 * High-performance Parallax System for simulating 3D depth in a 2D environment.
 * Manages multiple background layers with vertical and horizontal offsets.
 */
export class ParallaxSystem implements System {
    public readonly priority: number = 200;
    private layers: TilingSprite[] = [];
    private container: Container;
    private playerEntity: Entity | null = null;

    constructor(app: Application) {
        this.container = new Container();
        app.stage.addChildAt(this.container, 0); // Background layer
    }

    /**
     * Initializes parallax textures and player reference.
     */
    public async init(player: Entity, textures: Texture[]): Promise<void> {
        this.playerEntity = player;
        
        for (let i = 0; i < textures.length; i++) {
            const config = RENDERING.PARALLAX_LAYERS[i] || { speed: 0.1, offset: 0 };
            const tilingSprite = new TilingSprite({
                texture: textures[i],
                width: window.innerWidth,
                height: window.innerHeight,
            });
            
            tilingSprite.alpha = 0.2 + (i * 0.15); // Visual depth cue
            this.container.addChild(tilingSprite);
            this.layers.push(tilingSprite);
        }
    }

    public update(entities: Entity[], world: World, delta: number): void {
        if (this.playerEntity === null) return;

        const transform = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!transform) return;

        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const config = RENDERING.PARALLAX_LAYERS[i] || { speed: 0.1, offset: 0 };

            // Tile position updates relative to player movement
            layer.tilePosition.x = -transform.x * config.speed;
            layer.tilePosition.y = -transform.y * config.speed + config.offset;
        }
    }
}
