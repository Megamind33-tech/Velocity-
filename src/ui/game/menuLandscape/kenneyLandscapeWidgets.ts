/**
 * SunGraphica sci-fi UI chrome — nine-slice buttons, panels, progress, icons.
 */

import {
    Container,
    FederatedPointerEvent,
    Graphics,
    NineSliceSprite,
    Sprite,
    Text,
    TextStyle,
} from 'pixi.js';
import { getVelocityUiTexture, type VelocityUiTextureKey } from '../velocityUiArt';
import { GAME_COLORS, GAME_FONTS } from '../GameUITheme';
import { createKenneyFramedPanelWithContent, createKenneyHProgressBar } from '../kenneyNineSlice';
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';

const BS = VELOCITY_UI_SLICE.button;
const PS = VELOCITY_UI_SLICE.panel;

const CYAN_TINT = 0x22ddcc;

function press(root: Container, onClick: () => void): void {
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
        onClick();
    });
    root.on('pointerupoutside', () => root.scale.set(1));
    root.on('pointercancel', () => root.scale.set(1));
}

/** Nine-slice button; returns null if textures not loaded. */
export function kenneyButton(
    label: string,
    w: number,
    h: number,
    key: 'button_primary' | 'button_secondary' | 'button_accent',
    textLight: boolean,
    onClick: () => void,
): Container | null {
    const tex = getVelocityUiTexture(key);
    if (!tex) return null;
    const root = new Container();
    const spr = new NineSliceSprite({
        texture: tex,
        leftWidth: BS.L,
        rightWidth: BS.R,
        topHeight: BS.T,
        bottomHeight: BS.B,
        width: w,
        height: h,
    });
    spr.tint = key === 'button_primary' ? CYAN_TINT : 0xffffff;
    spr.alpha = key === 'button_primary' ? 0.95 : 0.88;
    root.addChild(spr);

    const t = new Text({
        text: label,
        style: new TextStyle({
            fill: textLight ? 0xffffff : 0x0a1218,
            fontSize: Math.min(14, Math.floor(h * 0.34)),
            fontWeight: '700',
            fontFamily: GAME_FONTS.standard,
            align: 'center',
            dropShadow: { alpha: 0.35, blur: 1, color: 0x000000, distance: 1 },
        }),
    });
    t.anchor.set(0.5);
    t.position.set(w / 2, h / 2);
    root.addChild(t);

    press(root, onClick);
    return root;
}

/** Compact stat chip: secondary button chrome + icon + two text lines. */
export function kenneyStatChip(
    iconKey: VelocityUiTextureKey,
    label: string,
    value: string,
    w: number,
    h: number,
    iconTint: number,
): Container | null {
    const tex = getVelocityUiTexture('button_secondary');
    if (!tex) return null;
    const root = new Container();
    const spr = new NineSliceSprite({
        texture: tex,
        leftWidth: BS.L,
        rightWidth: BS.R,
        topHeight: BS.T,
        bottomHeight: BS.B,
        width: w,
        height: h,
    });
    spr.alpha = 0.9;
    root.addChild(spr);

    const it = getVelocityUiTexture(iconKey);
    if (it) {
        const icon = new Sprite(it);
        icon.anchor.set(0.5);
        const im = Math.min(22, h - 16);
        icon.width = im;
        icon.height = im;
        icon.tint = iconTint;
        icon.position.set(22, h / 2);
        icon.alpha = 0.95;
        root.addChild(icon);
    }

    const lb = new Text({
        text: label,
        style: new TextStyle({
            fill: 0x8899aa,
            fontSize: 11,
            fontWeight: '600',
            fontFamily: GAME_FONTS.standard,
        }),
    });
    lb.position.set(42, 6);
    root.addChild(lb);

    const vt = new Text({
        text: value,
        style: new TextStyle({
            fill: 0xf0f4fa,
            fontSize: 13,
            fontWeight: '700',
            fontFamily: GAME_FONTS.standard,
        }),
    });
    vt.position.set(42, 20);
    root.addChild(vt);

    return root;
}

/** Square chrome hit target (settings, etc.) — no label. */
export function kenneyChromeHit(w: number, h: number, onClick: () => void): Container | null {
    const tex = getVelocityUiTexture('button_secondary');
    if (!tex) return null;
    const root = new Container();
    const spr = new NineSliceSprite({
        texture: tex,
        leftWidth: BS.L,
        rightWidth: BS.R,
        topHeight: BS.T,
        bottomHeight: BS.B,
        width: w,
        height: h,
    });
    spr.alpha = 0.88;
    root.addChild(spr);
    press(root, onClick);
    return root;
}

/** Circular pilot plate using unlocked-node icon. */
export function kenneyAvatarPlate(size: number, onClick: () => void): Container | null {
    const tex = getVelocityUiTexture('node_unlocked');
    if (!tex) return null;
    const root = new Container();
    const spr = new Sprite(tex);
    spr.anchor.set(0.5);
    spr.width = size;
    spr.height = size;
    spr.tint = CYAN_TINT;
    spr.alpha = 0.92;
    spr.position.set(size / 2, size / 2);
    root.addChild(spr);
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
        onClick();
    });
    root.on('pointerupoutside', () => root.scale.set(1));
    root.on('pointercancel', () => root.scale.set(1));
    return root;
}

/** Add settings / system glyph centered. */
export function mountGearIcon(parent: Container, cx: number, cy: number, size: number): void {
    const t = getVelocityUiTexture('menu_settings_repeat');
    if (!t) return;
    const s = new Sprite(t);
    s.anchor.set(0.5);
    s.width = size;
    s.height = size;
    s.tint = 0xaabbcc;
    s.position.set(cx, cy);
    s.alpha = 0.9;
    parent.addChild(s);
}

/** Hero: framed panel + tinted inner fill (sci-fi window). */
export function kenneyHeroPanel(cw: number, cardH: number): { root: Container; content: Container } | null {
    const pair = createKenneyFramedPanelWithContent(cw, cardH);
    if (!pair) return null;
    pair.root.alpha = 1;
    const fill = pair.root.children[0] as NineSliceSprite;
    /** Deep navy body — solid, high-contrast vs cyan chrome (Kenney sci-fi panels). */
    fill.tint = 0x050a12;
    fill.alpha = 1;
    const frame = pair.root.children[1] as NineSliceSprite;
    frame.tint = CYAN_TINT;
    frame.alpha = 0.72;
    return pair;
}

export function kenneyProgressBar(w: number, h: number): (Container & { setProgress: (p: number) => void }) | null {
    const bar = createKenneyHProgressBar(w, h);
    if (!bar) return null;
    bar.setProgress(0);
    return bar;
}

/** Mission row plate. */
export function kenneyRowPanel(cw: number, rowH: number): Container | null {
    const tex = getVelocityUiTexture('button_secondary');
    if (!tex) return null;
    const root = new Container();
    const spr = new NineSliceSprite({
        texture: tex,
        leftWidth: BS.L,
        rightWidth: BS.R,
        topHeight: BS.T,
        bottomHeight: BS.B,
        width: cw,
        height: rowH,
    });
    spr.alpha = 0.75;
    spr.tint = 0xccddee;
    root.addChild(spr);
    const rim = new Graphics();
    rim.roundRect(0.5, 0.5, cw - 1, rowH - 1, 14);
    rim.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.22 });
    root.addChild(rim);
    return root;
}

export function kenneyTabTrack(cw: number, h: number): Container | null {
    const tex = getVelocityUiTexture('panel_fill');
    if (!tex) return null;
    const root = new Container();
    const spr = new NineSliceSprite({
        texture: tex,
        leftWidth: PS.L,
        rightWidth: PS.R,
        topHeight: PS.T,
        bottomHeight: PS.B,
        width: cw,
        height: h,
    });
    spr.tint = 0x121c2a;
    spr.alpha = 0.9;
    root.addChild(spr);
    const rim = new Graphics();
    rim.roundRect(0, 0, cw, h, 10);
    rim.stroke({ color: 0x334455, width: 1, alpha: 0.7 });
    root.addChild(rim);
    return root;
}

export function kenneyDockBar(cw: number, h: number): Container | null {
    const tex = getVelocityUiTexture('panel_fill');
    if (!tex) return null;
    const root = new Container();
    const spr = new NineSliceSprite({
        texture: tex,
        leftWidth: PS.L,
        rightWidth: PS.R,
        topHeight: PS.T,
        bottomHeight: PS.B,
        width: cw,
        height: h,
    });
    spr.tint = 0x0c1420;
    spr.alpha = 0.96;
    root.addChild(spr);
    const rim = new Graphics();
    rim.roundRect(0.5, 0.5, cw - 1, h - 1, 14);
    rim.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.28 });
    root.addChild(rim);
    return root;
}

export function spriteIcon(key: VelocityUiTextureKey, size: number, tint?: number): Sprite | null {
    const tex = getVelocityUiTexture(key);
    if (!tex) return null;
    const s = new Sprite(tex);
    s.anchor.set(0.5);
    s.width = size;
    s.height = size;
    if (tint !== undefined) s.tint = tint;
    return s;
}
