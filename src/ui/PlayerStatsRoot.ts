import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GAME_UI } from './theme/GameUITheme';
import { createMenuButton } from './gameUiPrimitives';
import { MenuBackdrop } from './MenuBackdrop';
import { LocalPlayerStats } from '../player/LocalPlayerStats';
import { getSafeAreaInsets } from './safeArea';

/**
 * Local stats screen — rhythm-game panel layout.
 */
export class PlayerStatsRoot extends Container {
    readonly backdrop: MenuBackdrop;
    private panel = new Graphics();
    private header!: Text;
    private lines: Text[] = [];
    private btnBack!: Container;

    constructor(
        private readonly app: Application,
        private readonly onBack: () => void
    ) {
        super();
        this.backdrop = new MenuBackdrop();
        this.addChild(this.backdrop);
        this.addChild(this.panel);

        this.header = new Text({
            text: 'YOUR RUN',
            style: new TextStyle({
                fontFamily: GAME_UI.fontTitle,
                fontSize: 22,
                fill: '#ffffff',
                letterSpacing: 3,
            }),
        });
        this.header.anchor.set(0.5, 0);
        this.addChild(this.header);

        const lineStyle = new TextStyle({
            fontFamily: GAME_UI.fontBody,
            fontSize: 15,
            fontWeight: '600',
            fill: '#ccd8ff',
            letterSpacing: 0.5,
        });
        for (let i = 0; i < 4; i++) {
            const t = new Text({ text: '', style: lineStyle });
            t.anchor.set(0, 0);
            this.lines.push(t);
            this.addChild(t);
        }

        this.btnBack = createMenuButton('BACK', 120, Math.max(GAME_UI.minTouchPx, 44), () => this.onBack());
        this.addChild(this.btnBack);
    }

    layout(width: number, height: number, safeTop: number): void {
        const { bottom } = getSafeAreaInsets();
        this.backdrop.layout(width, height);

        const pw = Math.min(340, width - 28);
        const ph = 220;
        const px = (width - pw) / 2;
        const py = safeTop + 56;

        this.panel.clear();
        this.panel.roundRect(px, py, pw, ph, 16);
        this.panel.fill({ color: GAME_UI.bgPanel, alpha: 0.94 });
        this.panel.stroke({ width: 2, color: GAME_UI.strokeCyan, alpha: 0.85 });
        this.panel.roundRect(px + 5, py + 5, pw - 10, ph - 10, 12);
        this.panel.stroke({ width: 1, color: GAME_UI.strokeNeon, alpha: 0.35 });

        this.header.position.set(width / 2, safeTop + 18);

        const runs = LocalPlayerStats.getRuns();
        const best = LocalPlayerStats.getBestGates();
        const hi = LocalPlayerStats.getHighScore();
        const sec = LocalPlayerStats.getPlaySeconds();
        const mins = Math.floor(sec / 60);

        const rows = [
            `RUNS STARTED     ${runs}`,
            `BEST GATES       ${best}`,
            `HIGH SCORE       ${hi}`,
            `TIME IN RUN      ${mins}m`,
        ];
        const lx = px + 22;
        let ly = py + 28;
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].text = rows[i];
            this.lines[i].position.set(lx, ly);
            ly += 36;
        }

        this.btnBack.position.set(16, height - this.btnBack.height - 16 - bottom);
    }

    refreshNumbers(): void {
        const runs = LocalPlayerStats.getRuns();
        const best = LocalPlayerStats.getBestGates();
        const hi = LocalPlayerStats.getHighScore();
        const sec = LocalPlayerStats.getPlaySeconds();
        const mins = Math.floor(sec / 60);
        const rows = [
            `RUNS STARTED     ${runs}`,
            `BEST GATES       ${best}`,
            `HIGH SCORE       ${hi}`,
            `TIME IN RUN      ${mins}m`,
        ];
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].text = rows[i];
        }
    }

    show(): void {
        this.visible = true;
        this.refreshNumbers();
        this.backdrop.activate();
    }

    hide(): void {
        this.visible = false;
        this.backdrop.deactivate();
    }
}
