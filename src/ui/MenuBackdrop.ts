import { Container, Graphics, Ticker } from 'pixi.js';
import { GAME_UI } from './theme/GameUITheme';

/**
 * Full-screen rhythm-game atmosphere: grid floor, horizon glow, drifting notes (pure Pixi Graphics).
 */
export class MenuBackdrop extends Container {
    private w = 0;
    private h = 0;
    private grid: Graphics;
    private glow: Graphics;
    private notes: Graphics;
    private t = 0;

    constructor() {
        super();
        this.grid = new Graphics();
        this.glow = new Graphics();
        this.notes = new Graphics();
        this.addChild(this.glow, this.grid, this.notes);
    }

    activate(): void {
        Ticker.shared.add(this.tick, this);
    }

    deactivate(): void {
        Ticker.shared.remove(this.tick, this);
    }

    destroy(options?: boolean | import('pixi.js').DestroyOptions): void {
        Ticker.shared.remove(this.tick, this);
        super.destroy(options);
    }

    layout(width: number, height: number): void {
        this.w = width;
        this.h = height;
        this.redrawStatic();
    }

    private tick = (): void => {
        this.t += 0.016;
        this.drawNotes();
    };

    private redrawStatic(): void {
        const { w, h } = this;
        if (w < 1 || h < 1) return;

        this.glow.clear();
        const gradY = h * 0.35;
        this.glow.rect(0, gradY, w, h - gradY);
        this.glow.fill({ color: GAME_UI.accentHot, alpha: 0.08 });
        this.glow.rect(0, 0, w, h * 0.4);
        this.glow.fill({ color: GAME_UI.accentCool, alpha: 0.06 });

        this.grid.clear();
        const floorY = h * 0.55;
        const perspective = 0.012;
        for (let i = 0; i < 14; i++) {
            const x = (i / 14) * w * 1.4 - w * 0.2;
            const x2 = w / 2 + (x - w / 2) * (1 + perspective * 8);
            this.grid.moveTo(w / 2, floorY);
            this.grid.lineTo(x2, h + 20);
            this.grid.stroke({ width: 1, color: GAME_UI.strokeCyan, alpha: 0.15 });
        }
        for (let r = 0; r < 8; r++) {
            const y = floorY + r * 45 + (Math.sin(r) * 4);
            const spread = 1 + r * 0.12;
            this.grid.moveTo(w / 2 - 200 * spread, y);
            this.grid.lineTo(w / 2 + 200 * spread, y);
            this.grid.stroke({ width: 1, color: GAME_UI.strokeNeon, alpha: 0.12 - r * 0.01 });
        }

        this.drawNotes();
    }

    private drawNotes(): void {
        const { w, h } = this;
        this.notes.clear();
        const baseY = h * 0.22;
        for (let i = 0; i < 6; i++) {
            const phase = this.t * (0.8 + i * 0.07) + i * 1.7;
            const x = w * 0.12 + ((Math.sin(phase) * 0.5 + 0.5) * w * 0.76);
            const y = baseY + Math.sin(phase * 1.3) * 18 + i * 28;
            const wn = 14 + (i % 3) * 4;
            const hn = 10;
            const c = i % 2 === 0 ? GAME_UI.accentCool : GAME_UI.accentHot;
            this.notes.roundRect(x, y, wn, hn, 3);
            this.notes.fill({ color: c, alpha: 0.85 });
            this.notes.stroke({ width: 1, color: 0xffffff, alpha: 0.35 });
        }
    }
}
