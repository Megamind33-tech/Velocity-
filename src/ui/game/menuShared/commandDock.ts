/**
 * Cross-orientation command dock — one system for portrait + landscape.
 * Same cell logic, channel wells, active cue bar; only layout width/height vary.
 */

import { Container, FederatedPointerEvent, Graphics, Text, TextStyle } from 'pixi.js';

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
    /** Portrait anim / parity — optional cradle graphics */
    dockCradles: Graphics[];
    slotContainers: Container[];
    labels: Text[];
} {
    const root = new Container();
    if (kenneyUnderlay) {
        kenneyUnderlay.alpha = underlayAlpha;
        root.addChild(kenneyUnderlay);
    }

    const deckR = Math.max(12, Math.floor(H * 0.18));
    const deck = new Graphics();
    deck.roundRect(0, 0, cw, H, deckR);
    deck.fill({ color: palette.dockDeck, alpha: 1 });
    deck.stroke({ color: palette.dockDeckRim, width: 1.5, alpha: 0.85 });
    root.addChild(deck);
    const deckTop = new Graphics();
    deckTop.roundRect(2, 2, cw - 4, Math.floor(H * 0.4), Math.max(8, deckR - 4));
    deckTop.fill({ color: palette.dockDeckTop, alpha: 0.35 });
    root.addChild(deckTop);
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
    const dockCradles: Graphics[] = [];
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
        const cradle = new Graphics();
        cradle.roundRect(margin + 3, cradleTop, cellW - 6, H - cradleTop * 2, 9);
        dockCradles.push(cradle);
        slot.addChild(cradle);

        const vecG = new Graphics();
        it.draw(vecG, cx, H * (H >= 80 ? 0.34 : 0.35), iconSize);
        slot.addChild(vecG);

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
        });
        slotContainers.forEach((ch, idx) => {
            const on = idx === i;
            const vecG = ch.children[3] as Graphics;
            vecG.tint = on ? palette.accentCyan : palette.inactiveIconTint;
            const label = ch.children[4] as Text;
            label.style = new TextStyle({
                fontFamily,
                fontSize: labelFs,
                fontWeight: on ? '800' : '700',
                fill: on ? palette.accentCyan : palette.labelIdle,
                letterSpacing: on ? 1.2 : 1.05,
            });
            ch.position.y = on ? -2 : 0;
        });
    }
    setActive(0);
    return { root, setActive, dockCradles, slotContainers, labels };
}
