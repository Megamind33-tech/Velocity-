import { Application, Container, TilingSprite, Texture } from 'pixi.js';
import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { RENDERING, type ParallaxLayerConfig } from '../../data/constants';
import { getWorldScrollX } from '../../game/worldScroll';
import { GameState } from '../GameState';

export type ParallaxInitOptions = {
    alphas?: number[];
    layersConfig?: ParallaxLayerConfig[];
    /** Source art height in px; sets uniform tileScale = screenH / this. */
    tilePixelHeight?: number;
};

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
    private readonly app: Application;
    private layerConfigs: ParallaxLayerConfig[] = RENDERING.PARALLAX_LAYERS;
    /** If set, `tileScale` = screenHeight / this (OGA 135px-tall strips). */
    private tilePixelHeight: number | null = null;

    constructor(app: Application) {
        this.app = app;
        this.container = new Container();
        app.stage.addChildAt(this.container, 0); // Background layer — always behind everything
    }

    /**
     * Initialises parallax textures and optional per-layer alpha overrides.
     * @param player   Entity whose TransformComponent drives vertical parallax wobble.
     * @param textures One texture per parallax layer (back → front).
     */
    public async init(player: Entity, textures: Texture[], options?: ParallaxInitOptions): Promise<void> {
        // Clear any previously loaded layers so re-init is safe.
        for (const s of this.layers) s.destroy();
        this.layers = [];

        this.playerEntity = player;
        this.layerConfigs = options?.layersConfig ?? RENDERING.PARALLAX_LAYERS;
        this.tilePixelHeight = options?.tilePixelHeight ?? null;

        const w = this.app.screen.width;
        const h = this.app.screen.height;
        const alphas = options?.alphas;
        const tileScaleUniform = this.computeTileScale(h);

        for (let i = 0; i < textures.length; i++) {
            const tilingSprite = new TilingSprite({
                texture: textures[i],
                width: w,
                height: h,
                tileScale: tileScaleUniform,
            });

            tilingSprite.alpha = alphas ? (alphas[i] ?? 1.0) : 1.0;
            this.container.addChild(tilingSprite);
            this.layers.push(tilingSprite);
        }
    }

    private computeTileScale(screenH: number): { x: number; y: number } {
        if (this.tilePixelHeight && this.tilePixelHeight > 0) {
            const s = screenH / this.tilePixelHeight;
            return { x: s, y: s };
        }
        return { x: 1, y: 1 };
    }

    /** Match canvas after resize/orientation (tiling area). */
    public resizeToScreen(): void {
        const w = this.app.screen.width;
        const h = this.app.screen.height;
        const ts = this.computeTileScale(h);
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i]!;
            layer.width = w;
            layer.height = h;
            layer.tileScale.set(ts.x, ts.y);
        }
    }

    public update(entities: Entity[], world: World, delta: number): void {
        this.container.visible = GameState.runActive;
        if (!GameState.runActive || !this.playerEntity) return;

        const transform = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!transform) return;

        const scroll = getWorldScrollX();

        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const config = this.layerConfigs[i] || { speed: 0.1, offset: 0, depth: 0 };

            // Fixed-player: parallax scrolls with world scrollX; vertical follows plane Y.
            layer.tilePosition.x = -scroll * config.speed;
            layer.tilePosition.y = -transform.y * config.speed * 0.3 + (config.offset ?? 0);
        }
    }
}
