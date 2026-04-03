/**
 * Kenney UI Pack — https://kenney.nl/assets/ui-pack (CC0)
 * Paths under `public/kenney-ui-pack/PNG`. `preloadVelocityUiTextures()` runs at boot.
 */

import { Assets, Texture } from 'pixi.js';

const BASE = `${import.meta.env.BASE_URL}kenney-ui-pack/PNG`;

export type VelocityUiTextureKey =
    | 'button_primary'
    | 'button_secondary'
    | 'button_accent'
    | 'button_danger'
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
    | 'menu_settings_repeat'
    /** Dock — distinct Kenney glyphs per slot */
    | 'icon_nav_home'
    | 'menu_nav_map';

const MANIFEST: Record<VelocityUiTextureKey, string> = {
    button_primary: `${BASE}/Blue/Default/button_rectangle_depth_gloss.png`,
    button_secondary: `${BASE}/Grey/Default/button_rectangle_depth_flat.png`,
    button_accent: `${BASE}/Yellow/Default/button_rectangle_depth_gloss.png`,
    button_danger: `${BASE}/Red/Default/button_rectangle_depth_gloss.png`,
    panel_frame: `${BASE}/Extra/Default/input_outline_rectangle.png`,
    panel_fill: `${BASE}/Extra/Default/input_rectangle.png`,
    slide_track: `${BASE}/Blue/Default/slide_horizontal_grey_section_wide.png`,
    slide_fill: `${BASE}/Blue/Default/slide_horizontal_color_section_wide.png`,
    icon_star: `${BASE}/Blue/Default/star.png`,
    node_unlocked: `${BASE}/Blue/Default/button_round_depth_gloss.png`,
    node_locked: `${BASE}/Grey/Default/button_round_depth_flat.png`,

    menu_best_star: `${BASE}/Yellow/Default/star.png`,
    menu_sector_circle: `${BASE}/Blue/Default/icon_outline_circle.png`,
    menu_routes_repeat: `${BASE}/Extra/Default/icon_repeat_outline.png`,
    menu_profile_star_outline: `${BASE}/Yellow/Default/star_outline_depth.png`,
    menu_status_led: `${BASE}/Green/Default/icon_circle.png`,
    menu_radar_center: `${BASE}/Yellow/Default/star.png`,
    menu_pilot_class_star: `${BASE}/Yellow/Default/star_outline.png`,
    menu_leaderboard_star: `${BASE}/Yellow/Default/star.png`,
    menu_achievements_seal: `${BASE}/Blue/Default/star_outline_depth.png`,
    menu_icon_square_grey: `${BASE}/Grey/Default/icon_square.png`,
    menu_store_icon: `${BASE}/Yellow/Default/icon_square.png`,
    menu_rewards_star_outline: `${BASE}/Yellow/Default/star_outline_depth.png`,
    menu_settings_repeat: `${BASE}/Extra/Default/icon_repeat_dark.png`,

    icon_nav_home: `${BASE}/Blue/Default/icon_square.png`,
    menu_nav_map: `${BASE}/Blue/Default/icon_outline_square.png`,
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
            }),
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

export function velocityUiCoreReady(): boolean {
    const core: VelocityUiTextureKey[] = [
        'button_primary',
        'button_secondary',
        'panel_frame',
        'panel_fill',
    ];
    return core.every((k) => cache.has(k));
}
