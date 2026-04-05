/**
 * Pixi v8 no longer exports `DisplayObject`; scene graph nodes extend Container / ViewContainer.
 * Use this alias for helpers that accept any renderable node with transform + alpha.
 */
import type { Container } from 'pixi.js';

export type PixiDisplayObject = Container;
