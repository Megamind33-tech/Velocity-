import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { GateComponent } from '../components/GateComponent';
import { LevelGenerator, LevelGate } from '../../levels/LevelGenerator';
import { ObjectPool } from '../utils/ObjectPool';
import { Song } from '../../data/songs';
import { Sprite, Graphics, Texture } from 'pixi.js';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';

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
    private gatesTotal: number = 0;
    private gatesPassedCount: number = 0;
    
    // Object Pool for recycling Gate sprites
    private spritePool: ObjectPool<Sprite>;

    constructor(private app: any) {
        this.generator = new LevelGenerator();
        EventBus.getInstance().on(GameEvents.GATE_PASSED, () => {
            this.onGatePassed();
        });
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
    public initLevel(world: World, levelId: number, song: Song, player: Entity): void {
        this.playerEntity = player;

        const existingGates = world.getEntities(GateComponent.TYPE_ID);
        for (let i = 0; i < existingGates.length; i++) {
            const ge = existingGates[i];
            const spriteComp = world.getComponent<SpriteComponent>(ge, SpriteComponent.TYPE_ID);
            if (spriteComp) {
                this.spritePool.release(spriteComp.sprite);
            }
            world.destroyEntity(ge);
        }

        this.gatesToSpawn = this.generator.generate(levelId, song, this.app.screen.height);
        this.gatesTotal = this.gatesToSpawn.length;
        this.gatesPassedCount = 0;
        if (this.gatesTotal === 0) {
            EventBus.getInstance().emit(GameEvents.LEVEL_COMPLETE);
        }
        
        // Pre-create gate texture
        if (!this.gateTexture) {
            const gfx = new Graphics();
            gfx.rect(-50, -100, 100, 200);
            gfx.fill({ color: 0x00ffcc, alpha: 0.3 });
            gfx.stroke({ color: 0x00ffcc, width: 4 });
            this.gateTexture = this.app.renderer.generateTexture(gfx);
        }
    }

    /**
     * Removes all gate entities (e.g. when returning to the world map).
     */
    public clearLevel(world: World): void {
        this.gatesToSpawn = [];
        this.gatesTotal = 0;
        this.gatesPassedCount = 0;
        const existingGates = world.getEntities(GateComponent.TYPE_ID);
        for (let i = 0; i < existingGates.length; i++) {
            const ge = existingGates[i];
            const spriteComp = world.getComponent<SpriteComponent>(ge, SpriteComponent.TYPE_ID);
            if (spriteComp) {
                this.spritePool.release(spriteComp.sprite);
            }
            world.destroyEntity(ge);
        }
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

    private onGatePassed(): void {
        this.gatesPassedCount++;
        if (this.gatesTotal > 0 && this.gatesPassedCount >= this.gatesTotal) {
            EventBus.getInstance().emit(GameEvents.LEVEL_COMPLETE);
        }
    }

    private spawnGate(world: World, data: LevelGate): void {
        const entity = world.createEntity();
        
        const sprite = this.spritePool.acquire();
        sprite.texture = this.gateTexture!;
        sprite.anchor.set(0.5, 0.5);
        sprite.visible = true;
        this.app.stage.addChild(sprite);

        world.addComponent(entity, new TransformComponent(data.x, data.y));
        world.addComponent(entity, new SpriteComponent(sprite));
        world.addComponent(entity, new GateComponent(data.width));
    }
}
