/**
 * Shared Kenney modal: starfield shell + dimmer + framed panel; title + body inside frame.
 */

import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES } from './GameUITheme';
import { createKenneyFramedPanelWithContent } from './kenneyNineSlice';
import { mountVelocityShell, resizeVelocityShell, type VelocityShellParts } from './velocityScreenShell';

/** Matches kenneyNineSlice framed panel inner margin (inset 10 + padding 12). */
export const VELOCITY_MODAL_INNER_PAD_X = 22;
const FRAME_INSET_Y = 24;

export function velocityModalInnerWidth(panelW: number): number {
    return Math.max(120, panelW - VELOCITY_MODAL_INNER_PAD_X * 2);
}

export type VelocityModalLayout = {
    shell: VelocityShellParts;
    panelRoot: Container;
    content: Container;
    body: Container;
    titleText: Text;
    panelW: number;
    panelH: number;
    innerW: number;
};

export function buildVelocityModal(
    parent: Container,
    app: Application,
    title: string,
    panelW: number,
    panelH: number,
    titleFill: number = GAME_COLORS.primary
): VelocityModalLayout {
    const shell = mountVelocityShell(parent, app, 0.82);

    const panelRoot = new Container();
    parent.addChild(panelRoot);

    const innerW = velocityModalInnerWidth(panelW);

    const pair = createKenneyFramedPanelWithContent(panelW, panelH);
    let content: Container;

    if (pair) {
        panelRoot.addChild(pair.root);
        content = pair.content;
    } else {
        const g = new Graphics();
        g.roundRect(0, 0, panelW, panelH, 12);
        g.fill({ color: GAME_COLORS.bg_dark, alpha: 0.96 });
        g.stroke({ color: GAME_COLORS.primary, width: 2, alpha: 0.8 });
        panelRoot.addChild(g);
        content = new Container();
        content.position.set(VELOCITY_MODAL_INNER_PAD_X, FRAME_INSET_Y);
        panelRoot.addChild(content);
    }

    const titleText = new Text({
        text: title,
        style: new TextStyle({
            fill: titleFill,
            fontSize: GAME_SIZES.font.xxl,      // 24px — up from 20px; modal authority
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.arcade,
            letterSpacing: 2,
            stroke: { color: GAME_COLORS.bg_darkest, width: 1.5 },
            dropShadow: { alpha: 0.65, blur: 3, color: GAME_COLORS.bg_darkest, distance: 2 },
        }),
    });
    titleText.anchor.set(0.5, 0);
    titleText.position.set(innerW / 2, 8);
    content.addChild(titleText);

    const bodyStartY = 8 + titleText.height + GAME_SIZES.spacing.md;
    const body = new Container();
    body.position.set(0, bodyStartY);
    content.addChild(body);

    const sw = app.screen.width;
    const sh = app.screen.height;
    panelRoot.position.set(sw / 2 - panelW / 2, sh / 2 - panelH / 2);

    return { shell, panelRoot, content, body, titleText, panelW, panelH, innerW };
}

export function repositionVelocityModal(layout: VelocityModalLayout, screenW: number, screenH: number): void {
    layout.panelRoot.position.set(screenW / 2 - layout.panelW / 2, screenH / 2 - layout.panelH / 2);
    layout.titleText.position.set(layout.innerW / 2, 8);
}

export function syncModalShellResize(
    layout: VelocityModalLayout,
    parent: Container,
    screenW: number,
    screenH: number
): void {
    resizeVelocityShell(layout.shell, parent, screenW, screenH, 0.82);
}
