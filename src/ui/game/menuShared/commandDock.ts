/**
 * Cross-orientation command dock — one system for portrait + landscape.
 * Same cell logic, channel wells, active cue bar; only layout width/height vary.
 */

import { Container, FederatedPointerEvent, Graphics, NineSliceSprite, Sprite, Text, TextStyle } from 'pixi.js';
import { getVelocityUiTexture, type VelocityUiTextureKey } from '../velocityUiArt';
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';

export type CommandDockPalette = {
    dockDeck: number;
    dockDeckRim: number;
    dockDeckTop: number;
    dockChannel: number;
    dockBolt: number;
    dockCellIdle: number;
    dockCellIdleRim: number;
    dockCellActive: number;
    dockCellActiveRim: number;
    accentCyan: number;
    inactiveIconTint: number;
    labelIdle: number;
    labelActive: number;
};

function pressDockSlot(root: Container, onUp: () => void): void {
    root.eventMode = 'static';
    root.cursor = 'pointer';
    const stop = (e: FederatedPointerEvent) => e.stopPropagation();
    root.on('pointerdown', (e) => {
        stop(e);
        root.scale.set(0.97);
    });
    root.on('pointerup', (e) => {
        stop(e);
        root.scale.set(1);
        onUp();
    });
    root.on('pointerupoutside', () => root.scale.set(1));
    root.on('pointercancel', () => root.scale.set(1));
}

export type CommandDockItem = {
    label: string;
    onTap: () => void;
    draw: (g: Graphics, cx: number, cy: number, s: number) => void;
    /** Kenney menu icon — primary; vector draw is fallback only. */
    menuIconKey?: VelocityUiTextureKey;
    /** Multiplier on dock `iconSize` when using a sprite (e.g. wide silhouettes). */
    menuIconScale?: number;
    /**
     * Full-color raster icons (e.g. OpenGameArt): skip heavy cyan/gray tint so art reads clearly.
     * Uses white tint + alpha for idle/active hierarchy instead.
     */
    menuIconFullColor?: boolean;
};

export function buildCommandDock(
    cw: number,
    H: number,
    palette: CommandDockPalette,
    fontFamily: string,
    items: CommandDockItem[],
    kenneyUnderlay: Container | null,
    underlayAlpha: number,
): {
    root: Container;
    setActive: (i: number) => void;
    /** Portrait anim / parity — cradle plates (nine-slice when textures load) */
    dockCradles: (Graphics | NineSliceSprite)[];
    slotContainers: Container[];
    labels: Text[];
} {
    const root = new Container();
    if (kenneyUnderlay) {
        kenneyUnderlay.alpha = underlayAlpha;
        root.addChild(kenneyUnderlay);
    }

    const deckR = Math.max(12, Math.floor(H * 0.18));
    const sciDeck = getVelocityUiTexture('scifi_panel_rectangle_screws');
    const deckTex = sciDeck ?? getVelocityUiTexture('panel_fill');
    const BS = VELOCITY_UI_SLICE.scifiButton;
    const PS = VELOCITY_UI_SLICE.panel;
    const dL = sciDeck ? BS.L : PS.L;
    const dR = sciDeck ? BS.R : PS.R;
    const dT = sciDeck ? BS.T : PS.T;
    const dB = sciDeck ? BS.B : PS.B;
    if (deckTex) {
        const deck = new NineSliceSprite({
            texture: deckTex,
            leftWidth: dL,
            rightWidth: dR,
            topHeight: dT,
            bottomHeight: dB,
            width: cw,
            height: H,
        });
        deck.tint = palette.dockDeck;
        deck.alpha = 0.98;
        root.addChild(deck);
        const glossTex = getVelocityUiTexture('panel_fill');
        if (glossTex) {
            const deckTop = new NineSliceSprite({
                texture: glossTex,
                leftWidth: PS.L,
                rightWidth: PS.R,
                topHeight: PS.T,
                bottomHeight: PS.B,
                width: cw - 6,
                height: Math.max(8, Math.floor(H * 0.38)),
            });
            deckTop.position.set(3, 3);
            deckTop.tint = palette.dockDeckTop;
            deckTop.alpha = 0.32;
            root.addChild(deckTop);
        }
    } else {
        const deck = new Graphics();
        deck.roundRect(0, 0, cw, H, deckR);
        deck.fill({ color: palette.dockDeck, alpha: 1 });
        deck.stroke({ color: palette.dockDeckRim, width: 1.5, alpha: 0.85 });
        root.addChild(deck);
        const deckTop = new Graphics();
        deckTop.roundRect(2, 2, cw - 4, Math.floor(H * 0.4), Math.max(8, deckR - 4));
        deckTop.fill({ color: palette.dockDeckTop, alpha: 0.35 });
        root.addChild(deckTop);
    }
    const bevel = new Graphics();
    bevel.rect(0, 0, cw, 3);
    bevel.fill({ color: 0xffffff, alpha: 0.04 });
    root.addChild(bevel);
    const rivL = new Graphics();
    rivL.circle(10, H / 2, 2.5);
    rivL.fill({ color: palette.dockBolt, alpha: 0.55 });
    root.addChild(rivL);
    const rivR = new Graphics();
    rivR.circle(cw - 10, H / 2, 2.5);
    rivR.fill({ color: palette.dockBolt, alpha: 0.55 });
    root.addChild(rivR);

    const n = items.length;
    const slotW = cw / n;
    const margin = Math.max(4, Math.min(7, Math.floor(Math.min(cw, H) * 0.01)));
    const dockCradles: (Graphics | NineSliceSprite)[] = [];
    const sciCradleIdle = getVelocityUiTexture('scifi_button_rectangle');
    const cradleTex = sciCradleIdle ?? getVelocityUiTexture('button_secondary');
    const cradleBS = sciCradleIdle ? BS : VELOCITY_UI_SLICE.button;
    const cradleActiveTex =
        getVelocityUiTexture('scifi_button_rectangle_depth') ?? sciCradleIdle ?? getVelocityUiTexture('button_primary');
    const slotContainers: Container[] = [];
    const labels: Text[] = [];
    const iconSize = H >= 80 ? 24 : 22;
    const labelY = H - (H >= 80 ? 22 : 20);
    const labelFs = H >= 80 ? 9 : 8;
    items.forEach((it, i) => {
        const slot = new Container();
        slot.position.set(i * slotW, 0);
        const cx = slotW / 2;
        const cellW = slotW - margin * 2;

        const channel = new Graphics();
        const chTop = H >= 80 ? 5 : 5;
        channel.roundRect(margin, chTop, cellW, H - chTop * 2, 10);
        channel.fill({ color: palette.dockChannel, alpha: 0.94 });
        channel.stroke({ color: 0x000000, width: 1, alpha: 0.42 });
        slot.addChild(channel);

        const channelFace = new Graphics();
        channelFace.roundRect(margin + 2, chTop + 2, cellW - 4, Math.max(8, Math.floor((H - chTop * 2) * 0.22)), 6);
        channelFace.fill({ color: 0x0a121c, alpha: 0.55 });
        slot.addChild(channelFace);

        const cradleTop = H >= 80 ? 8 : 7;
        const cwC = cellW - 6;
        const chC = H - cradleTop * 2;
        let cradle: Graphics | NineSliceSprite;
        if (cradleTex && cwC >= 24 && chC >= 20) {
            const ns = new NineSliceSprite({
                texture: cradleTex,
                leftWidth: cradleBS.L,
                rightWidth: cradleBS.R,
                topHeight: cradleBS.T,
                bottomHeight: cradleBS.B,
                width: cwC,
                height: chC,
            });
            ns.position.set(margin + 3, cradleTop);
            ns.alpha = 0.62;
            ns.tint = palette.dockCellIdle;
            cradle = ns;
        } else {
            const g = new Graphics();
            g.roundRect(margin + 3, cradleTop, cwC, chC, 9);
            cradle = g;
        }
        dockCradles.push(cradle);
        slot.addChild(cradle);

        const iconLayer = new Container();
        const iconCy = H * (H >= 80 ? 0.34 : 0.35);
        const tex = it.menuIconKey ? getVelocityUiTexture(it.menuIconKey) : undefined;
        if (tex) {
            const sp = new Sprite(tex);
            sp.anchor.set(0.5);
            const scale = it.menuIconScale ?? 1;
            sp.width = iconSize * scale;
            sp.height = iconSize * scale;
            sp.position.set(cx, iconCy);
            if (it.menuIconFullColor) {
                sp.tint = 0xffffff;
                sp.alpha = 0.82;
            } else {
                sp.alpha = 0.95;
            }
            iconLayer.addChild(sp);
        } else {
            const vecG = new Graphics();
            it.draw(vecG, cx, iconCy, iconSize);
            iconLayer.addChild(vecG);
        }
        slot.addChild(iconLayer);

        const t = new Text({
            text: it.label,
            style: new TextStyle({
                fontFamily,
                fontSize: labelFs,
                fontWeight: '700',
                fill: palette.labelIdle,
                letterSpacing: 1.05,
            }),
        });
        t.anchor.set(0.5, 0);
        t.position.set(cx, labelY);
        slot.addChild(t);
        labels.push(t);

        pressDockSlot(slot, it.onTap);
        root.addChild(slot);
        slotContainers.push(slot);
    });

    function setActive(i: number): void {
        const slotW2 = cw / n;
        dockCradles.forEach((cr, idx) => {
            const cellW = slotW2 - margin * 2;
            const on = idx === i;
            const cradleTop = H >= 80 ? 8 : 7;
            if (cr instanceof NineSliceSprite) {
                cr.texture = on && cradleActiveTex ? cradleActiveTex : cradleTex!;
                cr.tint = on ? palette.dockCellActive : palette.dockCellIdle;
                cr.alpha = on ? 0.96 : 0.72;
            } else {
                cr.clear();
                cr.roundRect(margin + 3, cradleTop, cellW - 6, H - cradleTop * 2, 9);
                cr.fill({
                    color: on ? palette.dockCellActive : palette.dockCellIdle,
                    alpha: on ? 0.97 : 0.62,
                });
                cr.stroke({
                    color: on ? palette.dockCellActiveRim : palette.dockCellIdleRim,
                    width: on ? 2.25 : 1,
                    alpha: on ? 0.82 : 0.4,
                });
                if (on) {
                    cr.roundRect(margin + 7, cradleTop + 2, cellW - 14, 2, 1);
                    cr.fill({ color: palette.accentCyan, alpha: 0.5 });
                    cr.roundRect(margin + 6, H - cradleTop - 5, cellW - 12, 2, 1);
                    cr.fill({ color: palette.accentCyan, alpha: 0.22 });
                }
            }
        });
        slotContainers.forEach((ch, idx) => {
            const on = idx === i;
            const iconLayer = ch.children[3] as Container;
            const firstIcon = iconLayer.children[0];
            const item = items[idx];
            const fullColor = item?.menuIconFullColor === true;
            if (firstIcon instanceof Sprite) {
                if (fullColor) {
                    firstIcon.tint = 0xffffff;
                    firstIcon.alpha = on ? 1 : 0.78;
                } else {
                    firstIcon.alpha = 0.95;
                    firstIcon.tint = on ? palette.accentCyan : palette.inactiveIconTint;
                }
            } else if (firstIcon instanceof Graphics) {
                firstIcon.tint = on ? palette.accentCyan : palette.inactiveIconTint;
            }
            const label = ch.children[4] as Text;
            label.style = new TextStyle({
                fontFamily,
                fontSize: labelFs,
                fontWeight: on ? '800' : '700',
                fill: on ? palette.labelActive : palette.labelIdle,
                letterSpacing: on ? 1.2 : 1.05,
            });
            ch.position.y = on ? -2 : 0;
        });
    }
    setActive(0);
    return { root, setActive, dockCradles, slotContainers, labels };
}
