import { Entity, World, System } from '../World';
import { TransformComponent } from '../components/TransformComponent';
import { GateComponent } from '../components/GateComponent';
import { GateDrawComponent } from '../components/GateDrawComponent';
import { GameState } from '../GameState';

const RING_COLOR = 0x00e5d8;
const PILLAR_COLOR = 0x8b5cf6;

/**
 * Renders pitch/volume gates as top/bottom bars with a vertical gap.
 */
export class GateDrawSyncSystem implements System {
    public readonly priority = 99;
    private readonly mask =
        TransformComponent.TYPE_ID | GateComponent.TYPE_ID | GateDrawComponent.TYPE_ID;

    public render(_entities: Entity[], world: World, _interp: number): void {
        if (!GameState.runActive) return;

        const list = world.getEntities(this.mask);
        for (let i = 0; i < list.length; i++) {
            const e = list[i];
            const t = world.getComponent<TransformComponent>(e, TransformComponent.TYPE_ID)!;
            const g = world.getComponent<GateComponent>(e, GateComponent.TYPE_ID)!;
            const gd = world.getComponent<GateDrawComponent>(e, GateDrawComponent.TYPE_ID)!;
            const gfx = gd.graphics;
            gfx.clear();
            gfx.position.set(t.x, t.y);

            const halfW = Math.max(40, g.width * 0.5);
            const gap = Math.max(24, g.gapEffectivePx);
            const cy = g.gapCenterY - t.y;
            const topOpen = cy - gap / 2;
            const botOpen = cy + gap / 2;
            const worldTop = -3000;
            const worldBot = 3000;
            const topH = Math.max(0, topOpen - worldTop);
            const botH = Math.max(0, worldBot - botOpen);
            const fillA = g.kind === 'volume' ? 0.35 : 0.42;
            const strokeC = g.kind === 'volume' ? PILLAR_COLOR : RING_COLOR;

            if (topH > 2) {
                gfx.rect(-halfW, worldTop, halfW * 2, topH).fill({ color: strokeC, alpha: fillA });
                gfx.rect(-halfW, worldTop, halfW * 2, topH).stroke({ color: strokeC, width: 3, alpha: 0.9 });
            }
            if (botH > 2) {
                gfx.rect(-halfW, botOpen, halfW * 2, botH).fill({ color: strokeC, alpha: fillA });
                gfx.rect(-halfW, botOpen, halfW * 2, botH).stroke({ color: strokeC, width: 3, alpha: 0.9 });
            }
        }
    }
}
