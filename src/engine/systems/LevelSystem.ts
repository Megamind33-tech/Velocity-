import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { GateComponent } from '../components/GateComponent';
import { LevelGenerator, LevelGate } from '../../levels/LevelGenerator';
import { ObjectPool } from '../utils/ObjectPool';
import { Song } from '../../data/songs';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';
import { Sprite, Graphics, Texture } from 'pixi.js';

/**
 * System that manages the procedural generation and cleanup of level entities.
 * Optimized with Object Pooling for mobile performance.
 */
export class LevelSystem implements System {
    public readonly priority: number = 50;
    private generator: LevelGenerator;
    private gatesToSpawn: LevelGate[] = [];
    private playerEntity: Entity | null = null;
    private currentLevelId: number = 1;
    private currentSong: Song | null = null;
    private totalLevels: number = 1;
    private totalGateCount: number = 0;
    private handledGateCount: number = 0;
    private passedGateCount: number = 0;
    private activeGateIds: Set<Entity> = new Set();
    private levelCompleteEmitted: boolean = false;
    private spawnRange: number = 2000;
    private cleanupRange: number = 800;
    private gateTexture: Texture | null = null;
    
    // Object Pool for recycling Gate sprites
    private spritePool: ObjectPool<Sprite>;

    constructor(private app: any) {
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
    public initLevel(levelId: number, song: Song, player: Entity, world: World, totalLevels: number, startX?: number): void {
        this.playerEntity = player;
        this.currentLevelId = levelId;
        this.currentSong = song;
        this.totalLevels = totalLevels;
        this.totalGateCount = song.notes.length;
        this.handledGateCount = 0;
        this.passedGateCount = 0;
        this.levelCompleteEmitted = false;
        this.clearExistingGates(world);

        const playerTransform = world.getComponent<TransformComponent>(player, TransformComponent.TYPE_ID);
        const levelStartX = startX ?? ((playerTransform?.x ?? 0) + 700);

        this.gatesToSpawn = this.generator.generate(levelId, song, this.app.screen.height, levelStartX);
        
        // Pre-create gate texture
        if (!this.gateTexture) {
            const gfx = new Graphics();
            gfx.rect(-50, -100, 100, 200);
            gfx.fill({ color: 0x00ffcc, alpha: 0.3 });
            gfx.stroke({ color: 0x00ffcc, width: 4 });
            this.gateTexture = this.app.renderer.generateTexture(gfx);
        }

        EventBus.getInstance().emit(GameEvents.LEVEL_START, {
            levelId,
            song,
            totalLevels,
            totalGates: this.totalGateCount,
        });
    }

    public update(entities: Entity[], world: World, delta: number): void {
        if (this.playerEntity === null) return;

        const playerTransform = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!playerTransform) return;

        // 1. Spawning
        while (this.gatesToSpawn.length > 0 && this.gatesToSpawn[0].x < playerTransform.x + this.spawnRange) {
            const gateData = this.gatesToSpawn.shift()!;
            this.spawnGate(world, gateData);
        }

        // 2. Handle passed or expired gates
        const existingGates = [...world.getEntities(GateComponent.TYPE_ID)];
        for (let i = 0; i < existingGates.length; i++) {
            const gate = existingGates[i];
            const transform = world.getComponent<TransformComponent>(gate, TransformComponent.TYPE_ID);
            const gateComp = world.getComponent<GateComponent>(gate, GateComponent.TYPE_ID);
            if (!transform || !gateComp) {
                this.destroyGate(world, gate);
                continue;
            }

            if (playerTransform.x >= transform.x) {
                this.handledGateCount++;
                if (Math.abs(playerTransform.y - transform.y) <= gateComp.height / 2) {
                    this.passedGateCount++;
                    EventBus.getInstance().emit(GameEvents.GATE_PASSED, {
                        levelId: this.currentLevelId,
                        song: this.currentSong,
                        passedGates: this.passedGateCount,
                        handledGates: this.handledGateCount,
                        totalGates: this.totalGateCount,
                    });
                }

                this.destroyGate(world, gate);
                continue;
            }

            if (transform.x < playerTransform.x - this.cleanupRange) {
                this.handledGateCount++;
                this.destroyGate(world, gate);
            }
        }

        if (
            !this.levelCompleteEmitted
            && this.totalGateCount > 0
            && this.gatesToSpawn.length === 0
            && this.activeGateIds.size === 0
            && this.handledGateCount >= this.totalGateCount
        ) {
            this.levelCompleteEmitted = true;
            EventBus.getInstance().emit(GameEvents.LEVEL_COMPLETE, {
                levelId: this.currentLevelId,
                song: this.currentSong,
                totalLevels: this.totalLevels,
                passedGates: this.passedGateCount,
                totalGates: this.totalGateCount,
            });
        }
    }

    private spawnGate(world: World, data: LevelGate): void {
        const entity = world.createEntity();
        
        const sprite = this.spritePool.acquire();
        sprite.texture = this.gateTexture!;
        sprite.visible = true;
        sprite.scale.set(data.width / 100, data.height / 200);
        sprite.alpha = this.currentSong?.lessonType === 'harmony_static' ? 0.85 : 1;
        this.app.stage.addChild(sprite);

        world.addComponent(entity, new TransformComponent(data.x, data.y));
        world.addComponent(entity, new SpriteComponent(sprite));
        world.addComponent(entity, new GateComponent(data.width, data.height));
        this.activeGateIds.add(entity);
    }

    private destroyGate(world: World, gate: Entity): void {
        const spriteComp = world.getComponent<SpriteComponent>(gate, SpriteComponent.TYPE_ID);
        if (spriteComp) {
            this.spritePool.release(spriteComp.sprite);
        }
        this.activeGateIds.delete(gate);
        world.destroyEntity(gate);
    }

    private clearExistingGates(world: World): void {
        const existingGates = [...world.getEntities(GateComponent.TYPE_ID)];
        for (let i = 0; i < existingGates.length; i++) {
            this.destroyGate(world, existingGates[i]);
        }
        this.activeGateIds.clear();
    }
}
