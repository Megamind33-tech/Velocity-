import { Application, Container, TilingSprite, Assets } from 'pixi.js';
import { RENDERING } from '../../data/constants';

/**
 * High-performance Parallax System for simulating 3D depth in a 2D environment.
 * Manages multiple background layers with vertical and horizontal offsets.
 */
export class ParallaxSystem {
    private layers: TilingSprite[] = [];
    private container: Container;

    constructor(app: Application) {
        this.container = new Container();
        app.stage.addChildAt(this.container, 0); // Background layer
        this.init(app);
    }

    private async init(app: Application): Promise<void> {
        // In a real project, these would come from the Atlas loader
        // For this implementation, we'll use solid placeholder colors/patterns or mock textures
        for (const layerConfig of RENDERING.PARALLAX_LAYERS) {
            // Using a simple check pattern or noise for placeholder if texture not found
            const texture = await Assets.load('https://pixijs.com/assets/bunny.png'); // Placeholder
            const tilingSprite = new TilingSprite({
                texture,
                width: app.screen.width,
                height: app.screen.height,
            });
            
            tilingSprite.alpha = 0.2 + (layerConfig.depth * 0.1); // Visual depth cue
            this.container.addChild(tilingSprite);
            this.layers.push(tilingSprite);
        }
    }

    /**
     * Updates the parallax offsets based on player/camera movement.
     * @param cameraX Horizontal position of the camera/player.
     * @param cameraY Vertical position of the camera/player.
     */
    public update(cameraX: number, cameraY: number): void {
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const config = RENDERING.PARALLAX_LAYERS[i];

            // Calculate parallax offset based on layer speed
            layer.tilePosition.x = -cameraX * config.speed;
            layer.tilePosition.y = -cameraY * config.speed + config.offset;
        }
    }
}
