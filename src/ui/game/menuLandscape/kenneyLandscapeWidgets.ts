/**
 * Landscape menu chrome — Kenney UI Pack nine-slice buttons, panels, progress, icons.
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

const PS = VELOCITY_UI_SLICE.panel;
const BS = VELOCITY_UI_SLICE.button;

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

function kenneyButtonNineSlice(
    key: 'button_primary' | 'button_secondary' | 'button_accent' | 'button_danger',
    w: number,
    h: number,
): NineSliceSprite | null {
    const tex = getVelocityUiTexture(key);
    if (!tex) return null;
    return new NineSliceSprite({
        texture: tex,
        leftWidth: BS.L,
        rightWidth: BS.R,
        topHeight: BS.T,
        bottomHeight: BS.B,
        width: w,
        height: h,
    });
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
    const spr = kenneyButtonNineSlice(key, w, h);
    if (!spr) return null;
    const root = new Container();
    root.addChild(spr);

    const t = new Text({
        text: label,
        style: new TextStyle({
            fill: textLight ? 0xf8fbff : 0x1a1a22,
            fontSize: Math.min(14, Math.floor(h * 0.34)),
            fontWeight: '700',
            fontFamily: GAME_FONTS.standard,
            align: 'center',
            dropShadow: { alpha: 0.55, blur: 2, color: 0x000000, distance: 1 },
        }),
    });
    t.anchor.set(0.5);
    t.position.set(w / 2, h / 2);
    root.addChild(t);

    press(root, onClick);
    return root;
}

/** Compact stat chip: Kenney secondary chrome + vector icon + accent value color. */
export function kenneyStatChip(
    drawIcon: (g: Graphics, cx: number, cy: number, s: number) => void,
    label: string,
    value: string,
    w: number,
    h: number,
    accentColor = 0xf0f4fa,
): Container | null {
    const spr = kenneyButtonNineSlice('button_secondary', w, h);
    if (!spr) return null;
    spr.alpha = 0.88;
    spr.tint = 0xe4edf5;
    const root = new Container();
    root.addChild(spr);

    // Accent top strip for material depth
    const strip = new Graphics();
    strip.roundRect(8, 0, w - 16, 3, 1);
    strip.fill({ color: accentColor, alpha: 0.55 });
    root.addChild(strip);

    const ig = new Graphics();
    drawIcon(ig, 22, h / 2 + 2, 18);
    root.addChild(ig);

    const lb = new Text({
        text: label.toUpperCase(),
        style: new TextStyle({
            fill: 0x7a8a9c,
            fontSize: 9,
            fontWeight: '600',
            fontFamily: GAME_FONTS.standard,
            letterSpacing: 1,
        }),
    });
    lb.position.set(42, 7);
    root.addChild(lb);

    const vt = new Text({
        text: value,
        style: new TextStyle({
            fill: accentColor,
            fontSize: 16,
            fontWeight: '800',
            fontFamily: GAME_FONTS.standard,
            dropShadow: { alpha: 0.45, blur: 2, color: 0x000000, distance: 1 },
        }),
    });
    vt.position.set(42, 19);
    root.addChild(vt);

    return root;
}

/** Square chrome hit target (settings, etc.) — no label. */
export function kenneyChromeHit(w: number, h: number, onClick: () => void): Container | null {
    const spr = kenneyButtonNineSlice('button_secondary', w, h);
    if (!spr) return null;
    const root = new Container();
    spr.alpha = 0.9;
    spr.tint = 0xd8e4f0;
    root.addChild(spr);
    press(root, onClick);
    return root;
}

/** Profile / avatar hit — Kenney round gloss + optional tint ring. */
export function kenneyAvatarPlate(size: number, onClick: () => void): Container {
    const root = new Container();
    const tex = getVelocityUiTexture('node_unlocked');
    if (tex) {
        const s = new Sprite(tex);
        s.anchor.set(0.5);
        s.width = size;
        s.height = size;
        s.position.set(size / 2, size / 2);
        s.tint = 0xb8e0ff;
        root.addChild(s);
    } else {
        const g = new Graphics();
        const cx = size / 2;
        const cy = size / 2;
        const r = size / 2 - 2;
        g.circle(cx, cy, r);
        g.fill({ color: 0x0c141e, alpha: 1 });
        g.stroke({ color: GAME_COLORS.primary, width: 2, alpha: 0.55 });
        root.addChild(g);
    }
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

/** Hero: framed panel + tinted inner fill. */
export function kenneyHeroPanel(cw: number, cardH: number): { root: Container; content: Container } | null {
    const pair = createKenneyFramedPanelWithContent(cw, cardH);
    if (!pair) return null;
    pair.root.alpha = 1;
    const fill = pair.root.children[0] as NineSliceSprite;
    fill.tint = 0x050a12;
    fill.alpha = 1;
    const frame = pair.root.children[1] as NineSliceSprite;
    frame.tint = GAME_COLORS.primary;
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
    const spr = kenneyButtonNineSlice('button_secondary', cw, rowH);
    if (!spr) return null;
    const root = new Container();
    spr.alpha = 0.78;
    spr.tint = 0xd8e4f0;
    root.addChild(spr);
    const rim = new Graphics();
    rim.roundRect(0.5, 0.5, cw - 1, rowH - 1, 14);
    rim.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.22 });
    root.addChild(rim);
    return root;
}

export type MissionCardFaceRole = 'playable' | 'claimable' | 'locked' | 'elite_locked';

/**
 * Full-bleed Kenney panel (fill + outline) — reduces “flat vector card” when textures load.
 * Role-specific tints differentiate material identity without duplicating one grey formula.
 */
export function kenneyMissionCardFace(cw: number, rowH: number, role: MissionCardFaceRole): Container | null {
    const fillTex = getVelocityUiTexture('panel_fill');
    const frameTex = getVelocityUiTexture('panel_frame');
    if (!fillTex || !frameTex) return null;
    const root = new Container();
    const fill = new NineSliceSprite({
        texture: fillTex,
        leftWidth: PS.L,
        rightWidth: PS.R,
        topHeight: PS.T,
        bottomHeight: PS.B,
        width: cw,
        height: rowH,
    });
    const frame = new NineSliceSprite({
        texture: frameTex,
        leftWidth: PS.L,
        rightWidth: PS.R,
        topHeight: PS.T,
        bottomHeight: PS.B,
        width: cw,
        height: rowH,
    });
    if (role === 'claimable') {
        fill.tint = 0x1a1410;
        fill.alpha = 0.94;
        frame.tint = 0xffcc66;
        frame.alpha = 0.55;
    } else if (role === 'locked') {
        fill.tint = 0x080c14;
        fill.alpha = 0.96;
        frame.tint = 0x4a5a6a;
        frame.alpha = 0.38;
    } else if (role === 'elite_locked') {
        fill.tint = 0x100c0a;
        fill.alpha = 0.96;
        frame.tint = 0xc9a050;
        frame.alpha = 0.42;
    } else {
        fill.tint = 0x0a1018;
        fill.alpha = 0.92;
        frame.tint = GAME_COLORS.primary;
        frame.alpha = 0.4;
    }
    root.addChild(fill, frame);
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
    spr.tint = 0x101a27;
    spr.alpha = 0.93;
    root.addChild(spr);
    const rim = new Graphics();
    rim.roundRect(0.5, 0.5, cw - 1, h - 1, 12);
    rim.stroke({ color: 0x304663, width: 1.2, alpha: 0.72 });
    rim.roundRect(10, 3, cw - 20, 2, 1);
    rim.fill({ color: 0x6fcff1, alpha: 0.16 });
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
    spr.tint = 0x0a121d;
    spr.alpha = 0.96;
    root.addChild(spr);
    const rim = new Graphics();
    rim.roundRect(0.5, 0.5, cw - 1, h - 1, 15);
    rim.stroke({ color: 0x24435d, width: 1.2, alpha: 0.64 });
    rim.roundRect(8, 5, cw - 16, 2, 1);
    rim.fill({ color: 0x73d5ff, alpha: 0.14 });
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
