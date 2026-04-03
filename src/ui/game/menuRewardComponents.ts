/**
 * menuRewardComponents — economy / reward buttons with icon sockets.
 *
 * Layout: [icon socket | label zone]
 *   - icon socket: square zone, full button height, contains coin/star icon
 *   - label zone: main label (bold) + sub-label (smaller) stacked
 *
 * These replace plain orange rectangles with value-communicating,
 * system-rich reward affordances.
 *
 * All icons are pure PixiJS Graphics — no new art required.
 */

import { Container, FederatedPointerEvent, Graphics, Text } from 'pixi.js';
import { GAME_COLORS, GAME_FONTS } from './GameUITheme';
import { economyButtonLabelStyle, hudLabelStyle } from './menuTextStyles';

// ─── Icon factories ───────────────────────────────────────────────────────────

/** Coin — filled gold disc with inner ring + top-left highlight arc. */
function createCoinIcon(size: number): Container {
    const root = new Container();
    const cx   = size / 2;
    const cy   = size / 2;
    const r    = size / 2 - 1;

    // Outer disc
    const outer = new Graphics();
    outer.circle(cx, cy, r);
    outer.fill({ color: 0xffcc00, alpha: 0.92 });
    outer.stroke({ color: 0xffe44d, width: 1, alpha: 0.75 });
    root.addChild(outer);

    // Inner ring (value depth)
    const inner = new Graphics();
    inner.circle(cx, cy, r * 0.60);
    inner.stroke({ color: 0xffaa00, width: 1.5, alpha: 0.55 });
    root.addChild(inner);

    // Top-left highlight arc
    const hl = new Graphics();
    hl.arc(cx, cy, r * 0.72, -Math.PI * 0.88, -Math.PI * 0.42);
    hl.stroke({ color: 0xffff99, width: 2, alpha: 0.48 });
    root.addChild(hl);

    return root;
}

/** Star — 5-point, filled gold, highlight center dot. */
function createStarIcon(size: number): Container {
    const root   = new Container();
    const cx     = size / 2;
    const cy     = size / 2;
    const outerR = size / 2 - 1;
    const innerR = outerR * 0.42;
    const pts    = 5;

    const star = new Graphics();
    for (let i = 0; i < pts * 2; i++) {
        const angle = (i * Math.PI) / pts - Math.PI / 2;
        const r     = i % 2 === 0 ? outerR : innerR;
        const x     = cx + Math.cos(angle) * r;
        const y     = cy + Math.sin(angle) * r;
        if (i === 0) star.moveTo(x, y);
        else         star.lineTo(x, y);
    }
    star.closePath();
    star.fill({ color: 0xffcc44, alpha: 0.94 });
    star.stroke({ color: 0xffe066, width: 1, alpha: 0.65 });
    root.addChild(star);

    // Center highlight dot
    const dot = new Graphics();
    dot.circle(cx, cy, outerR * 0.16);
    dot.fill({ color: 0xfffff8, alpha: 0.52 });
    root.addChild(dot);

    return root;
}

// ─── Reward button ────────────────────────────────────────────────────────────

export type RewardButtonType = 'store' | 'rewards';

const SUB_LABELS: Record<RewardButtonType, string> = {
    store:   'BROWSE',
    rewards: 'COLLECT',
};

/**
 * Economy reward button — split icon socket + label zone.
 *
 * Visual hierarchy:
 *   - icon socket: darker, clearly separated, contains symbolic icon
 *   - main label:  bold, warm-white (economyButtonLabelStyle)
 *   - sub-label:   muted hudLabelStyle — "BROWSE" / "COLLECT"
 *   - border:      gold, stronger than generic utility buttons
 *   - top shine:   warm highlight band
 *   - divider:     vertical separator between icon zone and label zone
 */
export function createRewardButton(
    type:    RewardButtonType,
    label:   string,
    onClick: () => void,
    width:   number,
    height:  number = 46,
): Container {
    const root      = new Container();
    root.eventMode  = 'static';
    root.cursor     = 'pointer';

    const iconZoneW = height;          // square icon zone — full button height
    const r         = 8;              // corner radius
    const borderCol = 0xffcc44;

    // ── Base fill ──────────────────────────────────────────────────────────
    const base = new Graphics();
    base.roundRect(0, 0, width, height, r);
    base.fill({ color: type === 'store' ? 0x150d00 : 0x110900, alpha: 0.97 });
    base.eventMode = 'none';
    root.addChild(base);

    // ── Icon socket (darker, distinct zone) ───────────────────────────────
    const socketBg = new Graphics();
    socketBg.roundRect(0, 0, iconZoneW, height, r);
    socketBg.fill({ color: type === 'store' ? 0x1e1100 : 0x180e00, alpha: 1.0 });
    socketBg.eventMode = 'none';
    root.addChild(socketBg);

    // ── Vertical divider between icon zone and label zone ─────────────────
    const divider = new Graphics();
    divider
        .moveTo(iconZoneW, 5)
        .lineTo(iconZoneW, height - 5);
    divider.stroke({ color: borderCol, width: 1, alpha: 0.30 });
    divider.eventMode = 'none';
    root.addChild(divider);

    // ── Outer border ──────────────────────────────────────────────────────
    const border = new Graphics();
    border.roundRect(1, 1, width - 2, height - 2, r - 1);
    border.stroke({ color: borderCol, width: 1.5, alpha: 0.65 });
    border.eventMode = 'none';
    root.addChild(border);

    // ── Top shine strip ───────────────────────────────────────────────────
    const shine = new Graphics();
    shine.roundRect(6, 2, width - 12, 2, 1);
    shine.fill({ color: 0xffe077, alpha: 0.46 });
    shine.eventMode = 'none';
    root.addChild(shine);

    // ── Inner socket top-shine (icon zone only) ───────────────────────────
    const socketShine = new Graphics();
    socketShine.roundRect(4, 2, iconZoneW - 8, 1.5, 1);
    socketShine.fill({ color: 0xffcc44, alpha: 0.28 });
    socketShine.eventMode = 'none';
    root.addChild(socketShine);

    // ── Icon ──────────────────────────────────────────────────────────────
    const iconSize = Math.floor(height * 0.52);
    const icon     = type === 'store' ? createCoinIcon(iconSize) : createStarIcon(iconSize);
    icon.position.set(
        Math.floor((iconZoneW - iconSize) / 2),
        Math.floor((height  - iconSize) / 2),
    );
    root.addChild(icon);

    // ── Label zone: main label + sub-label ───────────────────────────────
    const labelZoneCX = iconZoneW + (width - iconZoneW) / 2;

    const mainLabel = new Text({ text: label, style: economyButtonLabelStyle() });
    mainLabel.anchor.set(0.5, 1);
    mainLabel.position.set(labelZoneCX, height / 2 + 1);
    root.addChild(mainLabel);

    const subLabel = new Text({
        text:  SUB_LABELS[type],
        style: hudLabelStyle(),
    });
    subLabel.anchor.set(0.5, 0);
    subLabel.position.set(labelZoneCX, height / 2 + 4);
    root.addChild(subLabel);

    // ── Interaction states ────────────────────────────────────────────────
    const stop = (e: FederatedPointerEvent) => e.stopPropagation();
    root.on('pointerdown',     (e: FederatedPointerEvent) => { stop(e); root.scale.set(0.97); });
    root.on('pointerup',       (e: FederatedPointerEvent) => { stop(e); root.scale.set(1.0);  onClick(); });
    root.on('pointerupoutside',() => root.scale.set(1.0));
    root.on('pointercancel',   () => root.scale.set(1.0));

    return root;
}
