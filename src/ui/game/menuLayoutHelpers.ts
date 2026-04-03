/**
 * Reusable Pixi menu layout primitives — Velocity mobile game UI.
 * Phases 1–7: role-based buttons, HUD chips, status strip, hero panel.
 * Portrait-mobile first. Kenney sprites + Graphics overlays; no DOM/CSS.
 */

import {
    ColorMatrixFilter,
    Container,
    FederatedPointerEvent,
    Graphics,
    NineSliceSprite,
    Text,
} from 'pixi.js';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from './GameUITheme';
import { createKenneyFramedPanelWithContent } from './kenneyNineSlice';
import {
    economyButtonLabelStyle,
    footerUtilityLabelStyle,
    helperTextStyle,
    hudLabelStyle,
    hudValueStyle,
    pilotRankStyle,
    primaryButtonLabelStyle,
    utilityButtonLabelStyle,
} from './menuTextStyles';
import {
    getVelocityUiTexture,
    velocityUiArtReady,
    type VelocityUiTextureKey,
} from './velocityUiArt';

// ─── Tier heights ─────────────────────────────────────────────────────────────

export type MenuButtonTier = 'cta' | 'secondary' | 'economy' | 'utility';

export const MENU_TIER_HEIGHT: Record<MenuButtonTier, number> = {
    cta:       58,
    secondary: 48,
    economy:   46,
    utility:   40,
};

// ─── Phase 5: Role-based palette ──────────────────────────────────────────────
// primary  = Mission Select (cyan, dominant)
// utility  = Leaderboard, Achievements, Settings (steel-blue, calm)
// economy  = Store, Rewards (warm gold, rewarding)

const ROLE_PALETTE = {
    primary: {
        bg:     0x051318,
        border: 0x00ffcc,
        shine:  0x55ffee,
        text:   0xffffff,
        shadow: 0x003322,
        tint:   0x22ccbb,
        radius: 10,
    },
    utility: {
        bg:     0x0b1520,
        border: 0x4d7fa8,
        shine:  0x6699bb,
        text:   0xc8e4ff,
        shadow: 0x000e1e,
        tint:   0x5588aa,
        radius: 8,
    },
    economy: {
        bg:     0x130e00,
        border: 0xffcc44,
        shine:  0xffe077,
        text:   0xfff0cc,
        shadow: 0x2a1400,
        tint:   0xffaa22,
        radius: 8,
    },
} as const;

type ButtonRole = keyof typeof ROLE_PALETTE;

function tierToRole(tier: MenuButtonTier): ButtonRole {
    if (tier === 'cta')     return 'primary';
    if (tier === 'economy') return 'economy';
    return 'utility';
}

// ─── Kenney nine-slice constants ──────────────────────────────────────────────
const KS = { L: 56, R: 56, T: 20, B: 20 } as const;

// ─── Phase 3 + 5: Role-based button factory ───────────────────────────────────
/**
 * createMenuButton — role-differentiated game button.
 *
 * Tiers:
 *   cta       → primary: cyan border + shine, dominant weight
 *   secondary → utility: steel-blue, calm but polished
 *   economy   → economy: warm gold shine, rewarding feel
 *   utility   → utility: same as secondary, lower alpha
 *
 * Layers (bottom → top):
 *   1. Dark base fill
 *   2. Kenney NineSlice mid (role-tinted) when art is loaded
 *   3. Role border stroke
 *   4. Top shine strip
 *   5. CTA inner glow ring (primary only)
 *   6. Label text (Phase 4 typography)
 *   7. Press/release scale states (Phase 6)
 */
export function createMenuButton(
    label:   string,
    tier:    MenuButtonTier,
    variant: 'primary' | 'secondary' | 'accent' | 'danger' | 'success',
    onClick: () => void,
    width:   number,
): Container {
    const h    = MENU_TIER_HEIGHT[tier];
    const role = tierToRole(tier);
    const P    = ROLE_PALETTE[role];

    const root = new Container();
    root.eventMode = 'static';
    root.cursor    = 'pointer';

    // 1. Dark base plate
    const base = new Graphics();
    base.roundRect(0, 0, width, h, P.radius);
    base.fill({ color: P.bg, alpha: 0.97 });
    base.eventMode = 'none';
    root.addChild(base);

    // 2. Kenney NineSlice mid-layer (role-tinted) if art is loaded
    if (velocityUiArtReady()) {
        const key: VelocityUiTextureKey =
            role === 'primary' ? 'button_primary' :
            role === 'economy' ? 'button_accent'  : 'button_secondary';
        const tex = getVelocityUiTexture(key);
        if (tex) {
            const spr = new NineSliceSprite({
                texture:     tex,
                leftWidth:   KS.L, rightWidth:   KS.R,
                topHeight:   KS.T, bottomHeight: KS.B,
                width, height: h,
            });
            spr.tint      = P.tint;
            spr.alpha     = role === 'utility' ? 0.52 : 0.68;
            spr.eventMode = 'none';
            root.addChild(spr);

            // Phase 5: ColorMatrixFilter for role emphasis
            const cmf = new ColorMatrixFilter();
            if (role === 'primary') {
                cmf.saturate(0.3, true);
                cmf.brightness(1.06, true);
            } else if (role === 'economy') {
                cmf.saturate(0.35, true);
                cmf.brightness(1.04, true);
            } else {
                // utility: cool desaturated tone
                cmf.saturate(-0.2, true);
                cmf.brightness(0.98, true);
            }
            spr.filters = [cmf];
        }
    }

    // 3. Role border
    const border = new Graphics();
    border.roundRect(1, 1, width - 2, h - 2, P.radius - 1);
    border.stroke({
        color: P.border,
        width: role === 'primary' ? 1.5 : 1,
        alpha: role === 'primary' ? 0.82 : 0.52,
    });
    border.eventMode = 'none';
    root.addChild(border);

    // 4. Top shine strip — physical highlight band
    const shineH = role === 'primary' ? 3 : 2;
    const shine  = new Graphics();
    shine.roundRect(6, 2, width - 12, shineH, 2);
    shine.fill({
        color: P.shine,
        alpha: role === 'primary' ? 0.55 : role === 'economy' ? 0.45 : 0.28,
    });
    shine.eventMode = 'none';
    root.addChild(shine);

    // 5. CTA inner glow ring (primary only — Phase 5 discipline)
    if (role === 'primary') {
        const glow = new Graphics();
        glow.roundRect(3, 3, width - 6, h - 6, P.radius - 2);
        glow.stroke({ color: P.border, width: 1, alpha: 0.16 });
        glow.eventMode = 'none';
        root.addChild(glow);
    }

    // 6. Label — shared text style by role (blur-free, contrast-first)
    const labelStyle =
        role === 'primary' ? primaryButtonLabelStyle() :
        role === 'economy' ? economyButtonLabelStyle() :
                             utilityButtonLabelStyle();
    const t = new Text({ text: label, style: labelStyle });
    t.anchor.set(0.5);
    t.position.set(width / 2, h / 2);
    root.addChild(t);

    // 7. Interaction states — Phase 6
    const stop = (e: FederatedPointerEvent) => e.stopPropagation();
    root.on('pointerdown',     (e: FederatedPointerEvent) => { stop(e); root.scale.set(0.97); });
    root.on('pointerup',       (e: FederatedPointerEvent) => { stop(e); root.scale.set(1.0);  onClick(); });
    root.on('pointerupoutside',() => root.scale.set(1.0));
    root.on('pointercancel',   () => root.scale.set(1.0));

    if (tier === 'utility') root.alpha = 0.90;

    return root;
}

// ─── HUD chip ─────────────────────────────────────────────────────────────────
/**
 * Compact HUD stat chip — backplate, accent line, micro-label, bold value.
 * Typography via shared style factories; no inline blur.
 */
export function createHudChip(
    label: string,
    value: string,
    width: number,
    accentColor: number = GAME_COLORS.accent_gold,
): Container {
    const root = new Container();
    const h    = 36;

    // Backplate
    const bg = new Graphics();
    bg.roundRect(0, 0, width, h, 8);
    bg.fill({ color: 0x060e1a, alpha: 0.84 });
    bg.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.35 });
    root.addChild(bg);

    // Top accent line (role colour)
    const accentLine = new Graphics();
    accentLine.roundRect(4, 0, width - 8, 2, 1);
    accentLine.fill({ color: accentColor, alpha: 0.50 });
    root.addChild(accentLine);

    // Micro-label — crisp, not muddy
    const lab = new Text({ text: label, style: hudLabelStyle() });
    lab.position.set(7, 5);
    root.addChild(lab);

    // Value — bold, accent-coloured, sharp 1 px shadow
    const val = new Text({ text: value, style: hudValueStyle(accentColor) });
    val.position.set(7, 17);
    root.addChild(val);

    return root;
}

// ─── Phase 4 + STATUS-strip fix: Pilot status strip ──────────────────────────
// Replaces the dead "STATUS" label slab with a real, data-driven status row.

const RANK_TABLE: [number, string][] = [
    [20, 'ELITE'],
    [15, 'VETERAN'],
    [10, 'ACE'],
    [6,  'AVIATOR'],
    [3,  'PILOT'],
    [1,  'CADET'],
];

function getPilotRank(maxUnlocked: number): string {
    for (const [threshold, name] of RANK_TABLE) {
        if (maxUnlocked >= threshold) return name;
    }
    return 'CADET';
}

/**
 * createPilotStatusStrip — replaces the old empty STATUS backplate.
 *
 * Layout (left → right):
 *   [PILOT label + rank name]  [────progress bar────]  [unlocked/total ROUTES]
 */
export function createPilotStatusStrip(
    width: number,
    opts: { maxUnlocked: number; unlockedCount: number; totalLevels: number },
): Container {
    const { maxUnlocked, unlockedCount, totalLevels } = opts;
    const h    = 44;
    const rank = getPilotRank(maxUnlocked);
    const root = new Container();

    // Backplate
    const bg = new Graphics();
    bg.roundRect(0, 0, width, h, 10);
    bg.fill({ color: 0x060c18, alpha: 0.90 });
    bg.stroke({ color: 0x253548, width: 1, alpha: 0.75 });
    root.addChild(bg);

    // Top accent stripe
    const topLine = new Graphics();
    topLine.roundRect(22, 0, width - 44, 1.5, 1);
    topLine.fill({ color: GAME_COLORS.primary, alpha: 0.18 });
    root.addChild(topLine);

    // Left block — "PILOT" micro-label (top) + rank name (bottom)
    const pilotLabel = new Text({ text: 'PILOT', style: hudLabelStyle() });
    pilotLabel.position.set(12, 6);
    root.addChild(pilotLabel);

    const rankText = new Text({ text: rank, style: pilotRankStyle() });
    rankText.position.set(12, 20);
    root.addChild(rankText);

    // Right block — value (right-anchored) + "ROUTES" micro-label left of it
    const routesText = new Text({
        text: `${unlockedCount}/${totalLevels}`,
        style: hudValueStyle(GAME_COLORS.accent_gold),
    });
    routesText.anchor.set(1, 0.5);
    routesText.position.set(width - 10, h / 2);
    root.addChild(routesText);

    const routesLabel = new Text({ text: 'ROUTES', style: hudLabelStyle() });
    routesLabel.anchor.set(1, 0.5);
    routesLabel.position.set(width - 10 - routesText.width - 6, h / 2);
    root.addChild(routesLabel);

    // Center progress bar
    const barPadLeft  = 94;
    const barPadRight = Math.max(78, routesText.width + routesLabel.width + 28);
    const barW  = Math.max(40, width - barPadLeft - barPadRight);
    const barH  = 6;
    const barX  = barPadLeft;
    const barY  = (h - barH) / 2;
    const prog  = totalLevels > 0 ? Math.min(1, unlockedCount / totalLevels) : 0;

    const barBg = new Graphics();
    barBg.roundRect(barX, barY, barW, barH, 3);
    barBg.fill({ color: 0x0a1c2e, alpha: 0.92 });
    barBg.stroke({ color: 0x1a3a55, width: 1, alpha: 0.7 });
    root.addChild(barBg);

    if (prog > 0) {
        const fillW  = Math.max(4, (barW - 2) * prog);
        const barFill = new Graphics();
        barFill.roundRect(barX + 1, barY + 1, fillW, barH - 2, 2);
        barFill.fill({ color: GAME_COLORS.primary, alpha: 0.88 });
        root.addChild(barFill);
    }

    return root;
}

// ─── Compact info pill ────────────────────────────────────────────────────────
/** Small pill used inside the hero panel (e.g. mic tip). */
export function createInfoPill(text: string, maxWidth: number): Container {
    const root = new Container();
    const padX = 10;
    const padY = 4;
    // helperTextStyle gives 0xaec8d8 fill — legible, not ghosted
    const t = new Text({ text, style: helperTextStyle() });
    const w = Math.min(maxWidth, t.width + padX * 2);
    const h = t.height + padY * 2;
    const g = new Graphics();
    g.roundRect(0, 0, w, h, h / 2);
    // Slightly lighter fill so text isn't fighting darkness-on-darkness
    g.fill({ color: 0x0d1e30, alpha: 0.72 });
    g.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.32 });
    root.addChild(g);
    t.position.set(padX, padY);
    root.addChild(t);
    return root;
}

// ─── Phase 2 (improved): Avatar/pilot badge ───────────────────────────────────
/** Circular pilot badge: outer accent ring + initial letter. */
export function createAvatarBadge(size: number, initial: string = 'V'): Container {
    const root = new Container();
    const cx   = size / 2;
    const cy   = size / 2;
    const r    = size / 2 - 2;

    // Outer glow ring
    const glow = new Graphics();
    glow.circle(cx, cy, r + 2);
    glow.fill({ color: GAME_COLORS.primary, alpha: 0.12 });
    root.addChild(glow);

    // Background disc
    const disc = new Graphics();
    disc.circle(cx, cy, r);
    disc.fill({ color: 0x0d1a28, alpha: 0.96 });
    disc.stroke({ color: GAME_COLORS.primary, width: 2, alpha: 0.80 });
    root.addChild(disc);

    // Inner shine arc (top-left quadrant)
    const shine = new Graphics();
    shine.arc(cx, cy, r - 3, -2.4, -0.7);
    shine.stroke({ color: 0xffffff, width: 1.5, alpha: 0.22 });
    root.addChild(shine);

    // Initial letter — same discipline as hudValueStyle: sharp 1 px shadow, no blur haze
    const letter = new Text({
        text: initial,
        style: {
            fill:       GAME_COLORS.primary,
            fontSize:   Math.floor(size * 0.42),
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.arcade,
            dropShadow: { alpha: 0.50, blur: 1, color: 0x000000, distance: 1 },
        },
    });
    letter.anchor.set(0.5);
    letter.position.set(cx, cy);
    root.addChild(letter);

    return root;
}

// ─── Hero panel ───────────────────────────────────────────────────────────────
/**
 * Hero panel: framed inner area for title + subtitle + pill.
 * Returns { root, content } — content is positioned ready for children.
 */
export function createHeroPanel(
    width:  number,
    height: number,
): { root: Container; content: Container } {
    const root = new Container();
    const pair = createKenneyFramedPanelWithContent(width, height);

    if (pair) {
        // Slightly brighter tint so title has a clean, non-muddy surface
        pair.root.alpha = 0.96;
        pair.root.tint  = 0x2e3f55;
        const innerW = Math.max(80, width - 44);
        const innerH = Math.max(60, height - 48);
        // Bottom accent glow line — slightly stronger for definition
        const glow = new Graphics();
        glow.roundRect(0, innerH * 0.84, innerW, 2, 1);
        glow.fill({ color: GAME_COLORS.primary, alpha: 0.25 });
        pair.content.addChildAt(glow, 0);
        root.addChild(pair.root);
        return { root, content: pair.content };
    }

    // Fallback: pure Graphics — lighter navy for cleaner title contrast
    const g = new Graphics();
    g.roundRect(0, 0, width, height, 14);
    g.fill({ color: 0x121e30, alpha: 0.95 });
    g.stroke({ color: GAME_COLORS.primary, width: 2, alpha: 0.55 });
    root.addChild(g);

    // Top shine — slightly stronger
    const shine = new Graphics();
    shine.roundRect(8, 2, width - 16, 2, 1);
    shine.fill({ color: 0x55eedd, alpha: 0.38 });
    root.addChild(shine);

    const content = new Container();
    content.position.set(18, 16);
    root.addChild(content);
    return { root, content };
}

// ─── Stats strip backplate (kept for backward-compat) ─────────────────────────
/** @deprecated Use createPilotStatusStrip for data-driven display. */
export function createStatsStripBackplate(width: number, height: number): Container {
    const root = new Container();
    const pair = createKenneyFramedPanelWithContent(width, height);
    if (pair) {
        pair.root.alpha = 0.88;
        pair.root.tint  = 0x1e2d40;
        root.addChild(pair.root);
        return root;
    }
    const g = new Graphics();
    g.roundRect(0, 0, width, height, 10);
    g.fill({ color: 0x080f1a, alpha: 0.88 });
    g.stroke({ color: 0x253548, width: 1, alpha: 0.55 });
    root.addChild(g);
    return root;
}

// ─── Phase 3 (improved): Utility row (Settings) ───────────────────────────────
/**
 * Low-priority tappable row — settings and similar utility controls.
 * Less visual weight than any button tier; still polished and tappable.
 */
export function createUtilityRow(
    label:   string,
    onClick: () => void,
    width:   number,
): Container {
    const root = new Container();
    root.eventMode = 'static';
    root.cursor    = 'pointer';
    const h = 38;

    // Subtle backplate
    const bg = new Graphics();
    bg.roundRect(0, 0, width, h, 8);
    bg.fill({ color: 0xffffff, alpha: 0.035 });
    bg.stroke({ color: 0x334455, width: 1, alpha: 0.45 });
    bg.eventMode = 'none';
    root.addChild(bg);

    // Label — footerUtilityLabelStyle: bold, 2.5 letter-spacing, not ghosted
    const t = new Text({ text: label, style: footerUtilityLabelStyle() });
    t.anchor.set(0.5, 0.5);
    t.position.set(width / 2, h / 2);
    root.addChild(t);

    // Gear icon — slightly brighter than before; vertically baseline-matched to label
    const icon = new Text({
        text: '⚙',
        style: { fill: 0x7799aa, fontSize: 12 },
    });
    icon.anchor.set(1, 0.5);
    // Right edge of icon sits 6 px left of label's left edge
    icon.position.set(width / 2 - t.width / 2 - 6, h / 2);
    root.addChild(icon);

    const stop = (e: FederatedPointerEvent) => e.stopPropagation();
    root.on('pointerdown',     (e: FederatedPointerEvent) => { stop(e); root.alpha = 0.72; });
    root.on('pointerup',       (e: FederatedPointerEvent) => { stop(e); root.alpha = 1.0;  onClick(); });
    root.on('pointerupoutside',() => { root.alpha = 1.0; });
    root.on('pointercancel',   () => { root.alpha = 1.0; });

    return root;
}
