/**
 * Nine-slice: Kenney Sci-Fi header buttons (192×64) + Adventure cyan panel (64×64).
 */

import { Container, FederatedPointerEvent, NineSliceSprite, Text, TextStyle } from 'pixi.js';
import { getVelocityUiTexture, type VelocityUiTextureKey } from './velocityUiArt';
import { GAME_COLORS, GAME_FONTS } from './GameUITheme';

const PANEL_SLICE = 16;

/** Sci-fi `button_square_header_large_rectangle` 192×64 */
const SF_BTN_L = 56;
const SF_BTN_R = 56;
const SF_BTN_T = 20;
const SF_BTN_B = 20;

export function createKenneyPanelNineSlice(width: number, height: number): NineSliceSprite | null {
    const tex = getVelocityUiTexture('panel_blue');
    if (!tex) return null;
    return new NineSliceSprite({
        texture: tex,
        leftWidth: PANEL_SLICE,
        rightWidth: PANEL_SLICE,
        topHeight: PANEL_SLICE,
        bottomHeight: PANEL_SLICE,
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
    if (variant === 'danger') key = 'button_sf_danger';
    else if (variant === 'accent') key = 'button_sf_accent';
    else if (variant === 'primary') key = 'button_sf_primary';
    else key = 'button_sf_neutral';

    const tex = getVelocityUiTexture(key);
    if (!tex) return null;

    const root = new Container();
    root.eventMode = 'static';
    root.cursor = 'pointer';

    const bg = new NineSliceSprite({
        texture: tex,
        leftWidth: SF_BTN_L,
        rightWidth: SF_BTN_R,
        topHeight: SF_BTN_T,
        bottomHeight: SF_BTN_B,
        width,
        height,
    });
    root.addChild(bg);

    const textFill =
        variant === 'danger'
            ? 0xffffff
            : variant === 'primary'
              ? 0xffffff
              : variant === 'accent'
                ? 0x1a1208
                : 0xe8f4ff;
    const style = new TextStyle({
        fill: textFill,
        fontSize: Math.min(16, Math.floor(height * 0.34)),
        fontWeight: 'bold',
        fontFamily: GAME_FONTS.arcade,
        align: 'center',
        dropShadow: {
            alpha: variant === 'accent' ? 0.25 : 0.5,
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
