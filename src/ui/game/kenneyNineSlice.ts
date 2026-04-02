/**
 * Nine-slice for Kenney UI Pack rectangles (192×64): buttons + input outline panel.
 */

import { Container, FederatedPointerEvent, NineSliceSprite, Text, TextStyle } from 'pixi.js';
import { getVelocityUiTexture, type VelocityUiTextureKey } from './velocityUiArt';
import { GAME_COLORS, GAME_FONTS } from './GameUITheme';

/** Shared 192×64 Kenney slices (buttons + input_outline_rectangle). */
const SLICE_L = 56;
const SLICE_R = 56;
const SLICE_T = 20;
const SLICE_B = 20;

export function createKenneyPanelNineSlice(width: number, height: number): NineSliceSprite | null {
    const tex = getVelocityUiTexture('panel_frame');
    if (!tex) return null;
    return new NineSliceSprite({
        texture: tex,
        leftWidth: SLICE_L,
        rightWidth: SLICE_R,
        topHeight: SLICE_T,
        bottomHeight: SLICE_B,
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

    const bg = new NineSliceSprite({
        texture: tex,
        leftWidth: SLICE_L,
        rightWidth: SLICE_R,
        topHeight: SLICE_T,
        bottomHeight: SLICE_B,
        width,
        height,
    });
    root.addChild(bg);

    const textFill =
        variant === 'accent' ? 0x1a1a22 : 0xffffff;
    const style = new TextStyle({
        fill: textFill,
        fontSize: Math.min(16, Math.floor(height * 0.34)),
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
