import { Container, Graphics } from 'pixi.js';
import { GAME_UI } from './theme/GameUITheme';
import { createPixiGameButton } from './pixiGameButton';

export type ButtonTap = () => void;

/**
 * Game HUD / menu button using official @pixi/ui FancyButton + arcade skins.
 */
export function createMenuButton(
    label: string,
    width: number,
    height: number,
    onTap: ButtonTap,
    opts?: { primary?: boolean; compact?: boolean }
): Container {
    const variant = opts?.primary ? 'primary' : opts?.compact ? 'compact' : 'secondary';
    const fontSize = opts?.compact ? Math.min(16, Math.floor(height * 0.42)) : undefined;
    return createPixiGameButton(label, width, height, onTap, { variant, fontSize });
}

export function panelFrame(g: Graphics, x: number, y: number, w: number, h: number): void {
    g.clear();
    g.roundRect(x, y, w, h, 14);
    g.fill({ color: GAME_UI.bgPanel, alpha: 0.92 });
    g.stroke({ width: 2, color: GAME_UI.strokeNeon, alpha: 0.9 });
    g.roundRect(x + 4, y + 4, w - 8, h - 8, 10);
    g.stroke({ width: 1, color: GAME_UI.strokeCyan, alpha: 0.25 });
}
