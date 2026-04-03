/**
 * Nine-slice for SunGraphica sci-fi UI PNGs (see `public/sungraphica-ui/`).
 */

import { Container, FederatedPointerEvent, Graphics, NineSliceSprite, Text, TextStyle, TilingSprite } from 'pixi.js';
import { getVelocityUiTexture, type VelocityUiTextureKey } from './velocityUiArt';
import { GAME_COLORS, GAME_FONTS } from './GameUITheme';
import { VELOCITY_UI_SLICE, velocityUiButtonSlice } from './velocityUiSlice';

const PS = VELOCITY_UI_SLICE.panel;

export function createKenneyPanelNineSlice(width: number, height: number): NineSliceSprite | null {
    const tex = getVelocityUiTexture('panel_frame');
    if (!tex) return null;
    return new NineSliceSprite({
        texture: tex,
        leftWidth: PS.L,
        rightWidth: PS.R,
        topHeight: PS.T,
        bottomHeight: PS.B,
        width,
        height,
    });
}

export type KenneyButtonVariant = 'primary' | 'neutral' | 'danger' | 'accent';

export function createKenneyNineSliceButton(
    label: string,
    width: number,
    height: number,
    variant: KenneyButtonVariant,
    onClick: () => void
): Container | null {
    let key: VelocityUiTextureKey;
    if (variant === 'danger') key = 'button_danger';
    else if (variant === 'accent') key = 'button_accent';
    else if (variant === 'primary') key = 'button_primary';
    else key = 'button_secondary';

    const tex = getVelocityUiTexture(key);
    if (!tex) return null;

    const root = new Container();
    root.eventMode = 'static';
    root.cursor = 'pointer';

    const sl = velocityUiButtonSlice(key);
    const bg = new NineSliceSprite({
        texture: tex,
        leftWidth: sl.L,
        rightWidth: sl.R,
        topHeight: sl.T,
        bottomHeight: sl.B,
        width,
        height,
    });
    if (variant === 'primary') {
        bg.tint = 0xc8f4ff;
        bg.alpha = 0.97;
    } else if (variant === 'accent') {
        bg.tint = 0xfff0c8;
        bg.alpha = 0.96;
    } else if (variant === 'danger') {
        bg.tint = 0xffc8c8;
        bg.alpha = 0.96;
    } else {
        bg.tint = 0xe8eef5;
        bg.alpha = 0.94;
    }
    root.addChild(bg);
    const dim = new Graphics();
    dim.roundRect(6, 5, width - 12, height - 10, Math.min(10, height * 0.22));
    dim.fill({ color: 0x040810, alpha: 0.42 });
    bg.addChild(dim);

    const textFill = variant === 'accent' ? 0x1a1206 : 0xf2f6fb;
    const style = new TextStyle({
        fill: textFill,
        fontSize: Math.min(15, Math.floor(height * 0.36)),
        fontWeight: 'bold',
        fontFamily: GAME_FONTS.arcade,
        align: 'center',
        dropShadow: {
            alpha: variant === 'accent' ? 0.15 : 0.45,
            blur: 2,
            color: 0x000000,
            distance: 1,
        },
    });
    const t = new Text({ text: label, style });
    t.anchor.set(0.5);
    t.position.set(width / 2, height / 2);
    root.addChild(t);

    const stop = (e: FederatedPointerEvent) => e.stopPropagation();

    const onDown = () => {
        root.scale.set(0.98);
    };
    const onUp = () => {
        root.scale.set(1);
    };

    root.on('pointerdown', (e) => {
        stop(e);
        onDown();
    });
    root.on('pointerup', (e) => {
        stop(e);
        onUp();
        onClick();
    });
    root.on('pointerupoutside', (e) => {
        stop(e);
        onUp();
    });
    root.on('pointercancel', onUp);

    return root;
}

export function createKenneyFramedPanelWithContent(
    width: number,
    height: number
): { root: Container; content: Container } | null {
    const frameTex = getVelocityUiTexture('panel_frame');
    const fillTex = getVelocityUiTexture('panel_fill');
    if (!frameTex || !fillTex) return null;

    const root = new Container();
    const inset = 10;
    const iw = Math.max(40, width - inset * 2);
    const ih = Math.max(40, height - inset * 2);

    const fill = new NineSliceSprite({
        texture: fillTex,
        leftWidth: PS.L,
        rightWidth: PS.R,
        topHeight: PS.T,
        bottomHeight: PS.B,
        width: iw,
        height: ih,
    });
    fill.position.set(inset, inset);
    fill.alpha = 0.88;

    const frame = new NineSliceSprite({
        texture: frameTex,
        leftWidth: PS.L,
        rightWidth: PS.R,
        topHeight: PS.T,
        bottomHeight: PS.B,
        width,
        height,
    });

    const content = new Container();
    root.addChild(fill, frame, content);
    content.position.set(inset + 12, inset + 14);
    return { root, content };
}

export function createKenneyFramedPanel(width: number, height: number): Container | null {
    return createKenneyFramedPanelWithContent(width, height)?.root ?? null;
}

/** Horizontal meter using Kenney slide strips (tiling). */
export function createKenneyHProgressBar(
    width: number,
    height: number
): (Container & { setProgress: (p01: number) => void }) | null {
    const trackTex = getVelocityUiTexture('slide_track');
    const fillTex = getVelocityUiTexture('slide_fill');
    if (!trackTex || !fillTex) return null;

    const root = new Container() as Container & { setProgress: (p01: number) => void };
    const track = new TilingSprite({
        texture: trackTex,
        width,
        height,
        tileScale: { x: height / Math.max(1, trackTex.height), y: height / Math.max(1, trackTex.height) },
    });
    track.alpha = 0.88;
    const fill = new TilingSprite({
        texture: fillTex,
        width: 0,
        height,
        tileScale: { x: height / Math.max(1, fillTex.height), y: height / Math.max(1, fillTex.height) },
    });
    fill.alpha = 0.92;
    root.addChild(track, fill);

    root.setProgress = (p01: number) => {
        const p = Math.max(0, Math.min(1, p01));
        fill.width = Math.max(0, width * p);
    };
    return root;
}

/** Stats / HUD plate: filled block + frame border. */
export function createKenneyHudPlate(width: number, height: number): Container | null {
    const framed = createKenneyFramedPanel(width, height);
    if (!framed) return null;
    framed.alpha = 0.92;
    return framed;
}
