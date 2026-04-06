/**
 * OGA "City Parallax pixel art" — Gustavo Saraiva, CC0.
 * @see public/oga-parallax-city/SOURCES.md
 *
 * Zip verified: four 240×135 RGBA PNGs. Order back → front for scrolling.
 */

import { Assets, Texture } from 'pixi.js';

const BASE = `${import.meta.env.BASE_URL}oga-parallax-city`;

/** Matches extracted filenames in `public/oga-parallax-city/` (zip: Background 1, BG, Middle, Foreground). */
export const CITY_PARALLAX_URLS = [
    `${BASE}/layer_background_1.png`,
    `${BASE}/layer_bg.png`,
    `${BASE}/layer_middle.png`,
    `${BASE}/layer_foreground.png`,
] as const;

export const CITY_PARALLAX_NATIVE_HEIGHT = 135;

export function applyNearestFilter(textures: Texture[]): void {
    for (const t of textures) {
        t.source.scaleMode = 'nearest';
    }
}

export async function loadCityParallaxTextures(): Promise<Texture[]> {
    const textures = await Promise.all(CITY_PARALLAX_URLS.map((u) => Assets.load<Texture>(u)));
    applyNearestFilter(textures);
    return textures;
}
