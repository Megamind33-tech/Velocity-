import { Container, Graphics, Ticker } from 'pixi.js';

type Particle = { g: Graphics; vx: number; vy: number; life: number; ax: number; ay: number };

/**
 * 120+ kinematic debris particles (camera layer moves with ship — no parent shake; camera overwrites layer pos).
 */
export function spawnCrashBurst(parent: Container, screenW: number, screenH: number): void {
    const cx = screenW * 0.27;
    const cy = screenH * 0.5;
    const parts: Particle[] = [];
    const n = 120;
    for (let i = 0; i < n; i++) {
        const g = new Graphics();
        const r = 1.5 + Math.random() * 2.5;
        g.circle(0, 0, r).fill({ color: [0x00ffcc, 0xff6644, 0xffffff][i % 3]!, alpha: 0.9 });
        g.position.set(cx, cy);
        parent.addChild(g);
        const ang = Math.random() * Math.PI * 2;
        const sp = 120 + Math.random() * 280;
        parts.push({
            g,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp,
            life: 0.55 + Math.random() * 0.35,
            ax: 0,
            ay: 180,
        });
    }

    const onTick = (): void => {
        const dt = Math.min(0.05, Ticker.shared.deltaMS / 1000);
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i]!;
            p.life -= dt;
            p.vy += p.ay * dt;
            p.g.x += p.vx * dt;
            p.g.y += p.vy * dt;
            p.g.alpha = Math.max(0, p.life * 1.8);
            if (p.life <= 0) {
                p.g.destroy();
                parts.splice(i, 1);
            }
        }

        if (parts.length === 0) {
            Ticker.shared.remove(onTick);
        }
    };
    Ticker.shared.add(onTick);
}
