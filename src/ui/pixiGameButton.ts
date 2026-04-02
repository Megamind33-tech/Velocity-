import { FancyButton } from '@pixi/ui';
import { Graphics, Text, TextStyle } from 'pixi.js';
import { GAME_UI } from './theme/GameUITheme';

export type GameButtonVariant = 'primary' | 'secondary' | 'compact';

function hex(n: number): string {
    return '#' + n.toString(16).padStart(6, '0');
}

function makeFace(
    width: number,
    height: number,
    variant: GameButtonVariant,
    state: 'default' | 'hover' | 'pressed'
): Graphics {
    const g = new Graphics();
    const primary = variant === 'primary';
    const stroke = primary ? GAME_UI.strokeCyan : GAME_UI.strokeNeon;
    const fillBase = primary ? 0x1a1035 : 0x120c22;
    const alpha =
        state === 'pressed' ? 0.98 : state === 'hover' ? 0.92 : 0.82;
    const strokeW = primary ? 3 : 2;
    const strokeA = state === 'hover' ? 1 : state === 'pressed' ? 0.95 : 0.85;

    g.roundRect(0, 0, width, height, 10);
    g.fill({ color: fillBase, alpha });
    g.stroke({ width: strokeW, color: stroke, alpha: strokeA });

    if (primary && state !== 'pressed') {
        g.roundRect(3, 3, width - 6, height - 6, 7);
        g.stroke({ width: 1, color: GAME_UI.accentHot, alpha: state === 'hover' ? 0.5 : 0.35 });
    }

    if (state === 'pressed') {
        g.roundRect(2, 2, width - 4, height - 4, 8);
        g.stroke({ width: 1, color: 0x000000, alpha: 0.35 });
    }

    return g;
}

export type GameButtonTap = () => void;

/**
 * Official @pixi/ui FancyButton with arcade skins (Graphics states + press/hover motion).
 */
export function createPixiGameButton(
    label: string,
    width: number,
    height: number,
    onPress: GameButtonTap,
    opts?: { variant?: GameButtonVariant; fontSize?: number }
): FancyButton {
    const variant = opts?.variant ?? 'secondary';
    const fontSize =
        opts?.fontSize ?? Math.min(18, Math.max(11, Math.floor(height * 0.36)));

    const btn = new FancyButton({
        defaultView: makeFace(width, height, variant, 'default'),
        hoverView: makeFace(width, height, variant, 'hover'),
        pressedView: makeFace(width, height, variant, 'pressed'),
        text: new Text({
            text: label.toUpperCase(),
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize,
                fontWeight: '700',
                fill: hex(GAME_UI.textPrimary),
                letterSpacing: 1,
                dropShadow: { blur: 4, color: '#000000', distance: 1, alpha: 0.9 },
            }),
        }),
        animations: {
            hover: {
                props: { scale: { x: 1.04, y: 1.04 } },
                duration: 80,
            },
            pressed: {
                props: { scale: { x: 0.96, y: 0.96 } },
                duration: 60,
            },
        },
        anchorX: 0,
        anchorY: 0,
    });

    btn.setSize(width, height);
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.onPress.connect(() => onPress());

    return btn;
}
