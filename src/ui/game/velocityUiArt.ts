/**
 * Kenney UI Pack — https://kenney.nl/assets/ui-pack (CC0)
 * Paths under `public/kenney-ui-pack/PNG`. `preloadVelocityUiTextures()` runs at boot.
 *
 * Command-dock glyphs use additional Kenney CC0 packs shipped under `public/kenney-dock-icons/`:
 * - Game Icons (home, target, cart): https://kenney.nl/assets/game-icons
 * - Hangar plane: cropped from Tappy Plane spritesheet — https://kenney.nl/assets/tappy-plane
 */

import { Assets, Texture } from 'pixi.js';

const BASE = `${import.meta.env.BASE_URL}kenney-ui-pack/PNG`;
const DOCK_ICONS = `${import.meta.env.BASE_URL}kenney-dock-icons`;

export type VelocityUiTextureKey =
    | 'button_primary'
    | 'button_secondary'
    | 'button_accent'
    | 'button_danger'
    | 'button_square_primary'
    | 'button_square_secondary'
    | 'panel_frame'
    | 'panel_fill'
    | 'slide_track'
    | 'slide_fill'
    | 'icon_star'
    | 'icon_star_outline'
    | 'icon_play_light'
    | 'icon_play_dark'
    | 'icon_checkmark'
    | 'icon_cross'
    | 'icon_checkmark_outline'
    | 'icon_arrow_e'
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
    | 'dock_nav_home'
    | 'dock_nav_missions'
    | 'dock_nav_hangar'
    | 'dock_nav_store';

const MANIFEST: Record<VelocityUiTextureKey, string> = {
    // ── Buttons (rectangle — nine-slice) ───────────────────────────────────────
    button_primary:   `${BASE}/Blue/Default/button_rectangle_depth_gloss.png`,
    button_secondary: `${BASE}/Grey/Default/button_rectangle_depth_flat.png`,
    button_accent:    `${BASE}/Yellow/Default/button_rectangle_depth_gloss.png`,
    button_danger:    `${BASE}/Red/Default/button_rectangle_depth_gloss.png`,
    // Square variants — used for compact icon-only buttons (pause, back, etc.)
    button_square_primary:   `${BASE}/Blue/Default/button_square_depth_gloss.png`,
    button_square_secondary: `${BASE}/Grey/Default/button_square_depth_flat.png`,

    // ── Panels ────────────────────────────────────────────────────────────────
    panel_frame: `${BASE}/Extra/Default/input_outline_rectangle.png`,
    panel_fill:  `${BASE}/Extra/Default/input_rectangle.png`,

    // ── Progress bars ─────────────────────────────────────────────────────────
    slide_track: `${BASE}/Blue/Default/slide_horizontal_grey_section_wide.png`,
    slide_fill:  `${BASE}/Blue/Default/slide_horizontal_color_section_wide.png`,

    // ── Icons — Kenney UI Pack ─────────────────────────────────────────────────
    icon_star:             `${BASE}/Yellow/Default/star.png`,
    icon_star_outline:     `${BASE}/Yellow/Default/star_outline.png`,
    icon_play_light:       `${BASE}/Extra/Default/icon_play_light.png`,
    icon_play_dark:        `${BASE}/Extra/Default/icon_play_dark.png`,
    icon_checkmark:        `${BASE}/Blue/Default/icon_checkmark.png`,
    icon_cross:            `${BASE}/Blue/Default/icon_cross.png`,
    icon_checkmark_outline:`${BASE}/Blue/Default/icon_outline_checkmark.png`,
    icon_arrow_e:          `${BASE}/Blue/Default/arrow_basic_e.png`,

    // ── Route / world map nodes ───────────────────────────────────────────────
    node_unlocked: `${BASE}/Blue/Default/button_round_depth_gloss.png`,
    node_locked:   `${BASE}/Grey/Default/button_round_depth_flat.png`,

    // ── Menu-specific icons ───────────────────────────────────────────────────
    menu_best_star:            `${BASE}/Yellow/Default/star.png`,
    menu_sector_circle:        `${BASE}/Blue/Default/icon_outline_circle.png`,
    menu_routes_repeat:        `${BASE}/Extra/Default/icon_repeat_outline.png`,
    menu_profile_star_outline: `${BASE}/Yellow/Default/star_outline_depth.png`,
    menu_status_led:           `${BASE}/Green/Default/icon_circle.png`,
    menu_radar_center:         `${BASE}/Yellow/Default/star.png`,
    menu_pilot_class_star:     `${BASE}/Yellow/Default/star_outline.png`,
    menu_leaderboard_star:     `${BASE}/Yellow/Default/star.png`,
    menu_achievements_seal:    `${BASE}/Blue/Default/star_outline_depth.png`,
    menu_icon_square_grey:     `${BASE}/Grey/Default/icon_square.png`,
    menu_store_icon:           `${BASE}/Yellow/Default/icon_square.png`,
    menu_rewards_star_outline: `${BASE}/Yellow/Default/star_outline_depth.png`,
    menu_settings_repeat:      `${BASE}/Extra/Default/icon_repeat_dark.png`,
    /** Command dock — Kenney Game Icons + Tappy Plane (see file header). */
    dock_nav_home:     `${DOCK_ICONS}/home.png`,
    dock_nav_missions: `${DOCK_ICONS}/target.png`,
    dock_nav_hangar:   `${DOCK_ICONS}/hangar_plane.png`,
    dock_nav_store:    `${DOCK_ICONS}/cart.png`,
};

export type VelocityCustomTextureKey =
    | 'rank_prestige'
    | 'rank_elite'
    | 'frame_premium'
    | 'frame_locked'
    | 'badge_locked'
    | 'badge_reward';

/**
 * Optional custom art slots (external packs):
 * - game-rank-icons-vol-9
 * - game-rank-icons-vol-3
 * - ui-game-elements-vol-9
 * - ui-game-frames-vol-8
 *
 * These are intentionally optional: if files are absent, UI falls back to Kenney/vector.
 */
const CUSTOM_BASE = `${import.meta.env.BASE_URL}custom-ui`;
const CUSTOM_MANIFEST: Record<VelocityCustomTextureKey, string> = {
    rank_prestige: `${CUSTOM_BASE}/rank/rank_prestige.png`,
    rank_elite: `${CUSTOM_BASE}/rank/rank_elite.png`,
    frame_premium: `${CUSTOM_BASE}/frames/frame_premium.png`,
    frame_locked: `${CUSTOM_BASE}/frames/frame_locked.png`,
    badge_locked: `${CUSTOM_BASE}/badges/badge_locked.png`,
    badge_reward: `${CUSTOM_BASE}/badges/badge_reward.png`,
};

const cache = new Map<VelocityUiTextureKey, Texture>();
const customCache = new Map<VelocityCustomTextureKey, Texture>();
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
        const customKeys = Object.keys(CUSTOM_MANIFEST) as VelocityCustomTextureKey[];
        await Promise.all(
            customKeys.map(async (key) => {
                try {
                    const tex = await Assets.load<Texture>(CUSTOM_MANIFEST[key]);
                    customCache.set(key, tex);
                } catch {
                    // Optional external art: keep fallback path active.
                }
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

export function getVelocityCustomTexture(key: VelocityCustomTextureKey): Texture | undefined {
    return customCache.get(key);
}

export function velocityCustomArtReady(): boolean {
    return customCache.size > 0;
}

/** Convenience helper: get icon_star texture (yellow filled star). */
export function getStarFilledTex() { return cache.get('icon_star'); }
/** Convenience helper: get icon_star_outline texture (yellow outline star). */
export function getStarOutlineTex() { return cache.get('icon_star_outline'); }
/** Convenience helper: get play icon (light variant — for dark buttons). */
export function getPlayIconTex() { return cache.get('icon_play_light'); }
