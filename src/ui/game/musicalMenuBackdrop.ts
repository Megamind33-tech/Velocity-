/**
 * Musical / rhythm feel: neon stage + procedural spectrum bars (modern, not vintage).
 */

import { Container, Graphics } from 'pixi.js';
import { GAME_COLORS } from './GameUITheme';

const BAR_COUNT = 36;

export class MusicalMenuBackdrop extends Container {
    private readonly bg = new Graphics();
    private readonly barsG = new Graphics();
    private screenW = 0;
    private screenH = 0;
    private barW = 4;
    private barBaseY = 0;
    private barMaxH = 0;
    private positions: { x: number; phase: number }[] = [];
    private t = 0;

    constructor(screenW: number, screenH: number) {
        super();
        this.addChild(this.bg, this.barsG);
        for (let i = 0; i < BAR_COUNT; i++) {
            this.positions.push({ x: 0, phase: i * 0.42 + (i % 7) * 0.15 });
        }
        this.applyLayout(screenW, screenH);
    }

    applyLayout(screenW: number, screenH: number): void {
        this.screenW = screenW;
        this.screenH = screenH;

        this.bg.clear();
        this.bg.rect(0, 0, screenW, screenH);
        this.bg.fill({ color: 0x06061a });
        this.bg.rect(0, 0, screenW, screenH);
        this.bg.fill({ color: 0x1a0a2e, alpha: 0.5 });
        this.bg.roundRect(screenW * 0.08, screenH * 0.12, screenW * 0.84, screenH * 0.35, 32);
        this.bg.fill({ color: GAME_COLORS.primary, alpha: 0.06 });
        this.bg.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.12 });
        this.bg.moveTo(0, screenH * 0.72);
        this.bg.lineTo(screenW, screenH * 0.72);
        this.bg.stroke({ color: GAME_COLORS.primary, width: 1, alpha: 0.15 });

        const padX = 12;
        const usable = screenW - padX * 2;
        this.barW = Math.max(3, Math.floor(usable / BAR_COUNT) - 2);
        this.barBaseY = screenH * 0.78;
        this.barMaxH = screenH * 0.2;
        for (let i = 0; i < BAR_COUNT; i++) {
            const x = padX + i * (usable / BAR_COUNT) + (usable / BAR_COUNT - this.barW) / 2;
            this.positions[i].x = x;
        }
    }

    updateVisuals(deltaSeconds: number): void {
        this.t += deltaSeconds;
        this.barsG.clear();
        const { barW, barBaseY, barMaxH } = this;
        for (let i = 0; i < BAR_COUNT; i++) {
            const { x, phase } = this.positions[i];
            const wave =
                0.35 +
                0.65 *
                    (0.5 +
                        0.5 *
                            Math.sin(this.t * 2.8 + phase) *
                            (0.55 + 0.45 * Math.sin(this.t * 1.3 + phase * 2)));
            const h = barMaxH * wave;
            const color = i % 5 === 0 ? GAME_COLORS.accent_gold : GAME_COLORS.primary;
            this.barsG.roundRect(x, barBaseY - h, barW, h, 2);
            this.barsG.fill({ color, alpha: 0.32 + 0.28 * wave });
        }
    }
}
