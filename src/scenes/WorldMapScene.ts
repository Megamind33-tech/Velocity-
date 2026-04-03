import { Application, Container, FederatedPointerEvent, Graphics, Rectangle, Sprite, Text, TextStyle } from 'pixi.js';
import { getUnlockedLevelIds } from '../data/localProgress';
import { GAME_COLORS, GAME_SIZES } from '../ui/game/GameUITheme';
import { ResponsiveUIManager } from '../ui/ResponsiveUIManager';
import { mountVelocityShell, resizeVelocityShell, type VelocityShellParts } from '../ui/game/velocityScreenShell';
import { createVelocityGameButton } from '../ui/game/velocityUiButtons';
import { getVelocityUiTexture, velocityUiArtReady } from '../ui/game/velocityUiArt';

interface LevelNode {
    id: number;
    x: number;
    y: number;
    unlocked: boolean;
}

const NODE_RADIUS = 32;

/**
 * Scrollable world map: drag to pan, tap an unlocked level to start.
 */
export class WorldMapScene {
    private readonly root: Container;
    private readonly shell: VelocityShellParts;
    private readonly scrollLayer: Container;
    private readonly nodes: LevelNode[] = [];
    private readonly pathGraphics: Graphics;
    private destroyed = false;

    private dragStartY = 0;
    private dragStartScrollY = 0;
    private dragging = false;
    private pointerDown = false;

    private readonly onWheel = (e: WheelEvent): void => {
        e.preventDefault();
        this.scrollBy(-e.deltaY);
    };

    private readonly onPointerDown = (e: FederatedPointerEvent): void => {
        this.pointerDown = true;
        this.dragging = false;
        this.dragStartY = e.global.y;
        this.dragStartScrollY = this.scrollLayer.y;
    };

    private readonly onPointerMove = (e: FederatedPointerEvent): void => {
        if (!this.pointerDown) return;
        const dy = e.global.y - this.dragStartY;
        if (Math.abs(dy) > 6) this.dragging = true;
        if (this.dragging) {
            this.scrollLayer.y = this.clampScrollY(this.dragStartScrollY + dy);
        }
    };

    private readonly onPointerUp = (e: FederatedPointerEvent): void => {
        if (!this.pointerDown) return;
        this.pointerDown = false;
        if (!this.dragging) {
            this.tryPickLevel(e.global.x, e.global.y);
        }
        this.dragging = false;
    };

    constructor(
        private readonly app: Application,
        private readonly onSelectLevel: (levelId: number) => void,
        private readonly onBack?: () => void,
        levelCount: number = 20
    ) {
        this.root = new Container();
        this.shell = mountVelocityShell(this.root, app, 0.42);
        this.scrollLayer = new Container();
        this.pathGraphics = new Graphics();
        this.scrollLayer.addChild(this.pathGraphics);
        this.root.addChild(this.scrollLayer);
        app.stage.addChild(this.root);

        const safe = ResponsiveUIManager.getInstance().getSafeAreaPadding();
        const edgeL = Math.max(GAME_SIZES.spacing.md, safe.left);
        const topChrome = safe.top + 8;
        const backH = 36;
        const backW = 64;

        if (this.onBack) {
            const backBtn = createVelocityGameButton('BACK', 'secondary', () => this.onBack!(), {
                width: backW,
                height: backH,
            });
            backBtn.position.set(edgeL, topChrome);
            this.root.addChild(backBtn);
        }

        const title = new Text({
            text: 'SELECT LEVEL',
            style: new TextStyle({
                fill: GAME_COLORS.primary,
                fontSize: 22,
                fontWeight: 'bold',
                fontFamily: 'Orbitron, Arial',
                dropShadow: { blur: 8, color: '#00ffcc', distance: 0 },
            }),
        });
        title.anchor.set(0.5, 0);
        title.position.set(app.screen.width / 2, topChrome + backH + 10);
        this.root.addChild(title);

        const unlocked = getUnlockedLevelIds();
        this.generateMap(levelCount, unlocked);
        this.drawPaths();
        this.drawNodes();

        const hint = new Text({
            text: 'Drag to scroll · Tap unlocked level',
            style: new TextStyle({ fill: '#8899aa', fontSize: 12, fontFamily: 'system-ui, sans-serif' }),
        });
        hint.anchor.set(0.5, 1);
        const bottomPad = Math.max(20, safe.bottom + 12);
        hint.position.set(app.screen.width / 2, app.screen.height - bottomPad);
        this.root.addChild(hint);

        this.root.eventMode = 'static';
        this.root.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height);
        this.root.on('pointerdown', this.onPointerDown);
        this.root.on('pointermove', this.onPointerMove);
        this.root.on('pointerup', this.onPointerUp);
        this.root.on('pointerupoutside', this.onPointerUp);

        window.addEventListener('wheel', this.onWheel, { passive: false });
    }

    private generateMap(count: number, unlocked: Set<number>): void {
        const spacing = 280;
        const centerX = this.app.screen.width / 2;

        for (let i = 0; i < count; i++) {
            const id = i + 1;
            this.nodes.push({
                id,
                x: centerX + Math.sin(i * 0.75) * 120,
                y: -(i * spacing) + Math.min(420, this.app.screen.height * 0.55),
                unlocked: unlocked.has(id),
            });
        }
    }

    private scrollMinY(): number {
        if (this.nodes.length === 0) return 0;
        const bottom = this.nodes[0].y + NODE_RADIUS + 100;
        return Math.min(0, this.app.screen.height - bottom);
    }

    private scrollMaxY(): number {
        if (this.nodes.length === 0) return 0;
        const top = this.nodes[this.nodes.length - 1].y - NODE_RADIUS - 40;
        return Math.max(0, this.app.screen.height * 0.35 - top);
    }

    private clampScrollY(y: number): number {
        return Math.min(this.scrollMaxY(), Math.max(this.scrollMinY(), y));
    }

    private scrollBy(delta: number): void {
        this.scrollLayer.y = this.clampScrollY(this.scrollLayer.y + delta);
    }

    private drawPaths(): void {
        this.pathGraphics.clear();
        this.pathGraphics.setStrokeStyle({ width: 4, color: GAME_COLORS.primary, alpha: 0.35 });

        for (let i = 0; i < this.nodes.length - 1; i++) {
            const current = this.nodes[i];
            const next = this.nodes[i + 1];
            const cp1x = current.x;
            const cp1y = current.y - 120;
            const cp2x = next.x;
            const cp2y = next.y + 120;
            this.pathGraphics.moveTo(current.x, current.y);
            this.pathGraphics.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
            this.pathGraphics.stroke();
        }
    }

    private drawNodes(): void {
        const idStyle = new TextStyle({
            fill: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Orbitron, Arial',
        });

        const texOn = velocityUiArtReady() ? getVelocityUiTexture('node_unlocked') : undefined;
        const texOff = velocityUiArtReady() ? getVelocityUiTexture('node_locked') : undefined;
        const d = NODE_RADIUS * 2;

        for (const node of this.nodes) {
            const tex = node.unlocked ? texOn : texOff;
            if (tex) {
                const s = new Sprite(tex);
                s.anchor.set(0.5);
                s.width = d;
                s.height = d;
                s.position.set(node.x, node.y);
                s.alpha = node.unlocked ? 1 : 0.55;
                this.scrollLayer.addChild(s);
            } else {
                const dot = new Graphics();
                const color = node.unlocked ? 0x00ffcc : 0x333344;
                dot.circle(0, 0, NODE_RADIUS);
                dot.fill(color);
                dot.setStrokeStyle({ width: 3, color: node.unlocked ? 0xffffff : 0x222233 });
                dot.stroke();
                dot.position.set(node.x, node.y);
                this.scrollLayer.addChild(dot);
            }

            const txt = new Text({ text: node.id.toString(), style: idStyle });
            txt.anchor.set(0.5);
            txt.position.set(node.x, node.y);
            txt.alpha = node.unlocked ? 1 : 0.35;
            this.scrollLayer.addChild(txt);
        }
    }

    private tryPickLevel(globalX: number, globalY: number): void {
        const local = this.scrollLayer.toLocal({ x: globalX, y: globalY });

        for (let i = 0; i < this.nodes.length; i++) {
            const n = this.nodes[i];
            if (!n.unlocked) continue;
            const dx = local.x - n.x;
            const dy = local.y - n.y;
            if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) {
                this.onSelectLevel(n.id);
                return;
            }
        }
    }

    getRoot(): Container {
        return this.root;
    }

    destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        window.removeEventListener('wheel', this.onWheel);
        this.root.off('pointerdown', this.onPointerDown);
        this.root.off('pointermove', this.onPointerMove);
        this.root.off('pointerup', this.onPointerUp);
        this.root.off('pointerupoutside', this.onPointerUp);
        this.app.stage.removeChild(this.root);
        this.root.destroy({ children: true });
    }
}
