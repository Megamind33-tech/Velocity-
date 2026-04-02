import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { RENDERING } from '../../data/constants';

/**
 * Professional Rendering System with Lerp-based visual smoothing.
 */
export class RenderSystem implements System {
    public readonly priority: number = 1000;
    private readonly queryMask: number;

    constructor() {
        this.queryMask = TransformComponent.TYPE_ID | SpriteComponent.TYPE_ID;
    }

    public render(entities: Entity[], world: World, interpolation: number): void {
        const matchingEntities = world.getEntities(this.queryMask);
        const alpha = RENDERING.LERP_ALPHA;

        for (let i = 0; i < matchingEntities.length; i++) {
            const entity = matchingEntities[i];
            const transform = world.getComponent<TransformComponent>(entity, TransformComponent.TYPE_ID)!;
            const spriteComp = world.getComponent<SpriteComponent>(entity, SpriteComponent.TYPE_ID)!;
            const sprite = spriteComp.sprite;

            // Smoothly Lerp visual position to physics position
            sprite.x += (transform.x - sprite.x) * alpha;
            sprite.y += (transform.y - sprite.y) * alpha;

            // Smoothly Lerp rotation
            const deltaRot = transform.rotation - sprite.rotation;
            sprite.rotation += deltaRot * alpha;

            // Sync other properties
            sprite.scale.set(transform.scaleX, transform.scaleY);
        }
    }
}
