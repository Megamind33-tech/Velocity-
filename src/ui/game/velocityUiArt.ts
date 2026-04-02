/**
 * Kenney UI Pack only — https://kenney.nl/assets/ui-pack (CC0)
 * Paths: PNG/{Blue,Grey,Yellow,Red}/Default + PNG/Extra/Default
 */

import { Assets, Texture } from 'pixi.js';

const BASE = `${import.meta.env.BASE_URL}kenney-ui-pack/PNG`;

export type VelocityUiTextureKey =
    | 'button_primary'
    | 'button_secondary'
    | 'button_accent'
    | 'button_danger'
    | 'panel_frame';

const MANIFEST: Record<VelocityUiTextureKey, string> = {
    button_primary: `${BASE}/Blue/Default/button_rectangle_depth_gloss.png`,
    button_secondary: `${BASE}/Grey/Default/button_rectangle_depth_flat.png`,
    button_accent: `${BASE}/Yellow/Default/button_rectangle_depth_gloss.png`,
    button_danger: `${BASE}/Red/Default/button_rectangle_depth_gloss.png`,
    panel_frame: `${BASE}/Extra/Default/input_outline_rectangle.png`,
};

const cache = new Map<VelocityUiTextureKey, Texture>();
let preloadPromise: Promise<void> | null = null;

export async function preloadVelocityUiTextures(): Promise<void> {
    if (preloadPromise) return preloadPromise;
    preloadPromise = (async () => {
        const keys = Object.keys(MANIFEST) as VelocityUiTextureKey[];
        await Promise.all(
            keys.map(async (key) => {
                const tex = await Assets.load<Texture>(MANIFEST[key]);
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
