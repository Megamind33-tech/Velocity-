import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { LEVEL_DEFINITIONS, ZONES, getZoneForLevel, ZoneDefinition } from '../data/levelDefinitions';
import { EventBus } from '../events/EventBus';
import { GameEvents } from '../events/GameEvents';

interface LevelNode {
    id: number;
    x: number;
    y: number;
    isUnlocked: boolean;
    isCompleted: boolean;
    stars: number;
    zone: ZoneDefinition | undefined;
    name: string;
}

/**
 * Procedural World Map Scene with zone-themed vertical scrolling,
 * Bezier paths, learning-progress indicators, and level selection.
 */
export class WorldMapScene {
    private container: Container;
    private nodes: LevelNode[] = [];
    private graphics: Graphics;
    private completedLevels: Set<number> = new Set();
    private levelStars: Map<number, number> = new Map();

    constructor(private app: Application) {
        this.container = new Container();
        app.stage.addChild(this.container);
        this.graphics = new Graphics();
        this.container.addChild(this.graphics);

        this.generateMap();
        this.drawZoneBackgrounds();
        this.drawPaths();
        this.drawNodes();
        this.drawZoneLabels();

        window.addEventListener('wheel', (e) => {
            this.container.y -= e.deltaY;
            const totalHeight = LEVEL_DEFINITIONS.length * 300 + 400;
            this.container.y = Math.min(0, Math.max(this.container.y, -totalHeight));
        });

        EventBus.getInstance().on(GameEvents.LEVEL_COMPLETE, (data: any) => {
            if (data && typeof data.levelId === 'number') {
                this.markLevelComplete(data.levelId, data.stars ?? 0);
            }
        });
    }

    public markLevelComplete(levelId: number, stars: number): void {
        this.completedLevels.add(levelId);
        const existing = this.levelStars.get(levelId) ?? 0;
        this.levelStars.set(levelId, Math.max(existing, stars));
        this.refreshNodes();
    }

    private generateMap(): void {
        const spacing = 300;
        const centerX = this.app.screen.width / 2;

        for (let i = 0; i < LEVEL_DEFINITIONS.length; i++) {
            const def = LEVEL_DEFINITIONS[i];
            const zone = getZoneForLevel(def.id);
            const isUnlocked = def.unlockRequirement === 0 || this.completedLevels.has(def.unlockRequirement);

            this.nodes.push({
                id: def.id,
                x: centerX + (Math.sin(i * 0.8) * 120),
                y: -(i * spacing) + 500,
                isUnlocked,
                isCompleted: this.completedLevels.has(def.id),
                stars: this.levelStars.get(def.id) ?? 0,
                zone,
                name: def.name,
            });
        }
    }

    private refreshNodes(): void {
        for (const node of this.nodes) {
            const def = LEVEL_DEFINITIONS.find(l => l.id === node.id);
            if (!def) continue;
            node.isUnlocked = def.unlockRequirement === 0 || this.completedLevels.has(def.unlockRequirement);
            node.isCompleted = this.completedLevels.has(def.id);
            node.stars = this.levelStars.get(def.id) ?? 0;
        }
        while (this.container.children.length > 0) {
            this.container.removeChildAt(0);
        }
        this.container.addChild(this.graphics);
        this.drawZoneBackgrounds();
        this.drawPaths();
        this.drawNodes();
        this.drawZoneLabels();
    }

    private drawZoneBackgrounds(): void {
        for (const zone of ZONES) {
            const firstNode = this.nodes.find(n => n.id === zone.levelRange[0]);
            const lastNode = this.nodes.find(n => n.id === zone.levelRange[1]);
            if (!firstNode || !lastNode) continue;

            const bg = new Graphics();
            const top = lastNode.y - 80;
            const bottom = firstNode.y + 80;
            const left = this.app.screen.width / 2 - 200;
            const width = 400;

            bg.roundRect(left, top, width, bottom - top, 20);
            bg.fill({ color: zone.color, alpha: 0.06 });
            bg.stroke({ color: zone.color, width: 1, alpha: 0.15 });
            this.container.addChild(bg);
        }
    }

    private drawPaths(): void {
        this.graphics.clear();

        for (let i = 0; i < this.nodes.length - 1; i++) {
            const current = this.nodes[i];
            const next = this.nodes[i + 1];
            const isActive = current.isUnlocked && next.isUnlocked;
            const pathColor = isActive ? (current.zone?.color ?? 0x444444) : 0x333333;

            this.graphics.setStrokeStyle({ width: isActive ? 4 : 2, color: pathColor, alpha: isActive ? 0.7 : 0.3 });

            const cp1x = current.x;
            const cp1y = current.y - 150;
            const cp2x = next.x;
            const cp2y = next.y + 150;

            this.graphics.moveTo(current.x, current.y);
            this.graphics.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
            this.graphics.stroke();
        }
    }

    private drawNodes(): void {
        const idStyle = new TextStyle({
            fill: '#ffffff',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Orbitron, Arial',
        });

        const nameStyle = new TextStyle({
            fill: '#aaaaaa',
            fontSize: 11,
            fontFamily: 'Orbitron, Arial',
        });

        const starStyle = new TextStyle({
            fill: '#ffcc00',
            fontSize: 12,
            fontFamily: 'Arial',
        });

        for (const node of this.nodes) {
            const dot = new Graphics();
            const zoneColor = node.zone?.color ?? 0x00ffcc;
            let fillColor: number;

            if (node.isCompleted) {
                fillColor = zoneColor;
            } else if (node.isUnlocked) {
                fillColor = 0x222244;
            } else {
                fillColor = 0x1a1a1a;
            }

            dot.circle(node.x, node.y, 28);
            dot.fill(fillColor);
            dot.setStrokeStyle({ width: node.isUnlocked ? 3 : 1, color: node.isUnlocked ? zoneColor : 0x333333 });
            dot.stroke();

            if (node.isUnlocked) {
                dot.eventMode = 'static';
                dot.cursor = 'pointer';
                dot.on('pointerdown', () => {
                    EventBus.getInstance().emit(GameEvents.LEVEL_SELECT, node.id);
                });
            }

            const idText = new Text({ text: node.id.toString(), style: idStyle });
            idText.anchor.set(0.5);
            idText.position.set(node.x, node.y - 2);
            idText.alpha = node.isUnlocked ? 1.0 : 0.3;

            const label = new Text({ text: node.name, style: nameStyle });
            label.anchor.set(0.5, 0);
            label.position.set(node.x, node.y + 34);
            label.alpha = node.isUnlocked ? 0.8 : 0.25;

            this.container.addChild(dot);
            this.container.addChild(idText);
            this.container.addChild(label);

            if (node.stars > 0) {
                const starText = new Text({ text: '★'.repeat(node.stars) + '☆'.repeat(3 - node.stars), style: starStyle });
                starText.anchor.set(0.5, 0);
                starText.position.set(node.x, node.y + 48);
                this.container.addChild(starText);
            }

            if (!node.isUnlocked) {
                const lock = new Text({ text: '🔒', style: new TextStyle({ fontSize: 16 }) });
                lock.anchor.set(0.5);
                lock.position.set(node.x + 24, node.y - 24);
                this.container.addChild(lock);
            }
        }
    }

    private drawZoneLabels(): void {
        for (const zone of ZONES) {
            const firstNode = this.nodes.find(n => n.id === zone.levelRange[0]);
            if (!firstNode) continue;

            const titleStyle = new TextStyle({
                fill: '#' + zone.color.toString(16).padStart(6, '0'),
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Orbitron, Arial',
            });

            const descStyle = new TextStyle({
                fill: '#888888',
                fontSize: 11,
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 180,
            });

            const label = new Text({ text: zone.name, style: titleStyle });
            label.anchor.set(0, 0.5);
            label.position.set(this.app.screen.width / 2 + 180, firstNode.y);

            const desc = new Text({ text: zone.description, style: descStyle });
            desc.anchor.set(0, 0);
            desc.position.set(this.app.screen.width / 2 + 180, firstNode.y + 14);

            this.container.addChild(label);
            this.container.addChild(desc);
        }
    }
}
