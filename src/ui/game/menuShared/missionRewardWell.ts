/**
 * Reward rail icon well — custom badge when available, else Kenney-grade vector gem (not flat dot).
 */

import { Container, Graphics, Sprite } from 'pixi.js';
import { getVelocityCustomTexture } from '../velocityUiArt';

export function mountMissionRewardIcon(
    parent: Container,
    cx: number,
    cy: number,
    accent: number,
    rim: number,
): void {
    const badge = getVelocityCustomTexture('badge_reward');
    if (badge) {
        const s = new Sprite(badge);
        s.anchor.set(0.5);
        s.width = 22;
        s.height = 22;
        s.position.set(cx, cy);
        s.alpha = 0.9;
        parent.addChild(s);
        return;
    }
    const g = new Graphics();
    g.moveTo(cx, cy - 7);
    g.lineTo(cx + 6, cy - 1);
    g.lineTo(cx + 4, cy + 7);
    g.lineTo(cx - 4, cy + 7);
    g.lineTo(cx - 6, cy - 1);
    g.closePath();
    g.fill({ color: accent, alpha: 0.92 });
    g.stroke({ color: rim, width: 1.2, alpha: 0.55 });
    parent.addChild(g);
}
