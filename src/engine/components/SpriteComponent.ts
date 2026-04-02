import { Component, ComponentRegistry } from '../Component';
import { Sprite } from 'pixi.js';

/**
 * Data-only component for rendering properties.
 * Holds a reference to the PixiJS Sprite.
 */
export class SpriteComponent implements Component {
    public static readonly TYPE_ID = ComponentRegistry.getTypeId('Sprite');
    public readonly _typeId = SpriteComponent.TYPE_ID;

    constructor(
        public sprite: Sprite,
        public anchorX: number = 0.5,
        public anchorY: number = 0.5,
        public tint: number = 0xFFFFFF
    ) {
        this.sprite.anchor.set(anchorX, anchorY);
        this.sprite.tint = tint;
    }
}
