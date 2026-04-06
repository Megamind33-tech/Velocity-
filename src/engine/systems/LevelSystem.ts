import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { GateComponent } from '../components/GateComponent';
import { GameState } from '../GameState';
import { LevelGenerator, LevelGate } from '../../levels/LevelGenerator';
import { ObjectPool } from '../utils/ObjectPool';
import { Song } from '../../data/songs';
import { LevelDefinition, getZoneForLevel } from '../../data/levelDefinitions';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';
import { Application, Container, Sprite, Graphics, Texture } from 'pixi.js';
import { getPlayerWorldX, getWorldScrollX } from '../../game/worldScroll';
import { setLevelGateTargets, clearGateTargets } from '../../game/gateTargetTelemetry';

/**
 * System that manages the procedural generation and cleanup of level entities.
 * Supports learning-progression levels with per-zone gate colors, completion
 * tracking, gate-pass counting, and star awards.
 */
export class LevelSystem implements System {
    public readonly priority: number = 50;
    private generator: LevelGenerator;
    private gatesToSpawn: LevelGate[] = [];
    /** Gates planned for the current run (before spawning). */
    public lastInitializedGateCount = 0;
    private playerEntity: Entity | null = null;
    private spawnRange: number = 2000;
    private cleanupRange: number = 800;
    private gateTexture: Texture | null = null;
    private currentLevelDef: LevelDefinition | null = null;
    private levelComplete: boolean = false;
    private hintEmitted: boolean = false;
    private gatesPassed: number = 0;
    private totalGates: number = 0;

    private spritePool: ObjectPool<Sprite>;
    /** Gates/pickups parent; defaults to stage if not set (camera layer in main). */
    private worldParent: Container | null = null;

    constructor(private app: Application) {
        this.generator = new LevelGenerator();
        this.spritePool = new ObjectPool<Sprite>(
            () => new Sprite(),
            (s) => {
                s.visible = false;
                s.parent?.removeChild(s);
            }
        );
    }

    /** Parent for spawned level sprites (same layer as player for camera follow). */
    public setWorldParent(container: Container | null): void {
        this.worldParent = container;
    }

    /**
     * Legacy init path — generates from levelId + song only.
     */
    public initLevel(levelId: number, song: Song, player: Entity): void {
        this.playerEntity = player;
        this.currentLevelDef = null;
        this.levelComplete = false;
        this.hintEmitted = false;
        this.gatesPassed = 0;
        const plan = this.generator.generate(levelId, song, this.app.screen.height);
        this.totalGates = plan.length;
        this.lastInitializedGateCount = plan.length;
        this.gatesToSpawn = plan;
        setLevelGateTargets(plan.map((g) => ({ logicalX: g.x, targetMidi: g.targetMidi })));

        if (!this.gateTexture) {
            const gfx = new Graphics();
            gfx.rect(-50, -100, 100, 200);
            gfx.fill({ color: 0x00ffcc, alpha: 0.3 });
            gfx.stroke({ color: 0x00ffcc, width: 4 });
            this.gateTexture = this.app.renderer.generateTexture(gfx);
        }
    }

    public initLevelFromDefinition(def: LevelDefinition, song: Song, player: Entity): void {
        this.playerEntity = player;
        this.currentLevelDef = def;
        this.levelComplete = false;
        this.hintEmitted = false;
        this.gatesPassed = 0;
        const plan = this.generator.generateForDefinition(def, song, this.app.screen.height);
        this.totalGates = plan.length;
        this.lastInitializedGateCount = plan.length;
        this.gatesToSpawn = plan;
        setLevelGateTargets(plan.map((g) => ({ logicalX: g.x, targetMidi: g.targetMidi })));

        const zone = getZoneForLevel(def.id);
        const color = zone?.color ?? 0x00ffcc;
        this.ensureGateTexture(color);
    }

    public getGatesPassed(): number { return this.gatesPassed; }
    public getTotalGates(): number { return this.totalGates; }
    public isLevelComplete(): boolean { return this.levelComplete; }
    public getCurrentLevelDef(): LevelDefinition | null { return this.currentLevelDef; }

    private ensureGateTexture(color: number): void {
        const gfx = new Graphics();
        gfx.rect(-50, -100, 100, 200);
        gfx.fill({ color, alpha: 0.3 });
        gfx.stroke({ color, width: 4 });
        this.gateTexture = this.app.renderer.generateTexture(gfx);
    }

    public update(entities: Entity[], world: World, delta: number): void {
        if (!GameState.runActive || !this.playerEntity) return;

        const playerTransform = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!playerTransform) return;

        const scroll = getWorldScrollX();
        const playerLogical = scroll + getPlayerWorldX();

        this.syncGateScreenPositions(world, scroll);

        while (this.gatesToSpawn.length > 0 && this.gatesToSpawn[0].x < playerLogical + this.spawnRange) {
            const gateData = this.gatesToSpawn.shift()!;
            this.spawnGate(world, gateData);
        }

        // 2. Cleanup & Recycling
        const existingGates = [...world.getEntities(GateComponent.TYPE_ID)];
        for (let i = 0; i < existingGates.length; i++) {
            const gate = existingGates[i];
            const transform = world.getComponent<TransformComponent>(gate, TransformComponent.TYPE_ID);
            const gc = world.getComponent<GateComponent>(gate, GateComponent.TYPE_ID);
            if (transform && gc && gc.logicalX < playerLogical - this.cleanupRange) {
                const gateComp = gc;
                const spriteComp = world.getComponent<SpriteComponent>(gate, SpriteComponent.TYPE_ID);

                if (gateComp && !gateComp.passed) {
                    this.gatesPassed++;
                    gateComp.passed = true;
                    EventBus.getInstance().emit(GameEvents.GATE_PASSED, {
                        gatesPassed: this.gatesPassed,
                        totalGates: this.totalGates,
                    });
                }

                if (spriteComp) {
                    this.spritePool.release(spriteComp.sprite);
                }
                world.destroyEntity(gate);
            }
        }

        if (!this.levelComplete && this.gatesToSpawn.length === 0 && existingGates.length === 0 && this.totalGates > 0) {
            this.levelComplete = true;
            this.emitCompletion();
        }
    }

    private emitCompletion(): void {
        const def = this.currentLevelDef;
        let stars = 0;
        if (def) {
            if (this.gatesPassed >= def.starThresholds.three) stars = 3;
            else if (this.gatesPassed >= def.starThresholds.two) stars = 2;
            else if (this.gatesPassed >= def.starThresholds.one) stars = 1;
        } else {
            stars = this.gatesPassed === this.totalGates ? 3 : this.gatesPassed > 0 ? 1 : 0;
        }

        EventBus.getInstance().emit(GameEvents.LEVEL_COMPLETE, {
            levelId: def?.id ?? 0,
            gatesPassed: this.gatesPassed,
            totalGates: this.totalGates,
            stars,
        });
        EventBus.getInstance().emit(GameEvents.STARS_AWARDED, { stars });
    }

    /** Removes every gate entity and returns sprites to the pool. Call before a new run. */
    public destroyAllGates(world: World): void {
        const gates = [...world.getEntities(GateComponent.TYPE_ID)];
        for (let i = 0; i < gates.length; i++) {
            const gate = gates[i];
            const spriteComp = world.getComponent<SpriteComponent>(gate, SpriteComponent.TYPE_ID);
            if (spriteComp) {
                spriteComp.sprite.scale.set(1, 1);
                this.spritePool.release(spriteComp.sprite);
            }
            world.destroyEntity(gate);
        }
        this.gatesToSpawn = [];
        this.lastInitializedGateCount = 0;
        this.gatesPassed = 0;
        this.totalGates = 0;
        clearGateTargets();
    }

    private syncGateScreenPositions(world: World, scroll: number): void {
        const gates = world.getEntities(GateComponent.TYPE_ID);
        for (let i = 0; i < gates.length; i++) {
            const e = gates[i]!;
            const gc = world.getComponent<GateComponent>(e, GateComponent.TYPE_ID);
            const tr = world.getComponent<TransformComponent>(e, TransformComponent.TYPE_ID);
            if (gc && tr) {
                tr.x = gc.logicalX - scroll;
            }
        }
    }

    private spawnGate(world: World, data: LevelGate): void {
        const entity = world.createEntity();

        const sprite = this.spritePool.acquire();
        sprite.texture = this.gateTexture!;
        sprite.scale.set(data.width / 100, 1);
        sprite.visible = true;
        (this.worldParent ?? this.app.stage).addChild(sprite);

        world.addComponent(entity, new TransformComponent(data.x - getWorldScrollX(), data.y));
        world.addComponent(entity, new SpriteComponent(sprite));
        world.addComponent(entity, new GateComponent(data.width, 200, 10, false, data.x));
    }
}
