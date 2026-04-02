/**
 * Velocity UI art — modern “stage / rhythm” direction:
 * - Kenney UI Pack: Sci-Fi (glass, neon trims, CC0) for buttons & bars
 * - Kenney UI Pack: Adventure (panel_grey_blue) for framed windows — reads electronic, not parchment
 *
 * Vector sources live in each pack’s Vector/ folder for custom recolor in Figma/Inkscape.
 */

import { Assets, Texture } from 'pixi.js';

const BASE_SF = `${import.meta.env.BASE_URL}kenney-ui-pack-sci-fi/PNG`;
const BASE_ADV = `${import.meta.env.BASE_URL}kenney-ui-pack-adventure/PNG/Default/`;

/** Sci-fi header button (192×64) — large rectangle, one style per color. */
const SF_BTN = 'button_square_header_large_rectangle.png';

export type VelocityUiTextureKey =
    | 'panel_blue'
    | 'button_sf_primary'
    | 'button_sf_neutral'
    | 'button_sf_accent'
    | 'button_sf_danger'
    | 'bar_gloss_mid';

const MANIFEST: Record<VelocityUiTextureKey, string> = {
    panel_blue: `${BASE_ADV}panel_grey_bolts_blue.png`,
    button_sf_primary: `${BASE_SF}/Blue/Default/${SF_BTN}`,
    button_sf_neutral: `${BASE_SF}/Grey/Default/${SF_BTN}`,
    button_sf_accent: `${BASE_SF}/Yellow/Default/${SF_BTN}`,
    button_sf_danger: `${BASE_SF}/Red/Default/${SF_BTN}`,
    bar_gloss_mid: `${BASE_SF}/Blue/Default/bar_square_gloss_small_m.png`,
};

const cache = new Map<VelocityUiTextureKey, Texture>();
let preloadPromise: Promise<void> | null = null;

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
