/**
 * Nine-slice for Kenney UI Pack rectangles (192×64): buttons + input outline panel.
 */

import { Container, FederatedPointerEvent, NineSliceSprite, Text, TextStyle, TilingSprite } from 'pixi.js';
import { getVelocityUiTexture, type VelocityUiTextureKey } from './velocityUiArt';
import { GAME_COLORS, GAME_FONTS } from './GameUITheme';
import { VELOCITY_UI_SLICE } from './velocityUiSlice';

const BS = VELOCITY_UI_SLICE.button;
const PS = VELOCITY_UI_SLICE.panel;
const SCIFI_GL = VELOCITY_UI_SLICE.scifiGlass;
const SCIFI_BTN = VELOCITY_UI_SLICE.scifiButton;

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
    onClick: () => void,
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

    const bg = new NineSliceSprite({
        texture: tex,
        leftWidth: BS.L,
        rightWidth: BS.R,
        topHeight: BS.T,
        bottomHeight: BS.B,
        width,
        height,
    });
    root.addChild(bg);

    const textFill = variant === 'accent' ? 0x1a1a22 : 0xffffff;
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
    height: number,
): { root: Container; content: Container } | null {
    const root = new Container();
    const inset = 10;
    const iw = Math.max(40, width - inset * 2);
    const ih = Math.max(40, height - inset * 2);

    const glassTex = getVelocityUiTexture('scifi_panel_glass');
    const chromeTex = getVelocityUiTexture('scifi_panel_rectangle_screws');
    const notchTex = getVelocityUiTexture('scifi_panel_glass_notches');
    const useScifi = !!glassTex && !!chromeTex;

    if (useScifi) {
        const fill = new NineSliceSprite({
            texture: glassTex!,
            leftWidth: SCIFI_GL.L,
            rightWidth: SCIFI_GL.R,
            topHeight: SCIFI_GL.T,
            bottomHeight: SCIFI_GL.B,
            width: iw,
            height: ih,
        });
        fill.position.set(inset, inset);
        fill.alpha = 0.9;
        fill.tint = 0x0a1218;

        const toAdd: Parameters<Container['addChild']>[0][] = [fill];

        if (notchTex) {
            const nx = new NineSliceSprite({
                texture: notchTex,
                leftWidth: SCIFI_GL.L,
                rightWidth: SCIFI_GL.R,
                topHeight: SCIFI_GL.T,
                bottomHeight: SCIFI_GL.B,
                width: iw,
                height: ih,
            });
            nx.position.set(inset, inset);
            nx.tint = 0x7ec8e8;
            nx.alpha = 0.22;
            toAdd.push(nx);
        }

        const frame = new NineSliceSprite({
            texture: chromeTex!,
            leftWidth: SCIFI_BTN.L,
            rightWidth: SCIFI_BTN.R,
            topHeight: SCIFI_BTN.T,
            bottomHeight: SCIFI_BTN.B,
            width,
            height,
        });
        frame.alpha = 0.55;
        frame.tint = 0x4a9ec4;
        toAdd.push(frame);

        const content = new Container();
        root.addChild(...toAdd, content);
        content.position.set(inset + 12, inset + 14);
        return { root, content };
    }

    const frameTex = getVelocityUiTexture('panel_frame');
    const fillTex = getVelocityUiTexture('panel_fill');
    if (!frameTex || !fillTex) return null;

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

export function createKenneyHProgressBar(
    width: number,
    height: number,
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
    track.alpha = 0.85;
    const fill = new TilingSprite({
        texture: fillTex,
        width: 0,
        height,
        tileScale: { x: height / Math.max(1, fillTex.height), y: height / Math.max(1, fillTex.height) },
    });
    fill.alpha = 0.95;
    root.addChild(track, fill);

    root.setProgress = (p01: number) => {
        const p = Math.max(0, Math.min(1, p01));
        fill.width = Math.max(0, width * p);
    };
    return root;
}

export function createKenneyHudPlate(width: number, height: number): Container | null {
    const framed = createKenneyFramedPanel(width, height);
    if (!framed) return null;
    framed.alpha = 0.92;
    return framed;
}
