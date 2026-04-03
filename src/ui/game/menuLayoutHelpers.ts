/**
 * Reusable Pixi menu layout primitives (game UI — not DOM).
 * Uses existing Kenney textures + Graphics overlays; portrait-first.
 */

import { Container, FederatedPointerEvent, Graphics, Text, TextStyle } from 'pixi.js';
import { createGameButton } from './GameUIComponents';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from './GameUITheme';
import { createKenneyFramedPanelWithContent } from './kenneyNineSlice';
import { createVelocityGameButton } from './velocityUiButtons';
import { velocityUiArtReady } from './velocityUiArt';

export type MenuButtonTier = 'cta' | 'secondary' | 'economy' | 'utility';

export const MENU_TIER_HEIGHT: Record<MenuButtonTier, number> = {
    cta: 56,
    secondary: 46,
    economy: 44,
    utility: 40,
};

/**
 * Menu action button with visual hierarchy by tier (width must be set by caller).
 */
export function createMenuButton(
    label: string,
    tier: MenuButtonTier,
    variant: 'primary' | 'secondary' | 'accent' | 'danger' | 'success',
    onClick: () => void,
    width: number
): Container {
    const h = MENU_TIER_HEIGHT[tier];
    const useArt = velocityUiArtReady();
    const btn =
        (useArt && createVelocityGameButton(label, variant, onClick, { width, height: h })) ||
        createGameButton(
            label,
            onClick,
            variant === 'success' ? 'success' : variant,
            tier === 'cta' ? 'large' : 'medium',
            { width, height: h }
        );
    if (tier === 'utility') {
        btn.alpha = 0.92;
    }
    if (tier === 'cta') {
        const overlay = new Graphics();
        overlay.roundRect(2, 2, width - 4, h - 4, 6);
        overlay.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.35 });
        overlay.eventMode = 'none';
        overlay.interactiveChildren = false;
        btn.addChild(overlay);
    }
    return btn;
}

/** Small HUD stat chip: dark backplate + label + value. */
export function createHudChip(label: string, value: string, width: number): Container {
    const root = new Container();
    const h = 34;
    const g = new Graphics();
    g.roundRect(0, 0, width, h, 8);
    g.fill({ color: GAME_COLORS.bg_darkest, alpha: 0.72 });
    g.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.45 });
    root.addChild(g);

    const lab = new Text({
        text: label,
        style: new TextStyle({
            fill: GAME_COLORS.text_muted,
            fontSize: GAME_SIZES.font.xs,
            fontFamily: GAME_FONTS.arcade,
        }),
    });
    lab.position.set(8, 4);
    root.addChild(lab);

    const val = new Text({
        text: value,
        style: new TextStyle({
            fill: GAME_COLORS.accent_gold,
            fontSize: GAME_SIZES.font.sm,
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.arcade,
        }),
    });
    val.position.set(8, 16);
    root.addChild(val);

    return root;
}

/** Compact info pill (e.g. status line inside hero). */
export function createInfoPill(text: string, maxWidth: number): Container {
    const root = new Container();
    const padX = 10;
    const padY = 5;
    const t = new Text({
        text,
        style: new TextStyle({
            fill: GAME_COLORS.text_secondary,
            fontSize: GAME_SIZES.font.xs,
            fontFamily: GAME_FONTS.arcade,
        }),
    });
    const w = Math.min(maxWidth, t.width + padX * 2);
    const h = t.height + padY * 2;
    const g = new Graphics();
    g.roundRect(0, 0, w, h, h / 2);
    g.fill({ color: 0x0a0a1a, alpha: 0.55 });
    g.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.3 });
    root.addChild(g);
    t.position.set(padX, padY);
    root.addChild(t);
    return root;
}

/** Circular pilot badge with initial (Kenney-style accent ring). */
export function createAvatarBadge(size: number, initial: string = 'V'): Container {
    const root = new Container();
    const g = new Graphics();
    g.circle(size / 2, size / 2, size / 2 - 2);
    g.fill({ color: GAME_COLORS.bg_dark, alpha: 0.95 });
    g.stroke({ color: GAME_COLORS.primary, width: 2, alpha: 0.85 });
    root.addChild(g);

    const letter = new Text({
        text: initial,
        style: new TextStyle({
            fill: GAME_COLORS.primary,
            fontSize: Math.floor(size * 0.42),
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.arcade,
        }),
    });
    letter.anchor.set(0.5);
    letter.position.set(size / 2, size / 2);
    root.addChild(letter);

    return root;
}

/** Horizontal strip with Kenney fill + optional frame; good for stats row. */
export function createStatsStripBackplate(width: number, height: number): Container {
    const root = new Container();
    const pair = createKenneyFramedPanelWithContent(width, height);
    if (pair) {
        pair.root.alpha = 0.9;
        pair.root.tint = 0x252540;
        root.addChild(pair.root);
        return root;
    }
    const g = new Graphics();
    g.roundRect(0, 0, width, height, 10);
    g.fill({ color: GAME_COLORS.panel_bg, alpha: 0.88 });
    g.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.4 });
    root.addChild(g);
    return root;
}

/**
 * Hero panel: framed interior + optional inner glow bar (Graphics only).
 * Returns { root, content } where content is the framed inner area for title/subtitle/chips.
 */
export function createHeroPanel(width: number, height: number): { root: Container; content: Container } {
    const root = new Container();
    const pair = createKenneyFramedPanelWithContent(width, height);
    if (pair) {
        pair.root.alpha = 0.94;
        pair.root.tint = 0x303050;
        const innerW = Math.max(80, width - 44);
        const innerH = Math.max(60, height - 48);
        const glow = new Graphics();
        glow.roundRect(0, innerH * 0.62, innerW, 3, 1);
        glow.fill({ color: GAME_COLORS.primary, alpha: 0.22 });
        pair.content.addChildAt(glow, 0);
        root.addChild(pair.root);
        return { root, content: pair.content };
    }
    const g = new Graphics();
    g.roundRect(0, 0, width, height, 14);
    g.fill({ color: GAME_COLORS.bg_dark, alpha: 0.92 });
    g.stroke({ color: GAME_COLORS.primary, width: 2, alpha: 0.55 });
    root.addChild(g);
    const content = new Container();
    content.position.set(18, 16);
    root.addChild(content);
    return { root, content };
}

/** Tappable text row (utility), e.g. settings. */
export function createUtilityRow(label: string, onClick: () => void, width: number): Container {
    const root = new Container();
    root.eventMode = 'static';
    root.cursor = 'pointer';
    const h = 36;
    const hit = new Graphics();
    hit.rect(0, 0, width, h);
    hit.fill({ color: 0xffffff, alpha: 0.04 });
    root.addChild(hit);

    const t = new Text({
        text: label,
        style: new TextStyle({
            fill: GAME_COLORS.text_secondary,
            fontSize: GAME_SIZES.font.sm,
            fontFamily: GAME_FONTS.arcade,
        }),
    });
    t.anchor.set(0.5, 0.5);
    t.position.set(width / 2, h / 2);
    root.addChild(t);

    const underline = new Graphics();
    underline.moveTo(width * 0.3, h - 6);
    underline.lineTo(width * 0.7, h - 6);
    underline.stroke({ color: GAME_COLORS.text_muted, width: 1, alpha: 0.35 });
    root.addChild(underline);

    const stop = (e: FederatedPointerEvent) => e.stopPropagation();
    root.on('pointerup', (e) => {
        stop(e);
        onClick();
    });
    return root;
}
