/**
 * Player ship visuals — OpenGameArt 2D assets under public/oga-players/
 * @see public/oga-players/SOURCES.md
 */

import { Assets, Sprite, Texture } from 'pixi.js';
import { getSelectedPlaneId } from '../data/localProgress';

const BASE = `${import.meta.env.BASE_URL}oga-players`;

/** Bump when regenerating `public/oga-players` so cached textures reload. */
const PLANE_TEX_QUERY = '?v=inrun-1p2-sky';

/** Hangar plane id → static texture URL */
export const PLAYER_PLANE_TEXTURE_URL: Record<string, string> = {
    cadet: `${BASE}/plane_cadet.png${PLANE_TEX_QUERY}`,
    cartoon: `${BASE}/plane_cartoon.png${PLANE_TEX_QUERY}`,
    scout: `${BASE}/plane_scout.png${PLANE_TEX_QUERY}`,
    liner: `${BASE}/plane_liner.png${PLANE_TEX_QUERY}`,
    interceptor: `${BASE}/plane_interceptor_jet.png${PLANE_TEX_QUERY}`,
};

const DEFAULT_ID = 'cadet';

/** Target on-screen height (px) for the player sprite (longest side), before width scaling. */
const PLAYER_TARGET_HEIGHT = 56;
/** Gameplay scale vs hangar preview — 1.2 = 20% larger in-run. */
export const PLAYER_IN_GAME_SCALE = 1.2;

let preloadDone = false;

export async function preloadPlayerPlaneTextures(): Promise<void> {
    if (preloadDone) return;
    const urls = [...new Set(Object.values(PLAYER_PLANE_TEXTURE_URL))];
    await Promise.all(urls.map((u) => Assets.load<Texture>(u)));
    preloadDone = true;
}

export function getPlayerPlaneTextureUrl(planeId?: string): string {
    const id = planeId ?? getSelectedPlaneId();
    return PLAYER_PLANE_TEXTURE_URL[id] ?? PLAYER_PLANE_TEXTURE_URL[DEFAULT_ID]!;
}

/**
 * Apply plane art to the gameplay sprite.
 * All OGA player textures are top-down (nose-up); the caller is responsible for
 * applying a Math.PI/2 visualRotationOffset on the SpriteComponent so the nose
 * faces right during left-to-right flight.
 *
 * Returns the uniform scale that was applied so callers can sync TransformComponent.
 */
export function applyPlayerPlaneVisual(sprite: Sprite, planeId?: string): number {
    const url = getPlayerPlaneTextureUrl(planeId);
    const tex = Texture.from(url);
    // Use the longer dimension as reference so the sprite fits within PLAYER_TARGET_HEIGHT
    // regardless of aspect ratio.
    const longestSide = Math.max(tex.width, tex.height) || 1;
    const scale = (PLAYER_TARGET_HEIGHT / longestSide) * PLAYER_IN_GAME_SCALE;
    sprite.texture = tex;
    sprite.anchor.set(0.5);
    sprite.scale.set(scale);
    return scale;
}

/**
 * Texture for hangar row preview (small icon).
 */
export function getPlayerPlaneTexture(planeId: string): Texture {
    const url = PLAYER_PLANE_TEXTURE_URL[planeId] ?? PLAYER_PLANE_TEXTURE_URL[DEFAULT_ID]!;
    return Texture.from(url);
}
