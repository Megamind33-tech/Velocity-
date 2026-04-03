/**
 * Front menu slot icons — Kenney UI Pack sprites when preloaded; vector fallbacks only if textures missing.
 * Family A: cool/system tints. Family B: warm gold / yellow variants.
 */

import { Container, Graphics, Sprite } from 'pixi.js';
import { GAME_COLORS } from './GameUITheme';
import { getVelocityUiTexture, velocityUiArtReady, type VelocityUiTextureKey } from './velocityUiArt';

const STROKE_A = 1.05;
const STROKE_B = 1.35;
const ALPHA_A  = 0.82;
const ALPHA_B  = 0.88;

function box(size: number): { cx: number; cy: number; s: number } {
    return { cx: size / 2, cy: size / 2, s: size };
}

/** Fit Kenney sprite in box; returns true if mounted. */
function mountKenney(
    root: Container,
    boxW: number,
    boxH: number,
    key: VelocityUiTextureKey,
    opts?: { tint?: number; alpha?: number; pad?: number; glowColor?: number; glowAlpha?: number },
): boolean {
    if (!velocityUiArtReady()) return false;
    const tex = getVelocityUiTexture(key);
    if (!tex) return false;
    const pad = opts?.pad ?? 4;
    if (opts?.glowColor !== undefined) {
        const gl = new Graphics();
        const rr = Math.min(boxW, boxH) * 0.42;
        gl.circle(boxW / 2, boxH / 2, rr);
        gl.fill({ color: opts.glowColor, alpha: opts.glowAlpha ?? 0.12 });
        root.addChild(gl);
    }
    const spr = new Sprite(tex);
    spr.anchor.set(0.5);
    const max = Math.min(boxW, boxH) - pad * 2;
    const sc  = Math.min(max / spr.texture.width, max / spr.texture.height);
    spr.scale.set(sc);
    spr.position.set(boxW / 2, boxH / 2);
    if (opts?.tint !== undefined) spr.tint = opts.tint;
    spr.alpha = opts?.alpha ?? 0.94;
    root.addChild(spr);
    return true;
}

// ─── Vector fallbacks (only when assets not loaded) ─────────────────────────

function vecHudBest(size: number, strokeColor: number): Graphics {
    const { cx, cy, s } = box(size);
    const w  = s * 0.38;
    const g  = new Graphics();
    g.moveTo(cx - w * 0.45, cy + s * 0.12);
    g.quadraticCurveTo(cx - w * 0.5, cy + s * 0.28, cx, cy + s * 0.30);
    g.quadraticCurveTo(cx + w * 0.5, cy + s * 0.28, cx + w * 0.45, cy + s * 0.12);
    g.lineTo(cx + w * 0.35, cy - s * 0.08);
    g.lineTo(cx - w * 0.35, cy - s * 0.08);
    g.closePath();
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A * 0.75 });
    g.moveTo(cx - w * 0.48, cy - s * 0.02);
    g.arc(cx - w * 0.55, cy - s * 0.02, w * 0.12, -Math.PI * 0.35, Math.PI * 0.35);
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A * 0.75 });
    g.moveTo(cx + w * 0.48, cy - s * 0.02);
    g.arc(cx + w * 0.55, cy - s * 0.02, w * 0.12, Math.PI * 0.65, Math.PI * 1.35);
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A * 0.75 });
    g.moveTo(cx - w * 0.4, cy - s * 0.08);
    g.lineTo(cx + w * 0.4, cy - s * 0.08);
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A });
    return g;
}

function vecHudSector(size: number, strokeColor: number): Graphics {
    const { cx, cy, s } = box(size);
    const g = new Graphics();
    const rh = s * 0.14;
    g.moveTo(cx, cy - s * 0.32);
    g.lineTo(cx + rh, cy - s * 0.12);
    g.lineTo(cx, cy + s * 0.02);
    g.lineTo(cx - rh, cy - s * 0.12);
    g.closePath();
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A });
    g.moveTo(cx, cy + s * 0.02);
    g.lineTo(cx, cy + s * 0.34);
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A * 0.7 });
    return g;
}

function vecHudRoutes(size: number, strokeColor: number): Graphics {
    const { cx, cy, s } = box(size);
    const g = new Graphics();
    const r = s * 0.1;
    const x0 = cx - s * 0.28;
    const x1 = cx;
    const x2 = cx + s * 0.28;
    const y0 = cy + s * 0.06;
    [x0, x1, x2].forEach((x) => {
        g.circle(x, y0, r);
        g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A });
    });
    g.moveTo(x0 + r, y0);
    g.lineTo(x1 - r, y0);
    g.moveTo(x1 + r, y0);
    g.lineTo(x2 - r, y0);
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A * 0.75 });
    return g;
}

// ─── Exported factories — Kenney-first ───────────────────────────────────────

/** BEST — Kenney Yellow star (allowed trophy fallback: rank star). */
export function createIconHudBest(size: number, accentColor: number): Container {
    const root = new Container();
    if (!mountKenney(root, size, size, 'menu_best_star', {
        tint: accentColor,
        alpha: 0.96,
        glowColor: accentColor,
        glowAlpha: 0.14,
    })) {
        root.addChild(vecHudBest(size, accentColor));
    }
    return root;
}

/** SECTOR — Blue icon_outline_circle (node / beacon shell). */
export function createIconHudSector(size: number, accentColor: number): Container {
    const root = new Container();
    if (!mountKenney(root, size, size, 'menu_sector_circle', {
        tint: accentColor,
        alpha: 0.95,
        glowColor: accentColor,
        glowAlpha: 0.1,
    })) {
        root.addChild(vecHudSector(size, accentColor));
    }
    return root;
}

/** ROUTES — Extra icon_repeat_outline (path / loop progression). */
export function createIconHudRoutes(size: number, accentColor: number): Container {
    const root = new Container();
    if (!mountKenney(root, size, size, 'menu_routes_repeat', {
        tint: accentColor,
        alpha: 0.93,
        glowColor: accentColor,
        glowAlpha: 0.1,
    })) {
        root.addChild(vecHudRoutes(size, accentColor));
    }
    return root;
}

/** Profile ring — Kenney star_outline_depth under rings + initial (caller adds letter). */
export function createAvatarWingRing(size: number): Container {
    const root = new Container();
    const cx = size / 2;
    const cy = size / 2;
    const r  = size / 2 - 2.5;
    if (velocityUiArtReady() && getVelocityUiTexture('menu_profile_star_outline')) {
        const spr = new Sprite(getVelocityUiTexture('menu_profile_star_outline')!);
        spr.anchor.set(0.5);
        const max = size - 10;
        const sc  = Math.min(max / spr.texture.width, max / spr.texture.height);
        spr.scale.set(sc);
        spr.position.set(cx, cy);
        spr.tint = GAME_COLORS.primary;
        spr.alpha = 0.32;
        root.addChildAt(spr, 0);
    }
    const g = new Graphics();
    g.circle(cx, cy, r + 2.5);
    g.stroke({ color: GAME_COLORS.primary, width: 1.25, alpha: 0.35 });
    g.circle(cx, cy, r);
    g.stroke({ color: GAME_COLORS.primary, width: 1.75, alpha: 0.78 });
    root.addChild(g);
    return root;
}

/** Mic + green status — Green icon_circle + Grey icon_square (mic body). */
export function createIconMicStatusDot(size: number): Container {
    const root = new Container();
    const w = size;
    const h = size;
    if (velocityUiArtReady() && getVelocityUiTexture('menu_status_led') && getVelocityUiTexture('menu_icon_square_grey')) {
        const dot = new Sprite(getVelocityUiTexture('menu_status_led')!);
        dot.anchor.set(0.5);
        const ds = Math.min(w * 0.28, h * 0.5);
        dot.scale.set(ds / Math.max(dot.texture.width, dot.texture.height));
        dot.position.set(w * 0.22, h / 2);
        dot.tint = GAME_COLORS.accent_green;
        root.addChild(dot);
        const mic = new Sprite(getVelocityUiTexture('menu_icon_square_grey')!);
        mic.anchor.set(0.5);
        const ms = Math.min(w * 0.22, h * 0.4);
        mic.scale.set(ms / mic.texture.width, (h * 0.42) / mic.texture.height);
        mic.position.set(w * 0.58, h / 2);
        mic.tint = 0x8899aa;
        mic.alpha = 0.85;
        root.addChild(mic);
        return root;
    }
    const cy = size / 2;
    const g  = new Graphics();
    const dotX = size * 0.18;
    g.circle(dotX, cy, Math.max(2, size * 0.11));
    g.fill({ color: GAME_COLORS.accent_green, alpha: 0.95 });
    const mx = size * 0.42;
    const mw = Math.max(4, size * 0.22);
    const mh = Math.max(6, size * 0.36);
    g.roundRect(mx, cy - mh / 2, mw, mh, 2);
    g.stroke({ color: 0x88aabb, width: STROKE_A, alpha: 0.75 });
    g.moveTo(mx + mw / 2, cy + mh / 2);
    g.lineTo(mx + mw / 2, cy + mh / 2 + size * 0.14);
    g.stroke({ color: 0x88aabb, width: STROKE_A, alpha: 0.6 });
    root.addChild(g);
    return root;
}

/** SETTINGS — Kenney repeat_dark (pack has no gear; quiet system control). */
export function createIconSettingsGear(cx: number, cy: number, radius: number, color: number, alpha = 0.72): Container {
    const root = new Container();
    root.position.set(cx, cy);
    if (velocityUiArtReady() && getVelocityUiTexture('menu_settings_repeat')) {
        const spr = new Sprite(getVelocityUiTexture('menu_settings_repeat')!);
        spr.anchor.set(0.5);
        const d = radius * 2;
        spr.scale.set(d / Math.max(spr.texture.width, spr.texture.height));
        spr.tint = color;
        spr.alpha = alpha;
        root.addChild(spr);
        return root;
    }
    const g = new Graphics();
    const n = 8;
    const ri = radius * 0.38;
    const rm = radius * 0.62;
    const ro = radius * 0.92;
    for (let i = 0; i < n; i++) {
        const a0 = ((i - 0.5) * 2 * Math.PI) / n;
        const a1 = (i * 2 * Math.PI) / n;
        const a2 = ((i + 0.5) * 2 * Math.PI) / n;
        if (i === 0) g.moveTo(Math.cos(a0) * ri, Math.sin(a0) * ri);
        else g.lineTo(Math.cos(a0) * ri, Math.sin(a0) * ri);
        g.lineTo(Math.cos(a0) * rm, Math.sin(a0) * rm);
        g.lineTo(Math.cos(a1) * ro, Math.sin(a1) * ro);
        g.lineTo(Math.cos(a2) * rm, Math.sin(a2) * rm);
        g.lineTo(Math.cos(a2) * ri, Math.sin(a2) * ri);
    }
    g.closePath();
    g.stroke({ color, width: STROKE_A, alpha });
    g.circle(0, 0, ri * 0.85);
    g.stroke({ color, width: STROKE_A, alpha: alpha * 0.85 });
    root.addChild(g);
    return root;
}

export function createIconLeaderboardTrophy(size: number, gold: number): Container {
    const root = new Container();
    if (!mountKenney(root, size, size, 'menu_leaderboard_star', { tint: gold, alpha: 0.95, pad: 2 })) {
        root.addChild(vecLeaderboardVec(size, gold));
    }
    return root;
}

function vecLeaderboardVec(size: number, gold: number): Graphics {
    const { cx, cy, s } = box(size);
    const g = new Graphics();
    const w = s * 0.36;
    g.moveTo(cx - w * 0.5, cy + s * 0.18);
    g.quadraticCurveTo(cx - w * 0.55, cy + s * 0.32, cx, cy + s * 0.36);
    g.quadraticCurveTo(cx + w * 0.55, cy + s * 0.32, cx + w * 0.5, cy + s * 0.18);
    g.lineTo(cx + w * 0.4, cy - s * 0.02);
    g.lineTo(cx - w * 0.4, cy - s * 0.02);
    g.closePath();
    g.stroke({ color: gold, width: STROKE_B, alpha: ALPHA_B });
    return g;
}

export function createIconAchievementsMedal(size: number, strokeColor: number): Container {
    const root = new Container();
    if (!mountKenney(root, size, size, 'menu_achievements_seal', { tint: strokeColor, alpha: 0.92, pad: 2 })) {
        root.addChild(vecMedalVec(size, strokeColor));
    }
    return root;
}

function vecMedalVec(size: number, strokeColor: number): Graphics {
    const { cx, cy, s } = box(size);
    const g = new Graphics();
    const rm = s * 0.30;
    g.circle(cx, cy - s * 0.06, rm);
    g.stroke({ color: strokeColor, width: STROKE_B, alpha: ALPHA_B });
    g.moveTo(cx - rm * 0.5, cy + rm * 0.35);
    g.lineTo(cx - rm * 0.35, cy + s * 0.38);
    g.lineTo(cx, cy + rm * 0.55);
    g.lineTo(cx + rm * 0.35, cy + s * 0.38);
    g.lineTo(cx + rm * 0.5, cy + rm * 0.35);
    g.stroke({ color: strokeColor, width: STROKE_B, alpha: ALPHA_B * 0.85 });
    return g;
}

export function createIconStoreModule(size: number, gold: number): Container {
    const root = new Container();
    if (!mountKenney(root, size, size, 'menu_store_icon', { tint: gold, alpha: 0.9, pad: 3 })) {
        root.addChild(vecStoreVec(size, gold));
    }
    return root;
}

function vecStoreVec(size: number, gold: number): Graphics {
    const { cx, cy, s } = box(size);
    const g = new Graphics();
    const bw = s * 0.62;
    const bh = s * 0.48;
    g.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 3);
    g.stroke({ color: gold, width: STROKE_B, alpha: ALPHA_B });
    return g;
}

export function createIconRewardsCachePod(size: number, gold: number): Container {
    const root = new Container();
    if (!mountKenney(root, size, size, 'menu_rewards_star_outline', { tint: gold, alpha: 0.95, pad: 2 })) {
        root.addChild(vecRewardsVec(size, gold));
    }
    return root;
}

function vecRewardsVec(size: number, gold: number): Graphics {
    const { cx, cy, s } = box(size);
    const g = new Graphics();
    const pw = s * 0.7;
    const ph = s * 0.38;
    g.roundRect(cx - pw / 2, cy - ph / 2 + 2, pw, ph, ph / 2);
    g.stroke({ color: gold, width: STROKE_B, alpha: ALPHA_B });
    return g;
}

export function createIconPilotClassWings(size: number): Container {
    const root = new Container();
    if (!mountKenney(root, size, size, 'menu_pilot_class_star', { tint: GAME_COLORS.primary, alpha: 0.5, pad: 2 })) {
        root.addChild(vecWingsVec(size));
    }
    return root;
}

function vecWingsVec(size: number): Graphics {
    const { cx, cy, s } = box(size);
    const g  = new Graphics();
    const span = size * 0.38;
    g.moveTo(cx, cy - span * 0.2);
    g.lineTo(cx - span, cy + span * 0.35);
    g.lineTo(cx - span * 0.35, cy + span * 0.1);
    g.lineTo(cx, cy - span * 0.05);
    g.moveTo(cx, cy - span * 0.2);
    g.lineTo(cx + span, cy + span * 0.35);
    g.lineTo(cx + span * 0.35, cy + span * 0.1);
    g.lineTo(cx, cy - span * 0.05);
    g.stroke({ color: GAME_COLORS.primary, width: STROKE_A, alpha: ALPHA_A * 0.75 });
    return g;
}

/**
 * Hero radar hub — Kenney star at signal center.
 * Place with `hub.position.set(cx - radiusPx, cy - radiusPx)` in radar-local space.
 */
export function createHeroRadarHubSprite(radiusPx: number): Container {
    const root = new Container();
    const boxS = radiusPx * 2;
    if (!mountKenney(root, boxS, boxS, 'menu_radar_center', {
        tint: 0xffffee,
        alpha: 0.9,
        pad:  1,
    })) {
        const g = new Graphics();
        g.circle(radiusPx, radiusPx, 2.5);
        g.fill({ color: 0xffffff, alpha: 0.85 });
        root.addChild(g);
    }
    return root;
}
