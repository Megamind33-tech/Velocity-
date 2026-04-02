import { Application, Container, FederatedPointerEvent, Graphics, Rectangle, Text, TextStyle } from 'pixi.js';
import { VOCAL_STAGES, STAGE_LABEL, type VocalStage } from '../data/vocalStages';
import { GAME_UI } from '../ui/theme/GameUITheme';
import { createMenuButton } from '../ui/gameUiPrimitives';
import { WorldMapProgress } from '../player/WorldMapProgress';
import { CareerProgress } from '../player/CareerProgress';

export interface WorldMapHandlers {
    onBack: () => void;
    /** 1-based route node (matches song.worldMapNodeId) */
    onSelectNode: (nodeId: number) => void;
}

interface MapNode {
    id: number;
    stage: VocalStage;
    x: number;
    y: number;
}

const NODE_R = 34;

/**
 * Touch-pan world route (Prompt D): one node per vocal tier, unlock by route progress + stars.
 */
export class WorldMapRoot extends Container {
    private scrollLayer = new Container();
    private panLayer = new Graphics();
    private pathG = new Graphics();
    private nodes: MapNode[] = [];
    private nodeViews: Container[] = [];
    private btnBack: Container;
    private title!: Text;
    private hint!: Text;
    private starsHint!: Text;
    private panning = false;
    private startY = 0;
    private scrollY = 0;
    private minScroll = 0;
    private maxScroll = 0;

    constructor(
        private readonly app: Application,
        private readonly handlers: WorldMapHandlers
    ) {
        super();
        this.eventMode = 'static';

        this.title = new Text({
            text: 'TOUR ROUTE',
            style: new TextStyle({
                fontFamily: GAME_UI.fontTitle,
                fontSize: 20,
                fill: '#ffffff',
                letterSpacing: 4,
            }),
        });
        this.title.anchor.set(0.5, 0);
        this.addChild(this.title);

        this.hint = new Text({
            text: 'Drag to scroll · Tap a sector to fly',
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 10,
                fill: '#8899cc',
                letterSpacing: 0.5,
            }),
        });
        this.hint.anchor.set(0.5, 0);
        this.addChild(this.hint);

        this.starsHint = new Text({
            text: '',
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 11,
                fontWeight: '700',
                fill: '#ffdd44',
            }),
        });
        this.starsHint.anchor.set(0.5, 0);
        this.addChild(this.starsHint);

        this.scrollLayer.addChild(this.panLayer, this.pathG);
        this.addChild(this.scrollLayer);

        this.btnBack = createMenuButton('BACK', 108, 46, () => this.handlers.onBack());
        this.addChild(this.btnBack);

        this.buildNodes();
        this.drawPaths();

        this.panLayer.eventMode = 'static';
        this.panLayer.on('pointerdown', this.onPanDown, this);
        this.panLayer.on('pointermove', this.onPanMove, this);
        this.panLayer.on('pointerup', this.onPanUp, this);
        this.panLayer.on('pointerupoutside', this.onPanUp, this);
    }

    private buildNodes(): void {
        const count = VOCAL_STAGES.length;
        const spacing = 280;
        const w = 400;
        for (let i = 0; i < count; i++) {
            const stage = VOCAL_STAGES[i];
            const x = w / 2 + Math.sin(i * 0.75) * 110;
            const y = 120 + i * spacing;
            this.nodes.push({ id: i + 1, stage, x, y });
        }
    }

    private drawPaths(): void {
        this.pathG.clear();
        this.pathG.setStrokeStyle({ width: 4, color: GAME_UI.strokeNeon, alpha: 0.35 });
        for (let i = 0; i < this.nodes.length - 1; i++) {
            const a = this.nodes[i];
            const b = this.nodes[i + 1];
            const cp1x = a.x;
            const cp1y = a.y + 100;
            const cp2x = b.x;
            const cp2y = b.y - 100;
            this.pathG.moveTo(a.x, a.y);
            this.pathG.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, b.x, b.y);
            this.pathG.stroke();
        }
    }

    private rebuildNodeViews(): void {
        for (const v of this.nodeViews) {
            this.scrollLayer.removeChild(v);
            v.destroy();
        }
        this.nodeViews = [];

        const furthest = WorldMapProgress.getFurthestSelectableNode(this.nodes.length);
        const stars = CareerProgress.getStars();

        for (const n of this.nodes) {
            const routeOpen = n.id <= furthest;
            const c = new Container();
            c.position.set(n.x, n.y);
            c.eventMode = 'static';
            c.cursor = routeOpen ? 'pointer' : 'default';

            const dot = new Graphics();
            const locked = !routeOpen;
            const fill = locked ? 0x221830 : 0x1a1035;
            const stroke = locked ? 0x443355 : GAME_UI.strokeCyan;
            dot.circle(0, 0, NODE_R);
            dot.fill({ color: fill, alpha: locked ? 0.85 : 0.95 });
            dot.stroke({ width: locked ? 2 : 3, color: stroke, alpha: locked ? 0.5 : 1 });
            if (!locked) {
                dot.circle(0, 0, NODE_R - 8);
                dot.stroke({ width: 1, color: GAME_UI.accentHot, alpha: 0.4 });
            }

            const label = new Text({
                text: STAGE_LABEL[n.stage],
                style: new TextStyle({
                    fontFamily: GAME_UI.fontBody,
                    fontSize: 9,
                    fontWeight: '700',
                    fill: locked ? '#554466' : '#ffffff',
                    letterSpacing: 1,
                    align: 'center',
                    wordWrap: true,
                    wordWrapWidth: NODE_R * 2 - 4,
                }),
            });
            label.anchor.set(0.5, 0.5);

            const num = new Text({
                text: String(n.id),
                style: new TextStyle({
                    fontFamily: GAME_UI.fontBody,
                    fontSize: 16,
                    fontWeight: '700',
                    fill: locked ? '#443350' : '#00f0ff',
                }),
            });
            num.anchor.set(0.5, 1.15);
            num.position.set(0, NODE_R + 2);

            c.addChild(dot, label, num);

            const tap = (e: FederatedPointerEvent) => {
                e.stopPropagation();
                if (!routeOpen) return;
                this.handlers.onSelectNode(n.id);
            };
            c.on('pointertap', tap);

            this.scrollLayer.addChild(c);
            this.nodeViews.push(c);
        }
    }

    private onPanDown(e: FederatedPointerEvent): void {
        this.panning = true;
        this.startY = e.global.y - this.scrollLayer.y;
    }

    private onPanMove(e: FederatedPointerEvent): void {
        if (!this.panning) return;
        const ny = e.global.y - this.startY;
        this.scrollY = Math.min(this.maxScroll, Math.max(this.minScroll, ny));
        this.scrollLayer.y = this.scrollY;
    }

    private onPanUp(): void {
        this.panning = false;
    }

    layout(width: number, height: number, safeTop: number): void {
        this.title.position.set(width / 2, safeTop + 8);
        this.hint.position.set(width / 2, safeTop + 32);
        this.starsHint.text = `★ ${CareerProgress.getStars()}  ·  SECTOR ${WorldMapProgress.getFurthestSelectableNode(this.nodes.length)} OPEN`;
        this.starsHint.position.set(width / 2, safeTop + 48);

        const topY = safeTop + 68;
        const bottomPad = 56;
        const viewH = height - topY - bottomPad;

        const contentBottom = this.nodes[this.nodes.length - 1].y + NODE_R + 80;
        const contentH = contentBottom;
        const panW = Math.max(width, 400);
        this.panLayer.clear();
        this.panLayer.rect(-panW / 2, 0, panW, contentH);
        this.panLayer.fill({ color: 0x000000, alpha: 0.001 });
        this.panLayer.hitArea = new Rectangle(-panW / 2, 0, panW, contentH);

        this.minScroll = Math.min(0, viewH - contentH);
        this.maxScroll = 0;
        this.scrollY = Math.max(this.minScroll, Math.min(0, this.scrollY));
        this.scrollLayer.y = this.scrollY;
        this.scrollLayer.position.set(width / 2, topY);

        this.btnBack.position.set(12, height - this.btnBack.height - 12);
    }

    show(): void {
        this.visible = true;
        this.rebuildNodeViews();
        this.drawPaths();
    }

    hide(): void {
        this.visible = false;
    }
}
