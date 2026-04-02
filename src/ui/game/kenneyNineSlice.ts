/**
 * Nine-slice helpers for Kenney UI tiles (fixed 64×64 panels, 48×24 buttons).
 */

import { Container, FederatedPointerEvent, NineSliceSprite, Text, TextStyle, TilingSprite } from 'pixi.js';
import { getVelocityUiTexture, type VelocityUiTextureKey } from './velocityUiArt';
import { GAME_COLORS, GAME_FONTS } from './GameUITheme';

/** Typical Kenney 64×64 panel — adjust if you swap art. */
const PANEL_SLICE = 16;

/** Kenney button_grey / button_red are 48×24. */
const BTN_SLICE_X = 12;
const BTN_SLICE_Y = 8;

export type KenneyPanelKey = 'panel_blue' | 'panel_brown';

export function createKenneyPanelNineSlice(
    width: number,
    height: number,
    panelKey: KenneyPanelKey = 'panel_blue'
): NineSliceSprite | null {
    const tex = getVelocityUiTexture(panelKey);
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

/**
 * Interactive button: nine-slice background + centered label.
 */
export function createKenneyNineSliceButton(
    label: string,
    width: number,
    height: number,
    variant: KenneyButtonVariant,
    onClick: () => void
): Container | null {
    let key: VelocityUiTextureKey;
    if (variant === 'danger') key = 'button_red';
    else if (variant === 'accent') key = 'button_brown';
    else key = 'button_grey';
    const tex = getVelocityUiTexture(key);
    if (!tex) return null;

    const root = new Container();
    root.eventMode = 'static';
    root.cursor = 'pointer';

    const bg = new NineSliceSprite({
        texture: tex,
        leftWidth: BTN_SLICE_X,
        rightWidth: BTN_SLICE_X,
        topHeight: BTN_SLICE_Y,
        bottomHeight: BTN_SLICE_Y,
        width,
        height,
    });
    root.addChild(bg);

    const textFill =
        variant === 'danger'
            ? 0xffffff
            : variant === 'primary'
              ? GAME_COLORS.primary
              : variant === 'accent'
                ? GAME_COLORS.accent_gold
                : GAME_COLORS.text_primary;
    const style = new TextStyle({
        fill: textFill,
        fontSize: Math.min(15, Math.floor(height * 0.36)),
        fontWeight: 'bold',
        fontFamily: GAME_FONTS.arcade,
        align: 'center',
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

/**
 * Subtle tiled blueprint pattern over the menu (call after createMenuBackdrop).
 */
export function attachKenneyMenuPattern(parent: Container, screenW: number, screenH: number): void {
    const tex = getVelocityUiTexture('pattern_grid_blueprint');
    if (!tex) return;
    const tile = new TilingSprite({ texture: tex, width: screenW, height: screenH });
    tile.alpha = 0.14;
    tile.position.set(0, 0);
    const idx = Math.min(1, parent.children.length);
    parent.addChildAt(tile, idx);
}
