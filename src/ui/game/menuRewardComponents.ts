/**
 * menuRewardComponents — economy / reward buttons with icon sockets.
 *
 * Layout: [icon socket | label zone]
 *   - icon socket: square zone, full button height — store module / rewards cache pod (Family B)
 *   - label zone: main label (bold) + sub-label (smaller) stacked
 *
 * These replace plain orange rectangles with value-communicating,
 * system-rich reward affordances.
 *
 * All icons are pure PixiJS Graphics — no new art required.
 */

import { Container, FederatedPointerEvent, Graphics, Sprite, Text } from 'pixi.js';
import { GAME_FONTS } from './GameUITheme';
import { economyButtonLabelStyle, hudLabelStyle } from './menuTextStyles';
import { createIconRewardsCachePod, createIconStoreModule } from './menuFrontMenuIcons';
import { getVelocityUiTexture, velocityUiArtReady } from './velocityUiArt';

// ─── Reward button ────────────────────────────────────────────────────────────

export type RewardButtonType = 'store' | 'rewards';

const SUB_LABELS: Record<RewardButtonType, string> = {
    store:   'GEAR · UPGRADES',
    rewards: 'CACHES · DROPS',
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

    // ── Icon socket — Kenney input outline when loaded ────────────────────
    let socketKenney = false;
    if (velocityUiArtReady()) {
        const st = getVelocityUiTexture('panel_frame');
        if (st) {
            const sock = new Sprite(st);
            sock.width = iconZoneW;
            sock.height = height;
            sock.tint = borderCol;
            sock.alpha = 0.42;
            sock.eventMode = 'none';
            root.addChild(sock);
            socketKenney = true;
        }
    }
    if (!socketKenney) {
        const socketBg = new Graphics();
        socketBg.roundRect(0, 0, iconZoneW, height, r);
        socketBg.fill({ color: type === 'store' ? 0x1e1100 : 0x180e00, alpha: 1.0 });
        socketBg.eventMode = 'none';
        root.addChild(socketBg);
    }

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
    const icon =
        type === 'store'
            ? createIconStoreModule(iconSize, borderCol)
            : createIconRewardsCachePod(iconSize, borderCol);
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

    const tier = new Text({
        text:  type === 'store' ? 'VENDOR' : 'LOOT',
        style: {
            fill:          borderCol,
            fontSize:      6,
            fontFamily:    GAME_FONTS.arcade,
            letterSpacing: 1,
        },
    });
    tier.alpha = 0.55;
    tier.anchor.set(0.5, 1);
    tier.position.set(labelZoneCX, height - 5);
    root.addChild(tier);

    // ── Interaction states ────────────────────────────────────────────────
    const stop = (e: FederatedPointerEvent) => e.stopPropagation();
    root.on('pointerdown',     (e: FederatedPointerEvent) => { stop(e); root.scale.set(0.97); });
    root.on('pointerup',       (e: FederatedPointerEvent) => { stop(e); root.scale.set(1.0);  onClick(); });
    root.on('pointerupoutside',() => root.scale.set(1.0));
    root.on('pointercancel',   () => root.scale.set(1.0));

    return root;
}
