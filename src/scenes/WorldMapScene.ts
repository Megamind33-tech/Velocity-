import { Application, Container, FederatedPointerEvent, Graphics, Rectangle, Text, TextStyle } from 'pixi.js';

interface LevelNode {
    id: number;
    x: number;
    y: number;
}

export interface WorldMapSceneOptions {
    getMaxUnlockedLevel: () => number;
    onSelectLevel: (levelId: number) => void;
}

/**
 * Procedural world map with paths between levels; tap an unlocked node to fly that track.
 */
export class WorldMapScene extends Container {
    private readonly mapRoot: Container;
    private readonly graphics: Graphics;
    private nodes: LevelNode[] = [];
    private readonly nodeGraphics: Graphics[] = [];
    private readonly nodeLabels: Text[] = [];
    private maxUnlocked: number;
    private readonly getMaxUnlocked: () => number;
    private readonly onSelectLevel: (levelId: number) => void;
    private wheelHandler: ((e: WheelEvent) => void) | null = null;

    constructor(private readonly app: Application, options: WorldMapSceneOptions) {
        super();
        this.getMaxUnlocked = options.getMaxUnlockedLevel;
        this.onSelectLevel = options.onSelectLevel;
        this.maxUnlocked = this.getMaxUnlocked();

        this.mapRoot = new Container();
        this.addChild(this.mapRoot);

        this.graphics = new Graphics();
        this.mapRoot.addChild(this.graphics);

        this.eventMode = 'static';
        this.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height);

        this.generateMap(20);
        this.redrawAll();

        const title = new Text({
            text: 'SECTOR MAP — tap a lit node to launch',
            style: new TextStyle({
                fill: '#00ffcc',
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Orbitron, Arial',
            }),
        });
        title.position.set(16, 12);
        this.addChild(title);

        this.wheelHandler = (e: WheelEvent) => {
            if (!this.visible) return;
            this.mapRoot.y -= e.deltaY;
            const minY = Math.min(0, this.app.screen.height - this.mapContentHeight());
            this.mapRoot.y = Math.min(0, Math.max(this.mapRoot.y, minY));
        };
        window.addEventListener('wheel', this.wheelHandler, { passive: true });
    }

    private mapContentHeight(): number {
        if (this.nodes.length === 0) return 0;
        const last = this.nodes[this.nodes.length - 1];
        return 500 - last.y + 80;
    }

    public refreshUnlocks(): void {
        this.maxUnlocked = this.getMaxUnlocked();
        this.redrawNodesOnly();
    }

    public destroyMap(): void {
        if (this.wheelHandler) {
            window.removeEventListener('wheel', this.wheelHandler);
            this.wheelHandler = null;
        }
        this.destroy({ children: true });
    }

    private generateMap(count: number): void {
        const spacing = 300;
        const centerX = this.app.screen.width / 2;

        for (let i = 0; i < count; i++) {
            this.nodes.push({
                id: i + 1,
                x: centerX + Math.sin(i * 0.8) * 100,
                y: -(i * spacing) + 500,
            });
        }
    }

    private redrawAll(): void {
        this.graphics.clear();
        this.graphics.setStrokeStyle({ width: 4, color: 0x444444 });

        for (let i = 0; i < this.nodes.length - 1; i++) {
            const current = this.nodes[i];
            const next = this.nodes[i + 1];
            const cp1x = current.x;
            const cp1y = current.y - 150;
            const cp2x = next.x;
            const cp2y = next.y + 150;
            this.graphics.moveTo(current.x, current.y);
            this.graphics.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
            this.graphics.stroke();
        }

        for (const g of this.nodeGraphics) {
            this.mapRoot.removeChild(g);
            g.destroy();
        }
        for (const t of this.nodeLabels) {
            this.mapRoot.removeChild(t);
            t.destroy();
        }
        this.nodeGraphics.length = 0;
        this.nodeLabels.length = 0;

        const style = new TextStyle({
            fill: '#ffffff',
            fontSize: 24,
            fontWeight: 'bold',
        });

        for (const node of this.nodes) {
            const unlocked = node.id <= this.maxUnlocked;
            const dot = new Graphics();
            const color = unlocked ? 0x00ffcc : 0x333333;
            dot.circle(0, 0, 30);
            dot.fill(color);
            dot.stroke({ width: 3, color: 0xffffff });
            dot.position.set(node.x, node.y);
            dot.eventMode = 'static';
            dot.cursor = unlocked ? 'pointer' : 'default';
            dot.on('pointerdown', (e: FederatedPointerEvent) => {
                e.stopPropagation();
                if (node.id <= this.maxUnlocked) {
                    this.onSelectLevel(node.id);
                }
            });

            const txt = new Text({ text: node.id.toString(), style });
            txt.anchor.set(0.5);
            txt.position.set(node.x, node.y);
            txt.eventMode = 'none';

            this.mapRoot.addChild(dot);
            this.mapRoot.addChild(txt);
            this.nodeGraphics.push(dot);
            this.nodeLabels.push(txt);
        }
    }

    private redrawNodesOnly(): void {
        this.maxUnlocked = this.getMaxUnlocked();
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const dot = this.nodeGraphics[i];
            if (!dot) continue;
            const unlocked = node.id <= this.maxUnlocked;
            dot.clear();
            const color = unlocked ? 0x00ffcc : 0x333333;
            dot.circle(0, 0, 30);
            dot.fill(color);
            dot.stroke({ width: 3, color: 0xffffff });
            dot.cursor = unlocked ? 'pointer' : 'default';
        }
    }
}
