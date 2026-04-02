import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { GateComponent } from '../components/GateComponent';
import { LevelGenerator, LevelGate } from '../../levels/LevelGenerator';
import { ObjectPool } from '../utils/ObjectPool';
import { Song } from '../../data/songs';
import { Container, Sprite, Graphics, Texture } from 'pixi.js';

/**
 * System that manages the procedural generation and cleanup of level entities.
 * Optimized with Object Pooling for mobile performance.
 */
export class LevelSystem implements System {
    public readonly priority: number = 50;
    private generator: LevelGenerator;
    private gatesToSpawn: LevelGate[] = [];
    private playerEntity: Entity | null = null;
    private spawnRange: number = 2000;
    private cleanupRange: number = 800;
    private gateTexture: Texture | null = null;
    
    // Object Pool for recycling Gate sprites
    private spritePool: ObjectPool<Sprite>;

    constructor(
        private app: any,
        private readonly stageLayer: Container
    ) {
        this.generator = new LevelGenerator();
        this.spritePool = new ObjectPool<Sprite>(
            () => new Sprite(),
            (s) => {
                s.visible = false;
                s.parent?.removeChild(s);
            }
        );
    }

    /**
     * Initializes a level by pre-generating gate coordinates.
     */
    public initLevel(levelId: number, song: Song, player: Entity): void {
        this.playerEntity = player;
        this.gatesToSpawn = this.generator.generate(levelId, song, this.app.screen.height);
        
        // Pre-create gate texture
        if (!this.gateTexture) {
            const gfx = new Graphics();
            gfx.rect(-50, -100, 100, 200);
            gfx.fill({ color: 0x00ffcc, alpha: 0.3 });
            gfx.stroke({ color: 0x00ffcc, width: 4 });
            this.gateTexture = this.app.renderer.generateTexture(gfx);
        }
    }

    /** Clear gates between runs (returns sprites to pool). */
    public reset(world: World): void {
        const gates = [...world.getEntities(GateComponent.TYPE_ID)];
        for (let i = 0; i < gates.length; i++) {
            const spriteComp = world.getComponent<SpriteComponent>(gates[i], SpriteComponent.TYPE_ID);
            if (spriteComp) {
                this.spritePool.release(spriteComp.sprite);
            }
            world.destroyEntity(gates[i]);
        }
        this.gatesToSpawn = [];
        this.playerEntity = null;
    }

    public update(entities: Entity[], world: World, delta: number): void {
        if (!this.playerEntity) return;

        const playerTransform = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!playerTransform) return;

        // 1. Spawning
        while (this.gatesToSpawn.length > 0 && this.gatesToSpawn[0].x < playerTransform.x + this.spawnRange) {
            const gateData = this.gatesToSpawn.shift()!;
            this.spawnGate(world, gateData);
        }

        // 2. Cleanup & Recycling
        const existingGates = world.getEntities(GateComponent.TYPE_ID);
        for (let i = 0; i < existingGates.length; i++) {
            const gate = existingGates[i];
            const transform = world.getComponent<TransformComponent>(gate, TransformComponent.TYPE_ID);
            if (transform && transform.x < playerTransform.x - this.cleanupRange) {
                const spriteComp = world.getComponent<SpriteComponent>(gate, SpriteComponent.TYPE_ID);
                if (spriteComp) {
                    this.spritePool.release(spriteComp.sprite);
                }
                world.destroyEntity(gate);
            }
        }
    }

    private spawnGate(world: World, data: LevelGate): void {
        const entity = world.createEntity();
        
        const sprite = this.spritePool.acquire();
        sprite.texture = this.gateTexture!;
        sprite.visible = true;
        this.stageLayer.addChild(sprite);

        world.addComponent(entity, new TransformComponent(data.x, data.y));
        world.addComponent(entity, new SpriteComponent(sprite));
        world.addComponent(entity, new GateComponent(data.width));
    }
}
