import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { CollectibleComponent } from '../components/CollectibleComponent';
import { PlayerFlightComponent } from '../components/PlayerFlightComponent';
import { GameState } from '../GameState';
import { EventBus } from '../../events/EventBus';
import { GameEvents } from '../../events/GameEvents';
import type { LevelSystem } from './LevelSystem';

const PICKUP_R = 36;

export class CollectiblePickupSystem implements System {
    public readonly priority = 23;
    private playerEntity: Entity | null = null;
    private readonly mask = CollectibleComponent.TYPE_ID | TransformComponent.TYPE_ID;

    constructor(private readonly levels: LevelSystem) {}

    public configure(player: Entity): void {
        this.playerEntity = player;
    }

    public clear(): void {
        this.playerEntity = null;
    }

    public update(_entities: Entity[], world: World, _delta: number): void {
        if (!GameState.runActive || GameState.paused || !this.playerEntity) return;

        const pt = world.getComponent<TransformComponent>(this.playerEntity, TransformComponent.TYPE_ID);
        if (!pt || !world.getComponent(this.playerEntity, PlayerFlightComponent.TYPE_ID)) return;

        const list = world.getEntities(this.mask);
        for (let i = 0; i < list.length; i++) {
            const e = list[i];
            const cc = world.getComponent<CollectibleComponent>(e, CollectibleComponent.TYPE_ID);
            const tr = world.getComponent<TransformComponent>(e, TransformComponent.TYPE_ID);
            if (!cc || !tr || cc.collected) continue;

            const d2 = (tr.x - pt.x) ** 2 + (tr.y - pt.y) ** 2;
            if (d2 < PICKUP_R * PICKUP_R) {
                cc.collected = true;
                EventBus.getInstance().emit(GameEvents.COLLECTIBLE_PICKUP, { kind: cc.kind });
                const sp = world.getComponent<SpriteComponent>(e, SpriteComponent.TYPE_ID);
                if (sp) {
                    sp.sprite.parent?.removeChild(sp.sprite);
                    this.levels.releasePooledSprite(sp.sprite);
                }
                world.destroyEntity(e);
            }
        }
    }
}
