/**
 * Game UI textures — SunGraphica Sci-Fi Game UI (itch.io, credit: SunGraphica).
 * `public/sungraphica-ui/`
 *
 * **Buttons:** Pause-menu exports are full-width chrome (often with baked English words).
 * Code draws our labels on top and applies a small center dimmer so baked text does not
 * fight gameplay copy. **Chips / rows** use neutral `button_plate` only.
 */

import { Assets, Texture } from 'pixi.js';

const BASE = `${import.meta.env.BASE_URL}sungraphica-ui`;

function assetPath(...segments: string[]): string {
    return segments.map((s) => encodeURIComponent(s)).join('/');
}

const SF = ['Sci Fi Game UI FREE'] as const;
const LEVELS = [...SF, 'LEVELS'] as const;
const PAUSE = [...SF, 'PAUSE MENU'] as const;
const ICON1 = ['FREE Icon', 'Icon set 1', '1x'] as const;

export type VelocityUiTextureKey =
    | 'button_primary'
    | 'button_secondary'
    | 'button_accent'
    | 'button_danger'
    /** Neutral plate — stat chips, list rows, inactive chrome (no baked UI words). */
    | 'button_plate'
    | 'panel_frame'
    | 'panel_fill'
    | 'slide_track'
    | 'slide_fill'
    | 'icon_star'
    | 'node_unlocked'
    | 'node_locked'
    | 'menu_best_star'
    | 'menu_sector_circle'
    | 'menu_routes_repeat'
    | 'menu_profile_star_outline'
    | 'menu_status_led'
    | 'menu_radar_center'
    | 'menu_pilot_class_star'
    | 'menu_leaderboard_star'
    | 'menu_achievements_seal'
    | 'menu_icon_square_grey'
    | 'menu_store_icon'
    | 'menu_rewards_star_outline'
    | 'menu_settings_repeat';

const MANIFEST: Record<VelocityUiTextureKey, string> = {
    button_primary: `${BASE}/${assetPath(...PAUSE, 'PAUSE-MENU_0000s_0009_RESUME.png')}`,
    button_secondary: `${BASE}/${assetPath(...PAUSE, 'PAUSE-MENU_0000s_0005_SETTING.png')}`,
    button_accent: `${BASE}/${assetPath(...PAUSE, 'PAUSE-MENU_0000s_0007_RETRY.png')}`,
    button_danger: `${BASE}/${assetPath(...PAUSE, 'PAUSE-MENU_0000s_0003_EXIT.png')}`,
    button_plate: `${BASE}/${assetPath(...LEVELS, 'LEVELS_0000s_0004_Layer-5.png')}`,

    panel_frame: `${BASE}/${assetPath(...LEVELS, 'LEVELS_0000s_0001_Layer-8.png')}`,
    panel_fill: `${BASE}/${assetPath(...LEVELS, 'LEVELS_0000s_0018_Layer-1.png')}`,

    slide_track: `${BASE}/${assetPath(...LEVELS, 'LEVELS_0000s_0007_Layer-3.png')}`,
    slide_fill: `${BASE}/${assetPath(...LEVELS, 'LEVELS_0000s_0009_Layer-2.png')}`,

    icon_star: `${BASE}/${assetPath(...ICON1, 'Asset 10.png')}`,
    node_unlocked: `${BASE}/${assetPath(...ICON1, 'Asset 24.png')}`,
    node_locked: `${BASE}/${assetPath(...ICON1, 'Asset 33.png')}`,

    menu_best_star: `${BASE}/${assetPath(...ICON1, 'Asset 10.png')}`,
    menu_sector_circle: `${BASE}/${assetPath(...ICON1, 'Asset 24.png')}`,
    menu_routes_repeat: `${BASE}/${assetPath(...ICON1, 'Asset 2.png')}`,
    menu_profile_star_outline: `${BASE}/${assetPath(...ICON1, 'Asset 1.png')}`,
    menu_status_led: `${BASE}/${assetPath(...ICON1, 'Asset 16.png')}`,
    menu_radar_center: `${BASE}/${assetPath(...ICON1, 'Asset 24.png')}`,
    menu_pilot_class_star: `${BASE}/${assetPath(...ICON1, 'Asset 10.png')}`,
    menu_leaderboard_star: `${BASE}/${assetPath(...ICON1, 'Asset 10.png')}`,
    menu_achievements_seal: `${BASE}/${assetPath(...ICON1, 'Asset 40.png')}`,
    menu_icon_square_grey: `${BASE}/${assetPath(...ICON1, 'Asset 3.png')}`,
    menu_store_icon: `${BASE}/${assetPath(...ICON1, 'Asset 21.png')}`,
    menu_rewards_star_outline: `${BASE}/${assetPath(...ICON1, 'Asset 10.png')}`,
    menu_settings_repeat: `${BASE}/${assetPath(...ICON1, 'Asset 35.png')}`,
};

const cache = new Map<VelocityUiTextureKey, Texture>();
let preloadPromise: Promise<void> | null = null;

export async function preloadVelocityUiTextures(): Promise<void> {
    if (preloadPromise) return preloadPromise;
    preloadPromise = (async () => {
        const keys = Object.keys(MANIFEST) as VelocityUiTextureKey[];
        const results = await Promise.allSettled(
            keys.map(async (key) => {
                const tex = await Assets.load<Texture>(MANIFEST[key]);
                cache.set(key, tex);
            }),
        );
        results.forEach((r, i) => {
            if (r.status === 'rejected') {
                console.warn('[velocityUiArt] failed to load', keys[i], MANIFEST[keys[i]], r.reason);
            }
        });
    })();
    return preloadPromise;
}

export function getVelocityUiTexture(key: VelocityUiTextureKey): Texture | undefined {
    return cache.get(key);
}

export function velocityUiArtReady(): boolean {
    const keys = Object.keys(MANIFEST) as VelocityUiTextureKey[];
    return keys.every((k) => cache.has(k));
}

export function velocityUiCoreReady(): boolean {
    const core: VelocityUiTextureKey[] = [
        'button_primary',
        'button_secondary',
        'button_plate',
        'panel_frame',
        'panel_fill',
    ];
    return core.every((k) => cache.has(k));
}
