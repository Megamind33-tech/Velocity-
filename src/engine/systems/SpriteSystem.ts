import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { SpriteComponent } from '../components/SpriteComponent';

/**
 * System that synchronizes PixiJS Sprites with Transform components.
 * Runs during the render phase with interpolation.
 */
export class SpriteSystem implements System {
    public readonly priority: number = 100; // Run late in the frame
    private readonly queryMask: number;

    constructor() {
        this.queryMask = TransformComponent.TYPE_ID | SpriteComponent.TYPE_ID;
    }

    public render(entities: Entity[], world: World, interpolation: number): void {
        const matchingEntities = world.getEntities(this.queryMask);

        for (let i = 0; i < matchingEntities.length; i++) {
            const entity = matchingEntities[i];
            const transform = world.getComponent<TransformComponent>(entity, TransformComponent.TYPE_ID)!;
            const spriteComp = world.getComponent<SpriteComponent>(entity, SpriteComponent.TYPE_ID)!;

            // Basic sync - in a more advanced loop, we'd use interpolation for sub-frame smoothness
            spriteComp.sprite.x = transform.x;
            spriteComp.sprite.y = transform.y;
            spriteComp.sprite.rotation = transform.rotation;
            spriteComp.sprite.scale.set(transform.scaleX, transform.scaleY);
        }
    }
}
