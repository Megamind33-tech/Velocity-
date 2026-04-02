import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { SONGS } from '../data/songs';

interface LevelNode {
    id: number;
    x: number;
    y: number;
    isUnlocked: boolean;
}

/**
 * Procedural World Map Scene with vertical scrolling and Bezier paths.
 */
export class WorldMapScene {
    private container: Container;
    private nodes: LevelNode[] = [];
    private graphics: Graphics;

    constructor(private app: Application) {
        this.container = new Container();
        app.stage.addChild(this.container);
        this.graphics = new Graphics();
        this.container.addChild(this.graphics);
        
        this.generateMap(SONGS.length);
        this.drawPaths();
        this.drawNodes();
        
        // Simple vertical scroll listener
        window.addEventListener('wheel', (e) => {
            this.container.y -= e.deltaY;
            // Bound scrolling
            this.container.y = Math.min(0, Math.max(this.container.y, -4000));
        });
    }

    private generateMap(count: number): void {
        const spacing = 240;
        const centerX = this.app.screen.width / 2;

        for (let i = 0; i < count; i++) {
            const song = SONGS[i];
            this.nodes.push({
                id: i + 1,
                x: centerX + (Math.sin(i * 0.75) * (song?.lessonType?.includes('harmony') ? 120 : 90)),
                y: -(i * spacing) + 500,
                isUnlocked: i < 5
            });
        }
    }

    private drawPaths(): void {
        this.graphics.clear();
        this.graphics.setStrokeStyle({ width: 4, color: 0x444444 });

        for (let i = 0; i < this.nodes.length - 1; i++) {
            const current = this.nodes[i];
            const next = this.nodes[i + 1];

            // Use Bezier curve for path
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
        const style = new TextStyle({
            fill: '#ffffff',
            fontSize: 24,
            fontWeight: 'bold'
        });

        for (const node of this.nodes) {
            const dot = new Graphics();
            const color = node.isUnlocked ? 0x00ffcc : 0x333333;
            const ringColor = node.id <= 3 ? 0x66ffcc : node.id <= 10 ? 0x66aaff : 0xffcc66;
            
            dot.circle(node.x, node.y, 30);
            dot.fill(color);
            dot.setStrokeStyle({ width: 3, color: ringColor });
            dot.stroke();
            
            const txt = new Text({ text: node.id.toString(), style });
            txt.anchor.set(0.5);
            txt.position.set(node.x, node.y);
            
            this.container.addChild(dot);
            this.container.addChild(txt);
        }
    }
}
