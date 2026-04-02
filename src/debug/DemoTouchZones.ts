import { Container, Graphics } from 'pixi.js';
import { DemoTouchFlight } from './DemoTouchFlight';

/**
 * Invisible left/right strips for DEV vertical steering. Remove this container from the stage when demo is retired.
 */
export function createDemoTouchZones(width: number, height: number): Container | null {
    if (!import.meta.env.DEV) return null;

    const root = new Container();
    const w = width * 0.18;

    const left = new Graphics();
    left.rect(0, 0, w, height);
    left.fill({ color: 0x00ffcc, alpha: 0.06 });
    left.eventMode = 'static';
    left.cursor = 'pointer';
    left.on('pointerdown', (e) => {
        e.stopPropagation();
        DemoTouchFlight.onPointerDown(0, 0, width, height);
    });
    left.on('pointerup', () => DemoTouchFlight.onPointerUp());
    left.on('pointerupoutside', () => DemoTouchFlight.onPointerUp());

    const right = new Graphics();
    right.rect(width - w, 0, w, height);
    right.fill({ color: 0xff6600, alpha: 0.06 });
    right.eventMode = 'static';
    right.cursor = 'pointer';
    right.on('pointerdown', (e) => {
        e.stopPropagation();
        DemoTouchFlight.onPointerDown(width - 1, 0, width, height);
    });
    right.on('pointerup', () => DemoTouchFlight.onPointerUp());
    right.on('pointerupoutside', () => DemoTouchFlight.onPointerUp());

    root.addChild(left, right);
    return root;
}
