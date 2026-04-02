import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { GateComponent } from '../components/GateComponent';
import { LevelGenerator, LevelGate } from '../../levels/LevelGenerator';
import { Song } from '../../data/songs';
import { Sprite, Graphics, Texture } from 'pixi.js';

/**
 * System that manages the procedural generation and cleanup of level entities.
 */
export class LevelSystem implements System {
    public readonly priority: number = 50;
    private generator: LevelGenerator;
    private gatesToSpawn: LevelGate[] = [];
    private playerEntity: Entity | null = null;
    private spawnRange: number = 2000;
    private cleanupRange: number = 800;
    private gateTexture: Texture | null = null;

    constructor(private app: any) {
        this.generator = new LevelGenerator();
    }

    /**
     * Initializes a level by pre-generating gate coordinates.
     */
    public initLevel(levelId: number, song: Song, player: Entity): void {
        this.playerEntity = player;
        this.gatesToSpawn = this.generator.generate(levelId, song, this.app.screen.height);
        
        // Pre-create gate texture
        const gfx = new Graphics();
        gfx.rect(-50, -100, 100, 200);
        gfx.fill({ color: 0x00ffcc, alpha: 0.3 });
        gfx.stroke({ color: 0x00ffcc, width: 4 });
        this.gateTexture = this.app.renderer.generateTexture(gfx);
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

        // 2. Cleanup
        const existingGates = world.getEntities(GateComponent.TYPE_ID);
        for (let i = 0; i < existingGates.length; i++) {
            const gate = existingGates[i];
            const transform = world.getComponent<TransformComponent>(gate, TransformComponent.TYPE_ID);
            if (transform && transform.x < playerTransform.x - this.cleanupRange) {
                // In a real system, we'd recycle the sprite here
                const spriteComp = world.getComponent<SpriteComponent>(gate, SpriteComponent.TYPE_ID);
                if (spriteComp) {
                    spriteComp.sprite.destroy();
                }
                world.destroyEntity(gate);
            }
        }
    }

    private spawnGate(world: World, data: LevelGate): void {
        const entity = world.createEntity();
        const sprite = new Sprite(this.gateTexture!);
        this.app.stage.addChild(sprite);

        world.addComponent(entity, new TransformComponent(data.x, data.y));
        world.addComponent(entity, new SpriteComponent(sprite));
        world.addComponent(entity, new GateComponent(data.width));
    }
}
