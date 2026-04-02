import { Application, Container, FederatedPointerEvent, Graphics, Rectangle, Text, TextStyle } from 'pixi.js';
import { GAME_UI } from '../ui/theme/GameUITheme';
import { createMenuButton } from '../ui/gameUiPrimitives';
import { WorldMapProgress } from '../player/WorldMapProgress';
import { CareerProgress } from '../player/CareerProgress';
import {
    getTourOrder,
    TOUR_REGIONS,
    HOME_PRESET_OPTIONS,
    type TourRegion,
    type TourRegionId,
} from '../data/worldTour';
import { WorldMapProfile } from '../player/WorldMapProfile';

export interface WorldMapHandlers {
    onBack: () => void;
    /** Tour leg 1..7 → region id for song filter */
    onSelectLeg: (legIndex: number, regionId: TourRegionId) => void;
    onHomeCountryChange?: (countryKey: string) => void;
}

interface TourPin {
    legIndex: number;
    region: TourRegion;
    x: number;
    y: number;
}

const MAP_W = 720;
const MAP_H = 420;
const PIN_R = 28;

/**
 * Stylized world map + continental tour (home country sets start, then globe order).
 */
export class WorldMapRoot extends Container {
    private scrollLayer = new Container();
    private panLayer = new Graphics();
    private oceanG = new Graphics();
    private pathG = new Graphics();
    private pins: TourPin[] = [];
    private pinViews: Container[] = [];
    private homeRow: Container;
    private homeLabel!: Text;
    private homeBtns: Container[] = [];
    private btnBack: Container;
    private title!: Text;
    private hint!: Text;
    private starsHint!: Text;
    private panning = false;
    private startX = 0;
    private startY = 0;
    private scrollX = 0;
    private scrollY = 0;
    private minScrollX = 0;
    private maxScrollX = 0;
    private minScrollY = 0;
    private maxScrollY = 0;
    /** Map viewport top in screen space (for pan math) */
    private viewTopY = 0;

    constructor(
        private readonly app: Application,
        private readonly handlers: WorldMapHandlers
    ) {
        super();
        this.eventMode = 'static';

        this.title = new Text({
            text: 'WORLD VOCAL TOUR',
            style: new TextStyle({
                fontFamily: GAME_UI.fontTitle,
                fontSize: 18,
                fill: '#ffffff',
                letterSpacing: 3,
            }),
        });
        this.title.anchor.set(0.5, 0);
        this.addChild(this.title);

        this.hint = new Text({
            text: 'Pinch the globe · Tap an open port',
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

        this.homeRow = new Container();
        this.homeLabel = new Text({
            text: 'HOME BASE',
            style: new TextStyle({
                fontFamily: GAME_UI.fontBody,
                fontSize: 9,
                fontWeight: '700',
                fill: '#00f0ff',
                letterSpacing: 2,
            }),
        });
        this.homeRow.addChild(this.homeLabel);
        this.addChild(this.homeRow);

        this.scrollLayer.addChild(this.oceanG, this.pathG, this.panLayer);
        this.addChild(this.scrollLayer);

        this.btnBack = createMenuButton('BACK', 108, 46, () => this.handlers.onBack());
        this.addChild(this.btnBack);

        this.buildHomePresets();
        this.rebuildTourPins();

        this.panLayer.eventMode = 'static';
        this.panLayer.on('pointerdown', this.onPanDown, this);
        this.panLayer.on('pointermove', this.onPanMove, this);
        this.panLayer.on('pointerup', this.onPanUp, this);
        this.panLayer.on('pointerupoutside', this.onPanUp, this);
    }

    private buildHomePresets(): void {
        const bh = 30;
        for (const opt of HOME_PRESET_OPTIONS) {
            const b = createMenuButton(opt.label.toUpperCase(), 112, bh, () => {
                WorldMapProfile.setHomeCountryKey(opt.key);
                this.handlers.onHomeCountryChange?.(opt.key);
                this.rebuildTourPins();
                this.drawMapGraphics();
                this.rebuildPinViews();
                this.refreshHeaderLine();
            });
            this.homeRow.addChild(b);
            this.homeBtns.push(b);
        }
    }

    private layoutHomePresets(width: number): void {
        const gap = 6;
        const btnW = 112;
        const btnH = 30;
        const cols = width < 420 ? 2 : width < 720 ? 3 : 4;
        let col = 0;
        let row = 0;
        for (const b of this.homeBtns) {
            b.position.set(col * (btnW + gap), 18 + row * (btnH + gap));
            col++;
            if (col >= cols) {
                col = 0;
                row++;
            }
        }
        this.homeRow.hitArea = new Rectangle(0, 0, Math.max(200, width - 24), 18 + (row + 1) * (btnH + gap));
    }

    private rebuildTourPins(): void {
        const home = WorldMapProfile.getHomeRegion();
        const order = getTourOrder(home);
        this.pins = order.map((region, i) => ({
            legIndex: i + 1,
            region,
            x: region.mapU * MAP_W,
            y: region.mapV * MAP_H,
        }));
    }

    private drawMapGraphics(): void {
        this.oceanG.clear();
        this.oceanG.roundRect(0, 0, MAP_W, MAP_H, 12);
        this.oceanG.fill({ color: 0x061220, alpha: 1 });
        this.oceanG.stroke({ width: 2, color: GAME_UI.strokeCyan, alpha: 0.45 });
        this.oceanG.eventMode = 'none';

        for (const r of TOUR_REGIONS) {
            const cx = r.mapU * MAP_W;
            const cy = r.mapV * MAP_H;
            const rx = 52 + (r.id === 'asia' ? 20 : 0);
            const ry = 38 + (r.id === 'south_america' ? 24 : 0);
            this.oceanG.ellipse(cx, cy, rx, ry);
            this.oceanG.fill({ color: r.landColor, alpha: 0.55 });
            this.oceanG.stroke({ width: 1, color: r.landColor2, alpha: 0.8 });
        }

        this.pathG.clear();
        this.pathG.eventMode = 'none';
        this.pathG.setStrokeStyle({ width: 3, color: GAME_UI.strokeNeon, alpha: 0.4 });
        for (let i = 0; i < this.pins.length - 1; i++) {
            const a = this.pins[i];
            const b = this.pins[i + 1];
            const mx = (a.x + b.x) / 2;
            const my = Math.min(a.y, b.y) - 40;
            this.pathG.moveTo(a.x, a.y);
            this.pathG.quadraticCurveTo(mx, my, b.x, b.y);
            this.pathG.stroke();
        }
    }

    private rebuildPinViews(): void {
        for (const v of this.pinViews) {
            this.scrollLayer.removeChild(v);
            v.destroy();
        }
        this.pinViews = [];

        const furthest = WorldMapProgress.getFurthestSelectableNode(this.pins.length);

        for (const pin of this.pins) {
            const open = pin.legIndex <= furthest;
            const c = new Container();
            c.position.set(pin.x, pin.y);
            c.eventMode = 'static';
            c.cursor = open ? 'pointer' : 'default';

            const ring = new Graphics();
            ring.circle(0, 0, PIN_R + 4);
            ring.stroke({ width: open ? 2 : 1, color: open ? GAME_UI.accentHot : 0x332244, alpha: open ? 0.7 : 0.35 });

            const dot = new Graphics();
            dot.circle(0, 0, PIN_R);
            dot.fill({ color: open ? pin.region.landColor : 0x1a1220, alpha: open ? 0.95 : 0.75 });
            dot.stroke({
                width: open ? 3 : 1,
                color: open ? GAME_UI.strokeCyan : 0x443355,
                alpha: open ? 1 : 0.5,
            });

            const leg = new Text({
                text: String(pin.legIndex),
                style: new TextStyle({
                    fontFamily: GAME_UI.fontBody,
                    fontSize: 14,
                    fontWeight: '700',
                    fill: open ? '#ffffff' : '#554466',
                }),
            });
            leg.anchor.set(0.5, 0.5);

            c.addChild(ring, dot, leg);

            c.on('pointertap', (e: FederatedPointerEvent) => {
                e.stopPropagation();
                if (!open) return;
                this.handlers.onSelectLeg(pin.legIndex, pin.region.id);
            });

            this.scrollLayer.addChild(c);
            this.pinViews.push(c);
        }
    }

    private refreshHeaderLine(): void {
        const home = WorldMapProfile.getHomeRegion();
        const reg = TOUR_REGIONS.find((r) => r.id === home);
        this.starsHint.text = `★ ${CareerProgress.getStars()}  ·  HOME ${reg?.label ?? ''}  ·  NEXT LEG ${WorldMapProgress.getFurthestSelectableNode(this.pins.length)}`;
    }

    private onPanDown(e: FederatedPointerEvent): void {
        this.panning = true;
        this.startX = e.global.x - this.scrollX;
        this.startY = e.global.y - this.viewTopY - this.scrollY;
    }

    private onPanMove(e: FederatedPointerEvent): void {
        if (!this.panning) return;
        this.scrollX = Math.min(this.maxScrollX, Math.max(this.minScrollX, e.global.x - this.startX));
        this.scrollY = Math.min(this.maxScrollY, Math.max(this.minScrollY, e.global.y - this.viewTopY - this.startY));
        this.scrollLayer.position.set(this.scrollX, this.viewTopY + this.scrollY);
    }

    private onPanUp(): void {
        this.panning = false;
    }

    layout(width: number, height: number, safeTop: number): void {
        this.title.position.set(width / 2, safeTop + 6);
        this.hint.position.set(width / 2, safeTop + 26);
        this.starsHint.position.set(width / 2, safeTop + 42);
        this.refreshHeaderLine();

        const homeY = safeTop + 58;
        this.homeRow.position.set(12, homeY);
        this.homeLabel.position.set(0, 0);
        this.layoutHomePresets(width);

        const topY = homeY + 52;
        this.viewTopY = topY;
        const bottomPad = 56;
        const viewW = width;
        const viewH = height - topY - bottomPad;

        this.panLayer.clear();
        this.panLayer.rect(0, 0, MAP_W, MAP_H + 20);
        this.panLayer.fill({ color: 0x000000, alpha: 0.001 });
        this.panLayer.hitArea = new Rectangle(0, 0, MAP_W, MAP_H + 20);

        const cx = Math.max(0, (viewW - MAP_W) / 2);
        const cy = 10;
        this.oceanG.position.set(cx, cy);
        this.pathG.position.set(cx, cy);
        this.panLayer.position.set(cx, cy);
        for (let i = 0; i < this.pinViews.length; i++) {
            const pin = this.pins[i];
            this.pinViews[i].position.set(cx + pin.x, cy + pin.y);
        }

        this.minScrollX = Math.min(0, viewW - MAP_W - 24);
        this.maxScrollX = 0;
        this.minScrollY = Math.min(0, viewH - MAP_H - 32);
        this.maxScrollY = 0;
        this.scrollX = Math.max(this.minScrollX, Math.min(0, this.scrollX));
        this.scrollY = Math.max(this.minScrollY, Math.min(0, this.scrollY));
        this.scrollLayer.position.set(this.scrollX, this.viewTopY + this.scrollY);

        this.btnBack.position.set(12, height - this.btnBack.height - 12);
    }

    show(): void {
        this.visible = true;
        this.rebuildTourPins();
        this.drawMapGraphics();
        this.rebuildPinViews();
        this.refreshHeaderLine();
    }

    hide(): void {
        this.visible = false;
    }
}
