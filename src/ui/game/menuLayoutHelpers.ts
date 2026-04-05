/**
 * menuLayoutHelpers — reusable Pixi menu layout primitives.
 *
 * Shape vocabulary (not all rectangles):
 *   - Capsule HUD chips (radius = h/2)
 *   - Segmented pilot strip (circular rank badge + bar + route chip)
 *   - CTA button with corner tick marks
 *   - Utility buttons with interior surface lift
 *   - Avatar badge with glow ring + shine arc
 *   - Info pill (fully rounded capsule)
 *   - Utility row (backplate + gear + bold label)
 */

import {
    ColorMatrixFilter,
    Container,
    FederatedPointerEvent,
    Graphics,
    NineSliceSprite,
    Sprite,
    Text,
} from 'pixi.js';
import { GAME_COLORS, GAME_FONTS } from './GameUITheme';
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
import { VELOCITY_UI_SLICE } from './velocityUiSlice';

const KS = VELOCITY_UI_SLICE.button;
import {
    createIconAchievementsMedal,
    createIconHudBest,
    createIconHudRoutes,
    createIconHudSector,
    createIconLeaderboardTrophy,
    createIconPilotClassWings,
    createIconSettingsGear,
    createAvatarWingRing,
} from './menuFrontMenuIcons';

// ─── Tier heights ─────────────────────────────────────────────────────────────

export type MenuButtonTier = 'cta' | 'secondary' | 'economy' | 'utility';

// Button heights follow 8px grid + min touch target (48px per Google/Apple HIG)
export const MENU_TIER_HEIGHT: Record<MenuButtonTier, number> = {
    cta:       56,  // Primary CTA height (spec minimum)
    secondary: 48,  // Minimum touch target
    economy:   48,  // Minimum touch target
    utility:   48,  // Minimum touch target
};

/** Optional visual treatment for menu buttons (CTA launch energy, social modules). */
export interface MenuButtonExtras {
    /** Primary CTA only — runway streaks, deploy strip, forward chevrons. */
    ctaLaunch?: boolean;
    /** Secondary tier — distinct fantasy for leaderboard vs achievements. */
    social?: 'leaderboard' | 'achievements';
}

// ─── Role palette (AAA-Quality spec colors) ───────────────────────────────────

const ROLE_PALETTE = {
    primary: {
        // CTA: Cyan accent for high-priority interactive elements
        bg:     GAME_COLORS.bg_surface,     // #1A1A2E (dark surface)
        border: GAME_COLORS.accent_cyan,    // #00D1FF (spec cyan)
        shine:  0x33E5FF,                   // Lighter cyan for shine (10% lighter)
        tint:   GAME_COLORS.accent_cyan,    // #00D1FF
        radius: 10,
    },
    utility: {
        // Secondary: Muted colors for secondary actions
        bg:     GAME_COLORS.bg_surface,     // #1A1A2E
        border: GAME_COLORS.text_disabled,  // #4B5563 (muted)
        shine:  GAME_COLORS.text_secondary, // #9CA3AF (lighter muted)
        tint:   GAME_COLORS.text_secondary, // #9CA3AF
        radius: 8,
    },
    economy: {
        // Economy: Gold for premium/reward affordances
        bg:     GAME_COLORS.bg_surface,     // #1A1A2E
        border: GAME_COLORS.primary_cta,    // #FFD166 (spec gold)
        shine:  0xFFE599,                   // Lighter gold for shine (10% lighter)
        tint:   GAME_COLORS.primary_cta,    // #FFD166
        radius: 8,
    },
} as const;

type ButtonRole = keyof typeof ROLE_PALETTE;

function tierToRole(tier: MenuButtonTier): ButtonRole {
    if (tier === 'cta')     return 'primary';
    if (tier === 'economy') return 'economy';
    return 'utility';
}

// ─── Rank table (exported for callers) ───────────────────────────────────────

const RANK_TABLE: [number, string][] = [
    [20, 'ELITE'],
    [15, 'VETERAN'],
    [10, 'ACE'],
    [6,  'AVIATOR'],
    [3,  'PILOT'],
    [1,  'CADET'],
];

/** Compute pilot rank name from highest unlocked level. */
export function getPilotRank(maxUnlocked: number): string {
    for (const [threshold, name] of RANK_TABLE) {
        if (maxUnlocked >= threshold) return name;
    }
    return 'CADET';
}

// ─── Button factory ───────────────────────────────────────────────────────────

/**
 * Role-based menu button.
 *
 * primary (CTA):  cyan border + shine + corner tick marks — dominant
 * utility:        steel-blue + subtle interior surface lift — calm, polished
 * economy:        warm gold + handled by menuRewardComponents for split layout
 */
export function createMenuButton(
    label:   string,
    tier:    MenuButtonTier,
    variant: 'primary' | 'secondary' | 'accent' | 'danger' | 'success',
    onClick: () => void,
    width:   number,
    extras?: MenuButtonExtras,
): Container {
    const h    = MENU_TIER_HEIGHT[tier];
    const role = tierToRole(tier);
    const P    = ROLE_PALETTE[role];
    const socialColW = extras?.social ? 46 : 0;

    const root = new Container();
    root.eventMode = 'static';
    root.cursor    = 'pointer';

    // 1. Dark base
    const base = new Graphics();
    base.roundRect(0, 0, width, h, P.radius);
    base.fill({ color: P.bg, alpha: 0.97 });
    base.eventMode = 'none';
    root.addChild(base);

    // 1b. CTA launch deck — forward motion, runway energy (under other layers)
    if (role === 'primary' && extras?.ctaLaunch) {
        const deck = new Graphics();
        deck.roundRect(0, h * 0.58, width, h * 0.42, P.radius);
        deck.fill({ color: GAME_COLORS.bg_base, alpha: 0.85 });
        deck.eventMode = 'none';
        root.addChild(deck);

        const streaks = new Graphics();
        for (let i = 0; i < 5; i++) {
            const x0 = 12 + i * (width - 24) / 4.5;
            streaks.moveTo(x0, h - 6);
            streaks.lineTo(x0 + 10 + i * 3, h * 0.62);
        }
        streaks.stroke({ color: P.border, width: 1.25, alpha: 0.22 });
        streaks.eventMode = 'none';
        root.addChild(streaks);

        const strip = new Graphics();
        strip.roundRect(8, h - 10, width - 16, 4, 2);
        strip.fill({ color: P.border, alpha: 0.35 });
        strip.eventMode = 'none';
        root.addChild(strip);

        const chev = new Graphics();
        const cy = h * 0.36;
        for (let k = 0; k < 3; k++) {
            const cx = width - 16 - k * 10;
            chev.moveTo(cx - 6, cy);
            chev.lineTo(cx + 2, cy - 6);
            chev.lineTo(cx + 2, cy + 6);
            chev.closePath();
        }
        chev.fill({ color: P.border, alpha: 0.22 });
        chev.eventMode = 'none';
        root.addChild(chev);
    }

    // 1c. Social modules — prestige column + tinted lift (leaderboard vs achievements)
    if (role === 'utility' && extras?.social) {
        // Gold for leaderboard, purple for achievements (spec colors)
        const acc = extras.social === 'leaderboard' ? GAME_COLORS.primary_cta : GAME_COLORS.accent_purple;
        const zone = new Graphics();
        zone.roundRect(0, 0, socialColW, h, 6);
        // Dark surface background for social zone
        zone.fill({ color: GAME_COLORS.bg_surface, alpha: 0.9 });
        zone.eventMode = 'none';
        root.addChild(zone);

        const zoneLine = new Graphics();
        zoneLine.moveTo(socialColW, 6).lineTo(socialColW, h - 6);
        zoneLine.stroke({ color: acc, width: 1, alpha: 0.45 });
        zoneLine.eventMode = 'none';
        root.addChild(zoneLine);

        const iconBox = Math.min(socialColW - 8, h - 12);
        const iconRoot =
            extras.social === 'leaderboard'
                ? createIconLeaderboardTrophy(iconBox, acc)
                : createIconAchievementsMedal(iconBox, acc);
        iconRoot.position.set(Math.floor((socialColW - iconBox) / 2), Math.floor((h - iconBox) / 2));
        root.addChild(iconRoot);

        const tierLbl = new Text({
            text:  extras.social === 'leaderboard' ? 'ELITE' : 'HONORS',
            style: {
                fill:          acc,
                fontSize:      6,
                fontFamily:    GAME_FONTS.functional,  // Exo 2
                letterSpacing: 0.5,
            },
        });
        tierLbl.alpha = 0.75;
        tierLbl.anchor.set(0.5, 1);
        tierLbl.position.set(socialColW / 2, h - 4);
        root.addChild(tierLbl);
    }

    // 2. Subtle interior surface lift for utility buttons (reduces flat feel)
    if (role === 'utility') {
        const lift = new Graphics();
        lift.roundRect(2, 2, width - 4, h - 4, P.radius - 1);
        // Very subtle light lift using spec primary text color
        lift.fill({ color: GAME_COLORS.text_primary, alpha: 0.04 });
        lift.eventMode = 'none';
        root.addChild(lift);
    }

    // 3. Kenney NineSlice mid-layer (role-tinted) when art is loaded
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
            spr.alpha     = role === 'utility' ? 0.58 : 0.72;
            spr.eventMode = 'none';
            root.addChild(spr);

            const cmf = new ColorMatrixFilter();
            if (role === 'primary')      { cmf.saturate(0.2, true); cmf.brightness(1.04, true); }
            else if (role === 'economy') { cmf.saturate(0.25, true); cmf.brightness(1.03, true); }
            else                         { cmf.saturate(-0.15, true); cmf.brightness(0.99, true); }
            spr.filters = [cmf];
        }
    }

    // 4. Role border
    const border = new Graphics();
    border.roundRect(1, 1, width - 2, h - 2, P.radius - 1);
    border.stroke({
        color: P.border,
        width: role === 'primary' ? 1.5 : 1,
        alpha: role === 'primary' ? 0.82 : 0.52,
    });
    border.eventMode = 'none';
    root.addChild(border);

    // 5. Top shine strip
    const shineH = role === 'primary' ? 3 : 2;
    const shine  = new Graphics();
    shine.roundRect(6, 2, width - 12, shineH, 2);
    shine.fill({
        color: P.shine,
        alpha: role === 'primary' ? 0.55 : role === 'economy' ? 0.45 : 0.28,
    });
    shine.eventMode = 'none';
    root.addChild(shine);

    // 6. CTA extras: inner glow ring + corner tick marks (game-UI identity detail)
    if (role === 'primary') {
        // Inner glow ring
        const glow = new Graphics();
        glow.roundRect(3, 3, width - 6, h - 6, P.radius - 2);
        glow.stroke({ color: P.border, width: 1, alpha: 0.16 });
        glow.eventMode = 'none';
        root.addChild(glow);

        // Corner tick marks — L-shaped brackets at each corner
        const tl = 7;   // tick length
        const tm = 4;   // tick margin from edge
        const ta = 0.55;
        const ticks = new Graphics();
        // Top-left
        ticks.moveTo(tm, tm + tl).lineTo(tm, tm).lineTo(tm + tl, tm);
        // Top-right
        ticks.moveTo(width - tm - tl, tm).lineTo(width - tm, tm).lineTo(width - tm, tm + tl);
        // Bottom-left
        ticks.moveTo(tm, h - tm - tl).lineTo(tm, h - tm).lineTo(tm + tl, h - tm);
        // Bottom-right
        ticks.moveTo(width - tm - tl, h - tm).lineTo(width - tm, h - tm).lineTo(width - tm, h - tm - tl);
        ticks.stroke({ color: P.border, width: 1.5, alpha: ta });
        ticks.eventMode = 'none';
        root.addChild(ticks);
    }

    // 7. Label
    const labelStyle =
        role === 'primary' ? primaryButtonLabelStyle() :
        role === 'economy' ? economyButtonLabelStyle() :
                             utilityButtonLabelStyle();
    const t = new Text({ text: label, style: labelStyle });
    t.anchor.set(0.5);
    t.position.set((width + socialColW) / 2, h / 2);
    root.addChild(t);

    if (role === 'utility' && extras?.social) {
        const sub = new Text({
            text:  extras.social === 'leaderboard' ? 'GLOBAL RANK' : 'MEDALS',
            style: hudLabelStyle(),
        });
        sub.anchor.set(0, 0.5);
        sub.position.set(socialColW + 10, h * 0.32);
        root.addChild(sub);
    }

    // 8. Interaction states
    const stop = (e: FederatedPointerEvent) => e.stopPropagation();
    root.on('pointerdown',     (e: FederatedPointerEvent) => { stop(e); root.scale.set(0.97); });
    root.on('pointerup',       (e: FederatedPointerEvent) => { stop(e); root.scale.set(1.0);  onClick(); });
    root.on('pointerupoutside',() => root.scale.set(1.0));
    root.on('pointercancel',   () => root.scale.set(1.0));

    if (tier === 'utility') root.alpha = 0.90;
    return root;
}

// ─── Capsule HUD stat chip ────────────────────────────────────────────────────

export type HudChipIconSlot = 'best' | 'sector' | 'routes';

/**
 * Capsule-shaped HUD chip — radius = h/2 gives fully rounded ends.
 * Children: [bg, accentLine, icon?, label, value] — value is last Text for MainMenuScreen.
 */
export function createHudChip(
    label:       string,
    value:       string,
    width:       number,
    accentColor: number = GAME_COLORS.accent_gold,
    iconSlot?:   HudChipIconSlot,
): Container {
    const root = new Container();
    const h    = 38;
    const r    = h / 2;   // CAPSULE
    const iconSocketW = iconSlot ? 24 : 0;
    const textX       = r / 2 + 2 + iconSocketW;

    // Capsule backplate
    const bg = new Graphics();
    bg.roundRect(0, 0, width, h, r);
    bg.fill({ color: 0x060e1a, alpha: 0.84 });
    bg.stroke({ color: accentColor, width: 1, alpha: 0.42 });
    root.addChild(bg);

    if (iconSlot) {
        let sockDone = false;
        if (velocityUiArtReady()) {
            const sockTex = getVelocityUiTexture('panel_frame');
            if (sockTex) {
                const sock = new Sprite(sockTex);
                sock.position.set(3, 5);
                sock.width = iconSocketW - 2;
                sock.height = h - 10;
                sock.tint = accentColor;
                sock.alpha = 0.55;
                root.addChild(sock);
                sockDone = true;
            }
        }
        if (!sockDone) {
            const sock = new Graphics();
            sock.roundRect(3, 5, iconSocketW - 2, h - 10, 4);
            sock.stroke({ color: accentColor, width: 1, alpha: 0.28 });
            sock.fill({ color: 0x000000, alpha: 0.2 });
            root.addChild(sock);
        }
        const iz = 18;
        const ic =
            iconSlot === 'best'
                ? createIconHudBest(iz, accentColor)
                : iconSlot === 'sector'
                  ? createIconHudSector(iz, accentColor)
                  : createIconHudRoutes(iz, accentColor);
        ic.position.set(4 + (iconSocketW - 2 - iz) / 2, (h - iz) / 2);
        root.addChild(ic);
    }

    // Top accent strip (inset from rounded ends)
    const accentLine = new Graphics();
    accentLine.roundRect(r / 2, 0, width - r, 2, 1);
    accentLine.fill({ color: accentColor, alpha: 0.52 });
    root.addChild(accentLine);

    // Micro-label
    const lab = new Text({ text: label, style: hudLabelStyle() });
    lab.position.set(textX, 5);
    root.addChild(lab);

    // Value (keep as last Text child for MainMenuScreen chip value refs)
    const val = new Text({ text: value, style: hudValueStyle(accentColor) });
    val.position.set(textX, 17);
    root.addChild(val);

    return root;
}

// ─── Segmented pilot status strip ────────────────────────────────────────────

/**
 * Replaces the flat STATUS slab.
 *
 * Segments (left → right):
 *   [circular rank badge] | [PILOT / rank name] | [──bar──] | [1/20 ROUTES]
 *
 * The circular badge gives this strip shape variety vs the rectangular panels.
 */
export function createPilotStatusStrip(
    width: number,
    opts: { maxUnlocked: number; unlockedCount: number; totalLevels: number },
): Container {
    const { maxUnlocked, unlockedCount, totalLevels } = opts;
    const h    = 48;
    const rank = getPilotRank(maxUnlocked);
    const root = new Container();

    // ── Backplate ──────────────────────────────────────────────────────────
    const bg = new Graphics();
    bg.roundRect(0, 0, width, h, 10);
    bg.fill({ color: 0x060c18, alpha: 0.90 });
    bg.stroke({ color: 0x253548, width: 1, alpha: 0.75 });
    root.addChild(bg);

    const topLine = new Graphics();
    topLine.roundRect(22, 0, width - 44, 1.5, 1);
    topLine.fill({ color: GAME_COLORS.primary, alpha: 0.18 });
    root.addChild(topLine);

    // ── Circular rank badge (left anchor — shape variety) ─────────────────
    const badgeR  = 17;
    const badgeCX = 14 + badgeR;
    const badgeCY = h / 2;

    const badgeBg = new Graphics();
    badgeBg.circle(badgeCX, badgeCY, badgeR);
    badgeBg.fill({ color: 0x0a1820, alpha: 0.95 });
    badgeBg.stroke({ color: GAME_COLORS.primary, width: 1.5, alpha: 0.65 });
    root.addChild(badgeBg);

    const wingEm = createIconPilotClassWings(badgeR * 2);
    wingEm.position.set(badgeCX - badgeR, badgeCY - badgeR);
    root.addChild(wingEm);

    const initial = rank.charAt(0);
    const initText = new Text({
        text:  initial,
        style: {
            fill:       GAME_COLORS.primary,
            fontSize:   13,
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.arcade,
        },
    });
    initText.anchor.set(0.5);
    initText.position.set(badgeCX, badgeCY + 0.5);
    root.addChild(initText);

    // Segment separator after badge
    const sep1 = new Graphics();
    sep1.moveTo(badgeCX + badgeR + 6, 8).lineTo(badgeCX + badgeR + 6, h - 8);
    sep1.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.18 });
    root.addChild(sep1);

    // ── Left text block: PILOT label + rank name ──────────────────────────
    const textX = badgeCX + badgeR + 12;
    const pilotLabel = new Text({ text: 'PILOT', style: hudLabelStyle() });
    pilotLabel.position.set(textX, 8);
    root.addChild(pilotLabel);

    const rankText = new Text({ text: rank, style: pilotRankStyle() });
    rankText.position.set(textX, 22);
    root.addChild(rankText);

    // ── Right block: route count ──────────────────────────────────────────
    const routesText = new Text({
        text:  `${unlockedCount}/${totalLevels}`,
        style: hudValueStyle(GAME_COLORS.accent_gold),
    });
    routesText.anchor.set(1, 0.5);
    routesText.position.set(width - 10, h / 2);
    root.addChild(routesText);

    const routesLabel = new Text({ text: 'ROUTES', style: hudLabelStyle() });
    routesLabel.anchor.set(1, 0.5);
    routesLabel.position.set(width - 10 - routesText.width - 6, h / 2);
    root.addChild(routesLabel);

    // Segment separator before routes
    const routesZoneX = width - 10 - routesText.width - routesLabel.width - 16;
    const sep2 = new Graphics();
    sep2.moveTo(routesZoneX, 8).lineTo(routesZoneX, h - 8);
    sep2.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.18 });
    root.addChild(sep2);

    // ── Progress bar (center zone) ────────────────────────────────────────
    const barX  = textX + Math.max(rankText.width, pilotLabel.width) + 10;
    const barW  = Math.max(32, routesZoneX - barX - 8);
    const barH  = 6;
    const barY  = (h - barH) / 2;
    const prog  = totalLevels > 0 ? Math.min(1, unlockedCount / totalLevels) : 0;

    let barKenney = false;
    if (velocityUiArtReady()) {
        const tr = getVelocityUiTexture('slide_track');
        const fl = getVelocityUiTexture('slide_fill');
        if (tr && fl) {
            barKenney = true;
            const track = new Sprite(tr);
            track.position.set(barX, barY);
            track.width = barW;
            track.height = barH;
            track.tint = 0x1a3048;
            track.alpha = 0.85;
            root.addChild(track);
            if (prog > 0) {
                const fillW = Math.max(4, (barW - 2) * prog);
                const fillS = new Sprite(fl);
                fillS.position.set(barX + 1, barY + 1);
                fillS.width = fillW;
                fillS.height = barH - 2;
                fillS.tint = GAME_COLORS.primary;
                fillS.alpha = 0.88;
                root.addChild(fillS);
            }
        }
    }
    if (!barKenney) {
        const barBg = new Graphics();
        barBg.roundRect(barX, barY, barW, barH, 3);
        barBg.fill({ color: 0x0a1c2e, alpha: 0.92 });
        barBg.stroke({ color: 0x1a3a55, width: 1, alpha: 0.70 });
        root.addChild(barBg);
        if (prog > 0) {
            const fillW  = Math.max(4, (barW - 2) * prog);
            const fill   = new Graphics();
            fill.roundRect(barX + 1, barY + 1, fillW, barH - 2, 2);
            fill.fill({ color: GAME_COLORS.primary, alpha: 0.88 });
            root.addChild(fill);
        }
    }

    // Slot 10 — route track markers (nodes only, Family A)
    const nPips = Math.min(5, Math.max(3, Math.floor(barW / 14)));
    const denom   = Math.max(1, nPips - 1);
    for (let i = 0; i < nPips; i++) {
        const px = barX + 3 + (i * (barW - 6)) / denom;
        const t  = i / denom;
        const lit = prog > 0 && t <= prog + 0.08;
        const pip = new Graphics();
        pip.circle(px, barY + barH / 2, 1.5);
        pip.fill({ color: GAME_COLORS.primary, alpha: lit ? 0.58 : 0.18 });
        root.addChild(pip);
    }

    return root;
}

// ─── Info pill ────────────────────────────────────────────────────────────────

/** Capsule info pill (fully rounded). Text is helperTextStyle. */
export function createInfoPill(text: string, maxWidth: number): Container {
    const root = new Container();
    const padX = 10;
    const padY = 4;
    const t    = new Text({ text, style: helperTextStyle() });
    const w    = Math.min(maxWidth, t.width + padX * 2);
    const h    = t.height + padY * 2;
    const g    = new Graphics();
    g.roundRect(0, 0, w, h, h / 2);  // capsule
    g.fill({ color: 0x0d1e30, alpha: 0.72 });
    g.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.32 });
    root.addChild(g);
    t.position.set(padX, padY);
    root.addChild(t);
    return root;
}

// ─── Avatar / pilot badge ─────────────────────────────────────────────────────

/** Pilot insignia ring + wing pips + initial (slot 4 — identity, Family A). */
export function createAvatarBadge(size: number, initial: string = 'V'): Container {
    const root = new Container();
    root.addChild(createAvatarWingRing(size));

    const cx = size / 2;
    const cy = size / 2;
    const letter = new Text({
        text:  initial,
        style: {
            fill:       GAME_COLORS.primary,
            fontSize:   Math.floor(size * 0.40),
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

// ─── Hero panel (kept for backward-compat — MainMenuScreen now uses buildHeroModule) ─

/** @deprecated Use buildHeroModule from menuHeroComposer instead. */
export function createHeroPanel(
    width:  number,
    height: number,
): { root: Container; content: Container } {
    const root = new Container();
    const pair = createKenneyFramedPanelWithContent(width, height);

    if (pair) {
        pair.root.alpha = 0.96;
        pair.root.tint  = 0x2e3f55;
        const innerW = Math.max(80, width - 44);
        const innerH = Math.max(60, height - 48);
        const glowLine = new Graphics();
        glowLine.roundRect(0, innerH * 0.84, innerW, 2, 1);
        glowLine.fill({ color: GAME_COLORS.primary, alpha: 0.25 });
        pair.content.addChildAt(glowLine, 0);
        root.addChild(pair.root);
        return { root, content: pair.content };
    }

    const g = new Graphics();
    g.roundRect(0, 0, width, height, 14);
    g.fill({ color: 0x121e30, alpha: 0.95 });
    g.stroke({ color: GAME_COLORS.primary, width: 2, alpha: 0.55 });
    root.addChild(g);
    const shine = new Graphics();
    shine.roundRect(8, 2, width - 16, 2, 1);
    shine.fill({ color: 0x55eedd, alpha: 0.38 });
    root.addChild(shine);
    const content = new Container();
    content.position.set(18, 16);
    root.addChild(content);
    return { root, content };
}

// ─── Stats strip backplate (backward-compat) ─────────────────────────────────

/** @deprecated Use createPilotStatusStrip. */
export function createStatsStripBackplate(width: number, height: number): Container {
    const root = new Container();
    const pair = createKenneyFramedPanelWithContent(width, height);
    if (pair) { pair.root.alpha = 0.88; pair.root.tint = 0x1e2d40; root.addChild(pair.root); return root; }
    const g = new Graphics();
    g.roundRect(0, 0, width, height, 10);
    g.fill({ color: 0x080f1a, alpha: 0.88 });
    g.stroke({ color: 0x253548, width: 1, alpha: 0.55 });
    root.addChild(g);
    return root;
}

// ─── Settings dock (compact utility rail) ─────────────────────────────────────

/**
 * Finished bottom utility: split rail with gear socket + label capsule + status ticks.
 * Reads as cockpit systems, not an empty footer slab.
 */
export function createSettingsDock(
    label:   string,
    onClick: () => void,
    width:   number,
): Container {
    const root = new Container();
    root.eventMode = 'static';
    root.cursor    = 'pointer';
    const h = 34;
    const r = h / 2;

    const rail = new Graphics();
    rail.roundRect(0, 0, width, h, r);
    rail.fill({ color: 0x060c14, alpha: 0.88 });
    rail.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.22 });
    rail.eventMode = 'none';
    root.addChild(rail);

    const inner = new Graphics();
    inner.roundRect(2, 2, width - 4, h - 4, r - 1);
    inner.stroke({ color: 0x1a3044, width: 1, alpha: 0.55 });
    inner.eventMode = 'none';
    root.addChild(inner);

    const socketW = 36;
    const socket = new Graphics();
    socket.roundRect(2, 2, socketW, h - 4, 6);
    socket.fill({ color: 0x0a1520, alpha: 0.95 });
    socket.stroke({ color: 0x2a4a62, width: 1, alpha: 0.65 });
    socket.eventMode = 'none';
    root.addChild(socket);

    const gx = 2 + socketW / 2;
    const gy = h / 2;
    const gear = createIconSettingsGear(gx, gy, 11, 0x88aacc, 0.62);
    gear.eventMode = 'none';
    root.addChild(gear);

    const capW = Math.min(width - socketW - 18, 160);
    const capX = socketW + 8;
    const cap = new Graphics();
    cap.roundRect(capX, 5, capW, h - 10, (h - 10) / 2);
    cap.fill({ color: 0xffffff, alpha: 0.04 });
    cap.stroke({ color: 0x334c60, width: 1, alpha: 0.5 });
    cap.eventMode = 'none';
    root.addChild(cap);

    const t = new Text({ text: label, style: footerUtilityLabelStyle() });
    t.anchor.set(0, 0.5);
    t.position.set(capX + 12, h / 2);
    root.addChild(t);

    const stop = (e: FederatedPointerEvent) => e.stopPropagation();
    root.on('pointerdown',     (e: FederatedPointerEvent) => { stop(e); root.alpha = 0.82; });
    root.on('pointerup',       (e: FederatedPointerEvent) => { stop(e); root.alpha = 1.0;  onClick(); });
    root.on('pointerupoutside',() => { root.alpha = 1.0; });
    root.on('pointercancel',   () => { root.alpha = 1.0; });

    return root;
}

/** @deprecated Use createSettingsDock for main menu footer. */
export function createUtilityRow(
    label:   string,
    onClick: () => void,
    width:   number,
): Container {
    return createSettingsDock(label, onClick, width);
}
