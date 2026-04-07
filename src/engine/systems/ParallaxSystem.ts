import { Application, Container, TilingSprite, Texture } from 'pixi.js';
import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { RENDERING, type ParallaxLayerConfig } from '../../data/constants';
import {
    VISOR_LAYER_FOG_ALPHA,
    VISOR_LAYER_SCALES,
    VISOR_LAYER_WORLD_LOCK,
} from '../../game/vocalFlightRules';
import { getWorldScrollX } from '../../game/worldScroll';
import { GameState } from '../GameState';

export type ParallaxInitOptions = {
    alphas?: number[];
    layersConfig?: ParallaxLayerConfig[];
    /** Source art height in px; sets uniform tileScale = screenH / this. */
    tilePixelHeight?: number;
    /** 3-layer visor: per-layer scale, fog, slow drift, altitude-linked Y shift. */
    visorMode?: boolean;
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
    private visorMode = false;

    constructor(app: Application) {
        this.app = app;
        this.container = new Container();
        this.container.name = 'parallax-stack';
        /** Caller must `reparentToWorldScroll()` so layers get `-scrollX` with gates. */
    }

    /** Mount behind scrolling content (gates). Call once after `worldScrollRoot` exists. */
    public reparentToWorldScroll(worldScrollRoot: Container): void {
        if (this.container.parent === worldScrollRoot) return;
        this.container.parent?.removeChild(this.container);
        worldScrollRoot.addChildAt(this.container, 0);
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
        this.visorMode = Boolean(options?.visorMode);

        const w = this.app.screen.width;
        const h = this.app.screen.height;
        const alphas = options?.alphas;
        const tileScaleUniform = this.computeTileScale(h);

        for (let i = 0; i < textures.length; i++) {
            const ts = { ...tileScaleUniform };
            if (this.visorMode && i < VISOR_LAYER_SCALES.length) {
                ts.x *= VISOR_LAYER_SCALES[i]!;
                ts.y *= VISOR_LAYER_SCALES[i]!;
            }
            const tilingSprite = new TilingSprite({
                texture: textures[i],
                width: w,
                height: h,
                tileScale: ts,
            });

            let a = alphas ? (alphas[i] ?? 1.0) : 1.0;
            if (this.visorMode && i < VISOR_LAYER_FOG_ALPHA.length) {
                a *= 1 - VISOR_LAYER_FOG_ALPHA[i]!;
            }
            tilingSprite.alpha = a;
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
        const tsBase = this.computeTileScale(h);
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i]!;
            layer.width = w;
            layer.height = h;
            const ts = { ...tsBase };
            if (this.visorMode && i < VISOR_LAYER_SCALES.length) {
                ts.x *= VISOR_LAYER_SCALES[i]!;
                ts.y *= VISOR_LAYER_SCALES[i]!;
            }
            layer.tileScale.set(ts.x, ts.y);
        }
    }

    public update(entities: Entity[], world: World, delta: number): void {
        this.container.visible = GameState.runActive;
        if (!GameState.runActive || !this.playerEntity) return;

        const transform = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!transform) return;

        const scroll = getWorldScrollX();
        const centerY = this.app.screen.height * 0.5;
        const altShift = transform.y - centerY;

        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            let wLock: number;
            if (this.visorMode && i < VISOR_LAYER_WORLD_LOCK.length) {
                wLock = VISOR_LAYER_WORLD_LOCK[i]!;
            } else {
                const config = this.layerConfigs[i] || { worldLock: 1, offset: 0, depth: 0 };
                wLock = Math.max(0, Math.min(1, config.worldLock));
            }
            const config = this.layerConfigs[i] || { worldLock: wLock, offset: 0, depth: 0 };
            layer.tilePosition.x = scroll * (1 - wLock);
            if (this.visorMode) {
                layer.tilePosition.y = altShift * (0.1 + i * 0.1) + (config.offset ?? 0);
            } else {
                layer.tilePosition.y = -transform.y * wLock * 0.3 + (config.offset ?? 0);
            }
        }
    }
}
