import { Container, Graphics, Rectangle, Text, TextStyle } from 'pixi.js';
import { GAME_UI } from './theme/GameUITheme';

export type ButtonTap = () => void;

/**
 * Chunky arcade menu button (Pixi Container + Graphics + Text).
 */
export function createMenuButton(
    label: string,
    width: number,
    height: number,
    onTap: ButtonTap,
    opts?: { primary?: boolean }
): Container {
    const primary = opts?.primary ?? false;
    const c = new Container();
    c.eventMode = 'static';
    c.cursor = 'pointer';
    c.hitArea = new Rectangle(0, 0, width, height);

    const bg = new Graphics();
    const stroke = primary ? GAME_UI.strokeCyan : GAME_UI.strokeNeon;
    const fill = primary ? 0x1a1035 : 0x120c22;

    const draw = (hover = false) => {
        bg.clear();
        bg.roundRect(0, 0, width, height, 10);
        bg.fill({ color: fill, alpha: hover ? 0.95 : 0.82 });
        bg.stroke({ width: primary ? 3 : 2, color: stroke, alpha: hover ? 1 : 0.85 });
        if (primary) {
            bg.roundRect(3, 3, width - 6, height - 6, 7);
            bg.stroke({ width: 1, color: GAME_UI.accentHot, alpha: 0.35 });
        }
    };
    draw(false);

    const style = new TextStyle({
        fontFamily: GAME_UI.fontBody,
        fontSize: Math.min(18, Math.floor(height * 0.38)),
        fontWeight: '700',
        fill: hex(GAME_UI.textPrimary),
        letterSpacing: 1,
        dropShadow: { blur: 4, color: '#000000', distance: 1, alpha: 0.9 },
    });

    const t = new Text({ text: label.toUpperCase(), style });
    t.anchor.set(0.5);
    t.position.set(width / 2, height / 2);

    c.addChild(bg, t);

    c.on('pointerover', () => draw(true));
    c.on('pointerout', () => draw(false));
    c.on('pointerdown', (e) => {
        e.stopPropagation();
        draw(true);
    });
    c.on('pointerup', () => draw(false));
    c.on('pointerupoutside', () => draw(false));
    c.on('pointertap', (e) => {
        e.stopPropagation();
        onTap();
    });

    return c;
}

function hex(n: number): string {
    return '#' + n.toString(16).padStart(6, '0');
}

export function panelFrame(g: Graphics, x: number, y: number, w: number, h: number): void {
    g.clear();
    g.roundRect(x, y, w, h, 14);
    g.fill({ color: GAME_UI.bgPanel, alpha: 0.92 });
    g.stroke({ width: 2, color: GAME_UI.strokeNeon, alpha: 0.9 });
    g.roundRect(x + 4, y + 4, w - 8, h - 8, 10);
    g.stroke({ width: 1, color: GAME_UI.strokeCyan, alpha: 0.25 });
}
