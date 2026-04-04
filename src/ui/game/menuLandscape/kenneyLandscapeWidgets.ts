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
import { getVelocityCustomTexture, getVelocityUiTexture, type VelocityUiTextureKey } from '../velocityUiArt';
import { GAME_COLORS, GAME_FONTS } from '../GameUITheme';
import { createKenneyFramedPanelWithContent, createKenneyHProgressBar } from '../kenneyNineSlice';
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';
import { CHIP_TEXT_X, chipLabelMaxW, chipValueMaxW } from '../menuShared/topStatusStripLayout';
import { drawIconProfile } from '../menuPortrait/missionPortraitIcons';

const PS = VELOCITY_UI_SLICE.panel;
const BS = VELOCITY_UI_SLICE.button;
const SCIFI_BTN = VELOCITY_UI_SLICE.scifiButton;
const SCIFI_GL = VELOCITY_UI_SLICE.scifiGlass;

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

    const accentLabelFill = 0x1a1206;
    const t = new Text({
        text: label,
        style: new TextStyle({
            fill: textLight ? 0xf8fbff : key === 'button_accent' ? accentLabelFill : 0x1a1a22,
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

export function fitStatChipValue(
    val: string,
    maxW: number,
    accentColor: number,
): Text {
    let fs = 16;
    let t: Text | null = null;
    for (; fs >= 11; fs -= 1) {
        const t2 = new Text({
            text: val,
            style: new TextStyle({
                fill: accentColor,
                fontSize: fs,
                fontWeight: '800',
                fontFamily: GAME_FONTS.standard,
                dropShadow: { alpha: 0.45, blur: 2, color: 0x000000, distance: 1 },
            }),
        });
        if (t2.width <= maxW) {
            t = t2;
            break;
        }
        t2.destroy();
    }
    if (!t) {
        const cut = val.length > 6 ? `${val.slice(0, 5)}…` : val;
        t = new Text({
            text: cut,
            style: new TextStyle({
                fill: accentColor,
                fontSize: 11,
                fontWeight: '800',
                fontFamily: GAME_FONTS.standard,
                dropShadow: { alpha: 0.45, blur: 2, color: 0x000000, distance: 1 },
            }),
        });
    }
    return t;
}

export type StatChipCornerBadge = 'prestige' | 'elite' | 'none';

/** Compact stat chip: Kenney secondary chrome + fixed lanes (icon | text | badge). */
export function kenneyStatChip(
    drawIcon: (g: Graphics, cx: number, cy: number, s: number) => void,
    label: string,
    value: string,
    w: number,
    h: number,
    accentColor = 0xf0f4fa,
    cornerBadge: StatChipCornerBadge = 'none',
    /** When textures load, prefer authored menu icon over vector draw. */
    menuIconKey?: VelocityUiTextureKey,
): Container | null {
    const spr = kenneyButtonNineSlice('button_secondary', w, h);
    if (!spr) return null;
    spr.alpha = 0.88;
    spr.tint = 0xe4edf5;
    const root = new Container();
    root.addChild(spr);

    const strip = new Graphics();
    strip.roundRect(8, 0, w - 16, 3, 1);
    strip.fill({ color: accentColor, alpha: 0.55 });
    root.addChild(strip);

    const iconCx = 15;
    const iconCy = h / 2 + 2;
    const iconS = Math.min(20, Math.floor(h * 0.32));
    const menuTex = menuIconKey ? getVelocityUiTexture(menuIconKey) : undefined;
    if (menuTex) {
        const sp = new Sprite(menuTex);
        sp.anchor.set(0.5);
        sp.width = iconS;
        sp.height = iconS;
        sp.position.set(iconCx, iconCy);
        sp.tint = accentColor;
        sp.alpha = 0.92;
        root.addChild(sp);
    } else {
        const ig = new Graphics();
        drawIcon(ig, iconCx, iconCy, Math.min(17, Math.floor(h * 0.28)));
        root.addChild(ig);
    }

    const hasB = cornerBadge !== 'none';
    const labelMaxW = chipLabelMaxW(w, hasB);
    const valueMaxW = chipValueMaxW(w, hasB);

    let labelStr = label.toUpperCase();
    const lb = new Text({
        text: labelStr,
        style: new TextStyle({
            fill: 0xa8b8c8,
            fontSize: 9,
            fontWeight: '600',
            fontFamily: GAME_FONTS.standard,
            letterSpacing: 0.8,
        }),
    });
    if (lb.width > labelMaxW) {
        while (labelStr.length > 3 && lb.width > labelMaxW) {
            labelStr = `${labelStr.slice(0, -2)}…`;
            lb.text = labelStr;
        }
    }
    lb.position.set(CHIP_TEXT_X, 7);
    root.addChild(lb);

    const vt = fitStatChipValue(value, valueMaxW, accentColor);
    vt.position.set(CHIP_TEXT_X, 19);
    root.addChild(vt);

    if (cornerBadge !== 'none') {
        const key = cornerBadge === 'prestige' ? 'rank_prestige' : 'rank_elite';
        const tex = getVelocityCustomTexture(key);
        if (tex) {
            const em = new Sprite(tex);
            em.anchor.set(0.5, 0.5);
            em.width = 18;
            em.height = 18;
            em.position.set(w - 13, h * 0.5 - 2);
            em.alpha = 0.9;
            root.addChild(em);
        }
    }

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

/** Command identity / profile node — outer ring stack + inner portrait field + pilot glyph. */
export function kenneyAvatarPlate(size: number, onClick: () => void): Container {
    const root = new Container();
    const cx = size / 2;
    const cy = size / 2;
    const rOut = size / 2 - 1;

    const outer = new Graphics();
    outer.circle(cx, cy, rOut);
    outer.stroke({ color: 0x1a2a3c, width: 2, alpha: 0.9 });
    root.addChild(outer);

    const ringMid = new Graphics();
    ringMid.circle(cx, cy, rOut - 2);
    ringMid.stroke({ color: GAME_COLORS.primary, width: 1.5, alpha: 0.65 });
    root.addChild(ringMid);

    const innerR = rOut - 5;
    const face = new Graphics();
    face.circle(cx, cy, innerR);
    face.fill({ color: 0x060a10, alpha: 1 });
    face.stroke({ color: 0x2a4058, width: 1, alpha: 0.55 });
    root.addChild(face);

    const gloss = new Graphics();
    gloss.ellipse(cx - innerR * 0.15, cy - innerR * 0.35, innerR * 0.55, innerR * 0.28);
    gloss.fill({ color: 0xffffff, alpha: 0.06 });
    root.addChild(gloss);

    const tex = getVelocityUiTexture('node_unlocked');
    if (tex) {
        const s = new Sprite(tex);
        s.anchor.set(0.5);
        const d = innerR * 2 - 4;
        s.width = d;
        s.height = d;
        s.position.set(cx, cy);
        s.tint = 0x9ec8e8;
        s.alpha = 0.35;
        root.addChild(s);
    }

    const pilot = new Graphics();
    drawIconProfile(pilot, cx, cy + 1, Math.min(16, innerR * 0.85), {
        color: GAME_COLORS.primary,
        width: 1.75,
        alpha: 0.88,
    });
    root.addChild(pilot);

    const rim = new Graphics();
    rim.circle(cx, cy, innerR);
    rim.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.35 });
    root.addChild(rim);

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
/** Apply Velocity hero tints to a Kenney framed panel pair. */
export function styleKenneyHeroPanelPair(pair: { root: Container; content: Container }): void {
    pair.root.alpha = 1;
    const ch = pair.root.children;
    const n = ch.length;
    const fill = ch[0] as NineSliceSprite;
    fill.tint = 0x050a12;
    fill.alpha = 1;
    const frame = ch[n - 2] as NineSliceSprite;
    frame.tint = GAME_COLORS.primary;
    frame.alpha = 0.72;
    if (n >= 4) {
        const notch = ch[1] as NineSliceSprite;
        notch.tint = GAME_COLORS.primary;
        notch.alpha = 0.32;
    }
}

export function kenneyHeroPanel(cw: number, cardH: number): { root: Container; content: Container } | null {
    const pair = createKenneyFramedPanelWithContent(cw, cardH);
    if (!pair) return null;
    styleKenneyHeroPanelPair(pair);
    return pair;
}

/** Mission list outer bay — Sci-Fi glass (OGA Kenney pack) + screw plate when available. */
export function kenneyListBay(cw: number, listH: number): Container | null {
    const glassTex = getVelocityUiTexture('scifi_panel_glass');
    const notchTex = getVelocityUiTexture('scifi_panel_glass_notches');
    const topAccentTex = getVelocityUiTexture('scifi_panel_glass_notches_top');
    const bladeTex = getVelocityUiTexture('scifi_panel_glass_tab_blade');
    const screwTex = getVelocityUiTexture('scifi_panel_glass_screws');
    const fillTex = getVelocityUiTexture('panel_fill');
    const root = new Container();
    if (glassTex) {
        const glass = new NineSliceSprite({
            texture: glassTex,
            leftWidth: SCIFI_GL.L,
            rightWidth: SCIFI_GL.R,
            topHeight: SCIFI_GL.T,
            bottomHeight: SCIFI_GL.B,
            width: cw,
            height: listH,
        });
        glass.tint = 0x0a1218;
        glass.alpha = 0.93;
        root.addChild(glass);
        if (notchTex) {
            const nx = new NineSliceSprite({
                texture: notchTex,
                leftWidth: SCIFI_GL.L,
                rightWidth: SCIFI_GL.R,
                topHeight: SCIFI_GL.T,
                bottomHeight: SCIFI_GL.B,
                width: cw,
                height: listH,
            });
            nx.tint = GAME_COLORS.primary;
            nx.alpha = 0.2;
            root.addChild(nx);
        }
        if (screwTex) {
            const screws = new NineSliceSprite({
                texture: screwTex,
                leftWidth: SCIFI_GL.L,
                rightWidth: SCIFI_GL.R,
                topHeight: SCIFI_GL.T,
                bottomHeight: SCIFI_GL.B,
                width: cw,
                height: listH,
            });
            screws.tint = GAME_COLORS.primary;
            screws.alpha = 0.28;
            root.addChild(screws);
        }
        const bandH = Math.max(10, Math.min(18, Math.floor(listH * 0.07)));
        if (topAccentTex && bandH >= 8) {
            const topBand = new NineSliceSprite({
                texture: topAccentTex,
                leftWidth: SCIFI_GL.L,
                rightWidth: SCIFI_GL.R,
                topHeight: SCIFI_GL.T,
                bottomHeight: SCIFI_GL.B,
                width: cw,
                height: bandH,
            });
            topBand.tint = GAME_COLORS.primary;
            topBand.alpha = 0.35;
            root.addChild(topBand);
        }
        if (bladeTex && listH > 48) {
            const bh = Math.max(12, Math.min(22, Math.floor(listH * 0.09)));
            const blade = new NineSliceSprite({
                texture: bladeTex,
                leftWidth: SCIFI_GL.L,
                rightWidth: SCIFI_GL.R,
                topHeight: SCIFI_GL.T,
                bottomHeight: SCIFI_GL.B,
                width: Math.min(cw - 24, Math.floor(cw * 0.72)),
                height: bh,
            });
            blade.position.set(Math.floor((cw - blade.width) / 2), Math.max(4, Math.floor(bandH * 0.35)));
            blade.tint = GAME_COLORS.primary;
            blade.alpha = 0.42;
            root.addChild(blade);
        }
    } else if (fillTex) {
        const spr = new NineSliceSprite({
            texture: fillTex,
            leftWidth: PS.L,
            rightWidth: PS.R,
            topHeight: PS.T,
            bottomHeight: PS.B,
            width: cw,
            height: listH,
        });
        spr.tint = 0x0a1520;
        spr.alpha = 0.94;
        root.addChild(spr);
    } else {
        return null;
    }
    const rim = new Graphics();
    rim.roundRect(0.5, 0.5, cw - 1, listH - 1, 14);
    rim.stroke({ color: 0x4a7a9a, width: 1.35, alpha: glassTex ? 0.62 : 0.55 });
    rim.roundRect(8, 3, cw - 16, 2, 1);
    rim.fill({ color: GAME_COLORS.primary, alpha: glassTex ? 0.18 : 0.12 });
    root.addChild(rim);
    return root;
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
    const glassTex = getVelocityUiTexture('scifi_panel_glass');
    const notchTex = getVelocityUiTexture('scifi_panel_glass_notches');
    const chromeTex = getVelocityUiTexture('scifi_panel_rectangle_screws');
    const fillTex = getVelocityUiTexture('panel_fill');
    const frameTex = getVelocityUiTexture('panel_frame');
    const useScifi = !!glassTex && !!chromeTex;
    const fillSource = useScifi ? glassTex! : fillTex;
    const frameSource = useScifi ? chromeTex! : frameTex;
    if (!fillSource || !frameSource) return null;
    const fL = useScifi ? SCIFI_GL.L : PS.L;
    const fR = useScifi ? SCIFI_GL.R : PS.R;
    const fT = useScifi ? SCIFI_GL.T : PS.T;
    const fB = useScifi ? SCIFI_GL.B : PS.B;
    const frL = useScifi ? SCIFI_BTN.L : PS.L;
    const frR = useScifi ? SCIFI_BTN.R : PS.R;
    const frT = useScifi ? SCIFI_BTN.T : PS.T;
    const frB = useScifi ? SCIFI_BTN.B : PS.B;

    const root = new Container();
    const fill = new NineSliceSprite({
        texture: fillSource,
        leftWidth: fL,
        rightWidth: fR,
        topHeight: fT,
        bottomHeight: fB,
        width: cw,
        height: rowH,
    });
    const frame = new NineSliceSprite({
        texture: frameSource,
        leftWidth: frL,
        rightWidth: frR,
        topHeight: frT,
        bottomHeight: frB,
        width: cw,
        height: rowH,
    });
    if (role === 'claimable') {
        fill.tint = 0x1a1410;
        fill.alpha = 0.94;
        frame.tint = 0xffcc66;
        frame.alpha = useScifi ? 0.62 : 0.55;
    } else if (role === 'locked') {
        fill.tint = 0x060a12;
        fill.alpha = 0.96;
        frame.tint = useScifi ? 0x6a7a8c : 0x4a5a6a;
        frame.alpha = useScifi ? 0.48 : 0.38;
    } else if (role === 'elite_locked') {
        fill.tint = 0x0c0806;
        fill.alpha = 0.96;
        frame.tint = 0xc9a050;
        frame.alpha = useScifi ? 0.52 : 0.42;
    } else {
        fill.tint = 0x080e16;
        fill.alpha = 0.92;
        frame.tint = GAME_COLORS.primary;
        frame.alpha = useScifi ? 0.52 : 0.4;
    }
    if (useScifi && notchTex) {
        const nx = new NineSliceSprite({
            texture: notchTex,
            leftWidth: fL,
            rightWidth: fR,
            topHeight: fT,
            bottomHeight: fB,
            width: cw,
            height: rowH,
        });
        nx.tint = frame.tint;
        nx.alpha = role === 'locked' || role === 'elite_locked' ? 0.12 : 0.18;
        root.addChild(fill, nx, frame);
        return root;
    }
    root.addChild(fill, frame);
    return root;
}

export function kenneyTabTrack(cw: number, h: number): Container | null {
    const sciTex = getVelocityUiTexture('scifi_panel_rectangle_screws');
    const notchTex = getVelocityUiTexture('scifi_panel_glass_notches');
    const tex = sciTex ?? getVelocityUiTexture('panel_fill');
    if (!tex) return null;
    const root = new Container();
    const L = sciTex ? SCIFI_BTN.L : PS.L;
    const R = sciTex ? SCIFI_BTN.R : PS.R;
    const T = sciTex ? SCIFI_BTN.T : PS.T;
    const B = sciTex ? SCIFI_BTN.B : PS.B;
    const spr = new NineSliceSprite({
        texture: tex,
        leftWidth: L,
        rightWidth: R,
        topHeight: T,
        bottomHeight: B,
        width: cw,
        height: h,
    });
    spr.tint = sciTex ? 0x0e1824 : 0x101a27;
    spr.alpha = sciTex ? 0.96 : 0.93;
    root.addChild(spr);
    if (sciTex && notchTex) {
        const nx = new NineSliceSprite({
            texture: notchTex,
            leftWidth: SCIFI_GL.L,
            rightWidth: SCIFI_GL.R,
            topHeight: SCIFI_GL.T,
            bottomHeight: SCIFI_GL.B,
            width: cw,
            height: h,
        });
        nx.tint = 0x8ecfe8;
        nx.alpha = 0.14;
        root.addChild(nx);
    }
    const rim = new Graphics();
    rim.roundRect(0.5, 0.5, cw - 1, h - 1, 12);
    rim.stroke({
        color: sciTex ? 0x4a8aaa : 0x304663,
        width: sciTex ? 1.35 : 1.2,
        alpha: sciTex ? 0.78 : 0.72,
    });
    rim.roundRect(10, 3, cw - 20, 2, 1);
    rim.fill({ color: 0x6fcff1, alpha: sciTex ? 0.22 : 0.16 });
    root.addChild(rim);
    return root;
}

export function kenneyDockBar(cw: number, h: number): Container | null {
    const sciTex = getVelocityUiTexture('scifi_panel_rectangle_screws');
    const tex = sciTex ?? getVelocityUiTexture('panel_fill');
    if (!tex) return null;
    const root = new Container();
    const L = sciTex ? SCIFI_BTN.L : PS.L;
    const R = sciTex ? SCIFI_BTN.R : PS.R;
    const T = sciTex ? SCIFI_BTN.T : PS.T;
    const B = sciTex ? SCIFI_BTN.B : PS.B;
    const spr = new NineSliceSprite({
        texture: tex,
        leftWidth: L,
        rightWidth: R,
        topHeight: T,
        bottomHeight: B,
        width: cw,
        height: h,
    });
    spr.tint = sciTex ? 0x080f18 : 0x0a121d;
    spr.alpha = 0.96;
    root.addChild(spr);
    const rim = new Graphics();
    rim.roundRect(0.5, 0.5, cw - 1, h - 1, 15);
    rim.stroke({
        color: sciTex ? 0x3d6a8a : 0x24435d,
        width: sciTex ? 1.35 : 1.2,
        alpha: sciTex ? 0.72 : 0.64,
    });
    rim.roundRect(8, 5, cw - 16, 2, 1);
    rim.fill({ color: 0x73d5ff, alpha: sciTex ? 0.18 : 0.14 });
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
