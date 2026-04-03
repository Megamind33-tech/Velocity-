/**
 * Front menu functional symbols — slot-mapped line silhouettes (Game-icons.net–style weight).
 * Family A: system/status — thin stroke, cool palette. Family B: reward/progression — slightly bolder, warmer.
 *
 * Asset split: panel/button chrome remains Kenney sci-fi nine-slice where already wired; this file supplies
 * only semantic glyphs (vectors), not chrome textures.
 */

import { Container, Graphics } from 'pixi.js';
import { GAME_COLORS } from './GameUITheme';

const STROKE_A = 1.05;
const STROKE_B = 1.35;
const ALPHA_A  = 0.82;
const ALPHA_B  = 0.88;

/** Centered icon in a square box; caller positions the container. */
function box(size: number): { cx: number; cy: number; s: number } {
    return { cx: size / 2, cy: size / 2, s: size };
}

// ─── Family A — HUD chips ─────────────────────────────────────────────────────

/** Slot 1 BEST — trophy (secondary to value; thin silhouette). */
export function createIconHudBest(size: number, strokeColor: number): Container {
    const root = new Container();
    const { cx, cy, s } = box(size);
    const w  = s * 0.38;
    const g  = new Graphics();
    // Cup bowl
    g.moveTo(cx - w * 0.45, cy + s * 0.12);
    g.quadraticCurveTo(cx - w * 0.5, cy + s * 0.28, cx, cy + s * 0.30);
    g.quadraticCurveTo(cx + w * 0.5, cy + s * 0.28, cx + w * 0.45, cy + s * 0.12);
    g.lineTo(cx + w * 0.35, cy - s * 0.08);
    g.lineTo(cx - w * 0.35, cy - s * 0.08);
    g.closePath();
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A * 0.75 });
    // Handles
    g.moveTo(cx - w * 0.48, cy - s * 0.02);
    g.arc(cx - w * 0.55, cy - s * 0.02, w * 0.12, -Math.PI * 0.35, Math.PI * 0.35);
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A * 0.75 });
    g.moveTo(cx + w * 0.48, cy - s * 0.02);
    g.arc(cx + w * 0.55, cy - s * 0.02, w * 0.12, Math.PI * 0.65, Math.PI * 1.35);
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A * 0.75 });
    // Lid / top
    g.moveTo(cx - w * 0.4, cy - s * 0.08);
    g.lineTo(cx + w * 0.4, cy - s * 0.08);
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A });
    g.moveTo(cx - w * 0.22, cy - s * 0.22);
    g.lineTo(cx + w * 0.22, cy - s * 0.22);
    g.stroke({ color: strokeColor, width: STROKE_A, alpha: ALPHA_A * 0.65 });
    root.addChild(g);
    return root;
}

/** Slot 2 SECTOR — waypoint beacon (diamond on post). */
export function createIconHudSector(size: number, strokeColor: number): Container {
    const root = new Container();
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
    root.addChild(g);
    return root;
}

/** Slot 3 ROUTES — connected route nodes. */
export function createIconHudRoutes(size: number, strokeColor: number): Container {
    const root = new Container();
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
    root.addChild(g);
    return root;
}

/** Slot 4 profile — wing pip + ring (initial drawn by caller on top). */
export function createAvatarWingRing(size: number): Container {
    const root = new Container();
    const cx = size / 2;
    const cy = size / 2;
    const r  = size / 2 - 2.5;
    const g  = new Graphics();
    g.circle(cx, cy, r + 2.5);
    g.stroke({ color: GAME_COLORS.primary, width: 1.25, alpha: 0.35 });
    // Wing pips — minimal angular silhouettes
    const wy = cy + 1;
    g.moveTo(cx - r * 0.15, wy);
    g.lineTo(cx - r * 0.85, wy - r * 0.22);
    g.lineTo(cx - r * 0.72, wy);
    g.lineTo(cx - r * 0.85, wy + r * 0.18);
    g.closePath();
    g.stroke({ color: GAME_COLORS.primary, width: STROKE_A, alpha: ALPHA_A * 0.85 });
    g.moveTo(cx + r * 0.15, wy);
    g.lineTo(cx + r * 0.85, wy - r * 0.22);
    g.lineTo(cx + r * 0.72, wy);
    g.lineTo(cx + r * 0.85, wy + r * 0.18);
    g.closePath();
    g.stroke({ color: GAME_COLORS.primary, width: STROKE_A, alpha: ALPHA_A * 0.85 });
    g.circle(cx, cy, r);
    g.stroke({ color: GAME_COLORS.primary, width: 1.75, alpha: 0.78 });
    root.addChild(g);
    return root;
}

/** Slot 6 — tiny mic + green status dot (system). */
export function createIconMicStatusDot(size: number): Container {
    const root = new Container();
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

/** Slot 16 SETTINGS — simple 8-tooth cog (system). */
export function createIconSettingsGear(cx: number, cy: number, radius: number, color: number, alpha = 0.72): Graphics {
    const g = new Graphics();
    const n = 8;
    const ri = radius * 0.38;
    const rm = radius * 0.62;
    const ro = radius * 0.92;
    for (let i = 0; i < n; i++) {
        const a0 = ((i - 0.5) * 2 * Math.PI) / n;
        const a1 = (i * 2 * Math.PI) / n;
        const a2 = ((i + 0.5) * 2 * Math.PI) / n;
        if (i === 0) {
            g.moveTo(cx + Math.cos(a0) * ri, cy + Math.sin(a0) * ri);
        } else {
            g.lineTo(cx + Math.cos(a0) * ri, cy + Math.sin(a0) * ri);
        }
        g.lineTo(cx + Math.cos(a0) * rm, cy + Math.sin(a0) * rm);
        g.lineTo(cx + Math.cos(a1) * ro, cy + Math.sin(a1) * ro);
        g.lineTo(cx + Math.cos(a2) * rm, cy + Math.sin(a2) * rm);
        g.lineTo(cx + Math.cos(a2) * ri, cy + Math.sin(a2) * ri);
    }
    g.closePath();
    g.stroke({ color, width: STROKE_A, alpha });
    g.circle(cx, cy, ri * 0.85);
    g.stroke({ color, width: STROKE_A, alpha: alpha * 0.85 });
    return g;
}

// ─── Family B — Leaderboard / Achievements column icons ──────────────────────

/** Slot 12 LEADERBOARD — trophy (distinct from achievements). */
export function createIconLeaderboardTrophy(size: number, gold: number): Container {
    const root = new Container();
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
    g.moveTo(cx - w * 0.42, cy - s * 0.02);
    g.lineTo(cx + w * 0.42, cy - s * 0.02);
    g.stroke({ color: gold, width: STROKE_B, alpha: ALPHA_B * 0.9 });
    g.moveTo(cx, cy - s * 0.32);
    g.lineTo(cx, cy - s * 0.02);
    g.stroke({ color: gold, width: STROKE_B, alpha: ALPHA_B * 0.75 });
    g.circle(cx, cy - s * 0.36, s * 0.08);
    g.stroke({ color: gold, width: STROKE_B, alpha: ALPHA_B });
    root.addChild(g);
    return root;
}

/** Slot 13 ACHIEVEMENTS — medal / seal (not trophy). */
export function createIconAchievementsMedal(size: number, strokeColor: number): Container {
    const root = new Container();
    const { cx, cy, s } = box(size);
    const g = new Graphics();
    const rm = s * 0.30;
    g.circle(cx, cy - s * 0.06, rm);
    g.stroke({ color: strokeColor, width: STROKE_B, alpha: ALPHA_B });
    // Ribbon V
    g.moveTo(cx - rm * 0.5, cy + rm * 0.35);
    g.lineTo(cx - rm * 0.35, cy + s * 0.38);
    g.lineTo(cx, cy + rm * 0.55);
    g.lineTo(cx + rm * 0.35, cy + s * 0.38);
    g.lineTo(cx + rm * 0.5, cy + rm * 0.35);
    g.stroke({ color: strokeColor, width: STROKE_B, alpha: ALPHA_B * 0.85 });
    // Inner seal ring
    g.circle(cx, cy - s * 0.06, rm * 0.55);
    g.stroke({ color: strokeColor, width: 1, alpha: ALPHA_B * 0.5 });
    root.addChild(g);
    return root;
}

/** Slot 14 STORE — upgrade module. */
export function createIconStoreModule(size: number, gold: number): Container {
    const root = new Container();
    const { cx, cy, s } = box(size);
    const g = new Graphics();
    const bw = s * 0.62;
    const bh = s * 0.48;
    g.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 3);
    g.stroke({ color: gold, width: STROKE_B, alpha: ALPHA_B });
    g.moveTo(cx - bw * 0.35, cy - bh * 0.12);
    g.lineTo(cx + bw * 0.35, cy - bh * 0.12);
    g.moveTo(cx - bw * 0.35, cy + bh * 0.08);
    g.lineTo(cx + bw * 0.35, cy + bh * 0.08);
    g.stroke({ color: gold, width: 1, alpha: ALPHA_B * 0.65 });
    const pegL = new Graphics();
    pegL.circle(cx - bw * 0.38, cy - bh * 0.38, 2);
    pegL.fill({ color: gold, alpha: 0.45 });
    const pegR = new Graphics();
    pegR.circle(cx + bw * 0.38, cy - bh * 0.38, 2);
    pegR.fill({ color: gold, alpha: 0.45 });
    root.addChild(g);
    root.addChild(pegL);
    root.addChild(pegR);
    return root;
}

/** Slot 15 REWARDS — cache pod + star (collectible). */
export function createIconRewardsCachePod(size: number, gold: number): Container {
    const root = new Container();
    const { cx, cy, s } = box(size);
    const g = new Graphics();
    const pw = s * 0.7;
    const ph = s * 0.38;
    g.roundRect(cx - pw / 2, cy - ph / 2 + 2, pw, ph, ph / 2);
    g.stroke({ color: gold, width: STROKE_B, alpha: ALPHA_B });
    g.moveTo(cx - pw * 0.25, cy + 2);
    g.lineTo(cx + pw * 0.25, cy + 2);
    g.stroke({ color: gold, width: 1, alpha: 0.5 });
    // Small premium star inside
    const sr = s * 0.12;
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const r = i % 2 === 0 ? sr : sr * 0.42;
        const x = cx + Math.cos(a) * r;
        const y = cy + 2 + Math.sin(a) * r;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
    }
    g.closePath();
    g.fill({ color: gold, alpha: 0.55 });
    g.stroke({ color: gold, width: 1, alpha: 0.7 });
    root.addChild(g);
    return root;
}

/** Slot 9 pilot strip — wing class emblem (behind optional letter). */
export function createIconPilotClassWings(size: number): Container {
    const root = new Container();
    const cx = size / 2;
    const cy = size / 2;
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
    root.addChild(g);
    return root;
}
