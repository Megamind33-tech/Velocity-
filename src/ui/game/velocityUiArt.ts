/**
 * Velocity UI art: Kenney CC0 packs in /public (raster + Vector sources).
 * Game renders with Pixi textures / NineSliceSprite — not a DOM webapp UI.
 */

import { Assets, Texture } from 'pixi.js';

const BASE_ADV = `${import.meta.env.BASE_URL}kenney-ui-pack-adventure/PNG/Default/`;

export type VelocityUiTextureKey =
    | 'panel_blue'
    | 'button_grey'
    | 'button_red'
    | 'progress_blue';

const MANIFEST: Record<VelocityUiTextureKey, string> = {
    panel_blue: `${BASE_ADV}panel_grey_bolts_blue.png`,
    button_grey: `${BASE_ADV}button_grey.png`,
    button_red: `${BASE_ADV}button_red.png`,
    progress_blue: `${BASE_ADV}progress_blue_small_border.png`,
};

const cache = new Map<VelocityUiTextureKey, Texture>();
let preloadPromise: Promise<void> | null = null;

/**
 * Load shared UI textures once (call from main before showing menus).
 */
export async function preloadVelocityUiTextures(): Promise<void> {
    if (preloadPromise) return preloadPromise;
    preloadPromise = (async () => {
        const keys = Object.keys(MANIFEST) as VelocityUiTextureKey[];
        await Promise.all(
            keys.map(async (key) => {
                const url = MANIFEST[key];
                const tex = await Assets.load<Texture>(url);
                cache.set(key, tex);
            })
        );
    })();
    return preloadPromise;
}

export function getVelocityUiTexture(key: VelocityUiTextureKey): Texture | undefined {
    return cache.get(key);
}

export function velocityUiArtReady(): boolean {
    return cache.size >= Object.keys(MANIFEST).length;
}
