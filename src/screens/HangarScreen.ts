/**
 * HangarScreen — Velocity Hangar
 *
 * Full-screen mobile portrait UI that lets the player browse and equip their
 * aircraft.  Integrates real OGA plane sprites with the Velocity design
 * language (GAME_COLORS palette, glowing borders, animated stats).
 *
 * Architecture
 * ─────────────
 * • Registered in ScreenManager → shown via navigationEvents.navigate('hangar')
 * • Self-contained: all elements drawn inline with PixiJS 8 Graphics API so the
 *   screen renders correctly without requiring Kenney sprite-sheet pre-loading.
 * • Three live animations run while the screen is visible:
 *     1. Floating selected-plane sprite  (sine-wave y offset, ~2.2 s period)
 *     2. Glow-ring pulse on detail panel (alpha sine, phase-offset rings)
 *     3. Stats-bar fill animation        (ease-out cubic, triggered on selection)
 */

import {
    Container,
    Graphics,
    Text,
    TextStyle,
    Sprite,
} from 'pixi.js';
import { navigationEvents } from './NavigationEvents';
import {
    getMainMenuProgress,
    getSelectedPlaneId,
    getUnlockedPlaneIds,
    setSelectedPlaneId,
} from '../data/localProgress';
import { getPlayerPlaneTexture } from '../game/playerPlanes';
import { GAME_COLORS } from '../ui/game/GameUITheme';

// ─── Plane catalogue ──────────────────────────────────────────────────────────

interface PlaneDef {
    id: string;
    label: string;
    tier: string;
    unlockLevel: number;
    description: string;
    speed: number;    // 0-100
    agility: number;  // 0-100
    power: number;    // 0-100
}

const PLANES: PlaneDef[] = [
    {
        id: 'cadet',
        label: 'CADET MK-I',
        tier: 'Starter',
        unlockLevel: 0,
        description: 'A reliable all-rounder for new pilots. Balanced handling with forgiving flight dynamics.',
        speed: 68,
        agility: 74,
        power: 58,
    },
    {
        id: 'cartoon',
        label: 'STUNT FOX',
        tier: 'Reach Level 3',
        unlockLevel: 3,
        description: 'Built for aerobatics. Exceptional agility lets it thread gates that catch heavier craft.',
        speed: 78,
        agility: 96,
        power: 62,
    },
    {
        id: 'scout',
        label: 'SCOUT RAPTOR',
        tier: 'Reach Level 5',
        unlockLevel: 5,
        description: 'High-speed recon frame. Swift and nimble — favourite of veteran route runners.',
        speed: 91,
        agility: 84,
        power: 74,
    },
    {
        id: 'liner',
        label: 'SKY LINER',
        tier: 'Reach Level 8',
        unlockLevel: 8,
        description: 'Heavy transport reworked for competition. Raw power compensates for reduced agility.',
        speed: 63,
        agility: 57,
        power: 93,
    },
    {
        id: 'interceptor',
        label: 'INTERCEPTOR',
        tier: 'Reach Level 10',
        unlockLevel: 10,
        description: 'Elite combat frame — the pinnacle of Velocity engineering. Maximum speed and power.',
        speed: 100,
        agility: 79,
        power: 97,
    },
];

// ─── Colour aliases (Velocity design language) ────────────────────────────────

const C = {
    bgBase:      GAME_COLORS.bg_base,
    bgSurface:   GAME_COLORS.bg_surface,
    bgElevated:  GAME_COLORS.bg_elevated,
    cyan:        GAME_COLORS.accent_cyan,
    gold:        GAME_COLORS.accent_gold,
    green:       GAME_COLORS.success,
    danger:      GAME_COLORS.danger,
    textPrimary: GAME_COLORS.text_primary,
    textSec:     GAME_COLORS.text_secondary,
    textMuted:   GAME_COLORS.text_muted,
};

// ─── HangarScreen ─────────────────────────────────────────────────────────────

export class HangarScreen extends Container {

    // ── state ──────────────────────────────────────────────────────────────
    private selectedId  = 'cadet';
    private unlockedIds = new Set<string>(['cadet']);

    // ── layer roots ────────────────────────────────────────────────────────
    private bgLayer:     Container;
    private headerLayer: Container;
    private rosterLayer: Container;
    private detailLayer: Container;
    private navLayer:    Container;

    // ── live animation handles ─────────────────────────────────────────────
    private floatRAF:    number | null = null;
    private glowRAF:     number | null = null;
    private floatSprite: Sprite  | null = null;
    private glowRing1:   Graphics | null = null;
    private glowRing2:   Graphics | null = null;

    // ── last known screen dimensions ───────────────────────────────────────
    private sw = 390;
    private sh = 844;

    constructor() {
        super();
        this.bgLayer     = new Container();
        this.headerLayer = new Container();
        this.rosterLayer = new Container();
        this.detailLayer = new Container();
        this.navLayer    = new Container();

        this.addChild(this.bgLayer);
        this.addChild(this.headerLayer);
        this.addChild(this.rosterLayer);
        this.addChild(this.detailLayer);
        this.addChild(this.navLayer);

        this.visible = false;
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Lifecycle (ScreenManager calls these)
    // ═════════════════════════════════════════════════════════════════════════

    async fadeIn(duration = 320): Promise<void> {
        this.refreshGameData();
        this.sw = window.innerWidth  || 390;
        this.sh = window.innerHeight || 844;
        this.build();
        this.visible = true;
        this.alpha   = 0;
        return new Promise(resolve => {
            const t0 = performance.now();
            const tick = (now: number) => {
                const p = Math.min((now - t0) / duration, 1);
                this.alpha = 1 - Math.pow(1 - p, 3);
                if (p < 1) requestAnimationFrame(tick);
                else { this.alpha = 1; resolve(); }
            };
            requestAnimationFrame(tick);
        });
    }

    async fadeOut(duration = 220): Promise<void> {
        this.stopAnimations();
        return new Promise(resolve => {
            const start = this.alpha;
            const t0    = performance.now();
            const tick  = (now: number) => {
                const p = Math.min((now - t0) / duration, 1);
                this.alpha = start * (1 - p);
                if (p < 1) requestAnimationFrame(tick);
                else { this.alpha = 0; this.visible = false; resolve(); }
            };
            requestAnimationFrame(tick);
        });
    }

    destroyScreen(): void {
        this.stopAnimations();
        this.destroy({ children: true });
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Data helpers
    // ═════════════════════════════════════════════════════════════════════════

    private refreshGameData(): void {
        const prog = getMainMenuProgress();
        const ids  = getUnlockedPlaneIds(prog.maxUnlocked);
        this.unlockedIds = new Set(ids);
        this.selectedId  = getSelectedPlaneId();
        if (!this.unlockedIds.has(this.selectedId)) this.selectedId = 'cadet';
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Full layout build
    // ═════════════════════════════════════════════════════════════════════════

    private build(): void {
        this.stopAnimations();
        this.bgLayer.removeChildren();
        this.headerLayer.removeChildren();
        this.rosterLayer.removeChildren();
        this.detailLayer.removeChildren();
        this.navLayer.removeChildren();

        const sw = this.sw;
        const sh = this.sh;

        const PAD       = 10;
        const HEADER_H  = 58;
        const NAV_H     = 62;
        const CONTENT_H = sh - HEADER_H - NAV_H;
        const CONTENT_W = sw - PAD * 2;
        const ROSTER_W  = Math.floor(CONTENT_W * 0.42);
        const DETAIL_W  = CONTENT_W - ROSTER_W - 8;

        this.paintBackground(sw, sh);
        this.paintHeader(PAD, 0, sw - PAD, HEADER_H);
        this.paintRoster(PAD, HEADER_H, ROSTER_W, CONTENT_H);
        this.paintDetail(PAD + ROSTER_W + 8, HEADER_H, DETAIL_W, CONTENT_H);
        this.paintNavBar(0, sh - NAV_H, sw, NAV_H);

        this.startAnimations();
    }

    /** Rebuild only when selection changes (preserves scroll / performance) */
    private rebuild(): void {
        this.build();
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Background
    // ═════════════════════════════════════════════════════════════════════════

    private paintBackground(sw: number, sh: number): void {
        const root = this.bgLayer;

        // Deep space base
        const base = new Graphics();
        base.rect(0, 0, sw, sh);
        base.fill({ color: C.bgBase });
        root.addChild(base);

        // Diagonal scanline grid — subtle atmosphere
        const grid = new Graphics();
        const step = 40;
        for (let x = -sh; x < sw + sh; x += step) {
            grid.moveTo(x, 0);
            grid.lineTo(x + sh, sh);
        }
        grid.stroke({ color: C.cyan, width: 0.5, alpha: 0.035 });
        root.addChild(grid);

        // Horizontal accent line under header region
        const hline = new Graphics();
        hline.rect(0, 0, sw, 1);
        hline.fill({ color: C.cyan, alpha: 0.06 });
        root.addChild(hline);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Header
    // ═════════════════════════════════════════════════════════════════════════

    private paintHeader(x: number, y: number, w: number, h: number): void {
        const root = this.headerLayer;

        // Bar background
        const bar = new Graphics();
        bar.rect(0, y, w + x, h);
        bar.fill({ color: C.bgSurface, alpha: 0.97 });
        bar.moveTo(0, y + h - 1);
        bar.lineTo(w + x, y + h - 1);
        bar.stroke({ color: C.cyan, width: 1.5, alpha: 0.5 });
        root.addChild(bar);

        // HANGAR title (centred)
        const title = new Text({
            text: 'HANGAR',
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: 20,
                fontWeight: 'bold',
                fill: C.cyan,
                dropShadow: { color: C.cyan, blur: 14, distance: 0, alpha: 0.65 },
            }),
        });
        title.anchor.set(0.5, 0.5);
        title.position.set((w + x) / 2, y + h / 2);
        root.addChild(title);

        // Back button
        const back = this.buildTapButton('← BACK', 78, 34, C.bgElevated, C.cyan, () => {
            navigationEvents.navigate('main-menu' as any);
        });
        back.position.set(x, y + (h - 34) / 2);
        root.addChild(back);

        // Owned-planes badge (right)
        const owned = PLANES.filter(p => this.unlockedIds.has(p.id)).length;
        const badge = new Text({
            text: `${owned} / ${PLANES.length} OWNED`,
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: 9,
                fontWeight: 'bold',
                fill: C.gold,
            }),
        });
        badge.anchor.set(1, 0.5);
        badge.position.set(w + x - x, y + h / 2);
        root.addChild(badge);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Roster panel  (left column)
    // ═════════════════════════════════════════════════════════════════════════

    private paintRoster(x: number, y: number, w: number, h: number): void {
        const root = this.rosterLayer;

        // Panel card
        const panel = new Graphics();
        panel.roundRect(x, y, w, h, 8);
        panel.fill({ color: C.bgSurface, alpha: 0.6 });
        panel.roundRect(x, y, w, h, 8);
        panel.stroke({ color: C.cyan, width: 1, alpha: 0.22 });
        root.addChild(panel);

        // Section label
        const lbl = new Text({
            text: 'SELECT CRAFT',
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: 8,
                fontWeight: 'bold',
                fill: C.textMuted,
                letterSpacing: 2,
            }),
        });
        lbl.position.set(x + 10, y + 8);
        root.addChild(lbl);

        const TOP_PAD = 26;
        const ITEM_H  = Math.floor((h - TOP_PAD) / PLANES.length);

        PLANES.forEach((plane, idx) => {
            const iy = y + TOP_PAD + idx * ITEM_H;
            const isSelected = plane.id === this.selectedId;
            const isUnlocked  = this.unlockedIds.has(plane.id);
            this.paintRosterRow(root, plane, x, iy, w, ITEM_H, isSelected, isUnlocked);
        });
    }

    private paintRosterRow(
        root: Container,
        plane: PlaneDef,
        x: number, y: number, w: number, h: number,
        isSelected: boolean,
        isUnlocked: boolean,
    ): void {
        const PAD = 5;

        // Row bg
        const rowBg = new Graphics();
        rowBg.roundRect(x + PAD, y + 2, w - PAD * 2, h - 4, 5);
        rowBg.fill({
            color: isSelected ? C.bgElevated : C.bgBase,
            alpha: isSelected ? 1 : 0.45,
        });
        root.addChild(rowBg);

        // Left accent stripe (selection indicator)
        if (isSelected) {
            const stripe = new Graphics();
            stripe.roundRect(x + PAD, y + 6, 3, h - 12, 2);
            stripe.fill({ color: C.cyan });
            root.addChild(stripe);
        }

        // OGA sprite thumbnail
        const SPR_BOX = Math.min(h - 10, 46);
        const tex   = getPlayerPlaneTexture(plane.id);
        const spr   = new Sprite(tex);
        spr.anchor.set(0.5);
        const scale = SPR_BOX / Math.max(tex.width, tex.height, 1);
        spr.scale.set(scale);
        spr.position.set(x + PAD + 8 + SPR_BOX / 2, y + h / 2);
        spr.alpha = isUnlocked ? 1 : 0.2;
        root.addChild(spr);

        // Plane name
        const name = new Text({
            text: plane.label,
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: 9,
                fontWeight: 'bold',
                fill: isSelected ? C.cyan : isUnlocked ? C.textPrimary : C.textMuted,
                wordWrap: true,
                wordWrapWidth: w - SPR_BOX - 30,
            }),
        });
        name.position.set(x + PAD + SPR_BOX + 14, y + 8);
        root.addChild(name);

        // Status chip
        const statusColor = isUnlocked ? (isSelected ? C.gold : C.green) : C.textMuted;
        const statusTxt   = isUnlocked ? (isSelected ? '● ACTIVE' : '✓ OWNED') : `🔒 Lv.${plane.unlockLevel}`;
        const status = new Text({
            text: statusTxt,
            style: new TextStyle({ fontFamily: 'monospace', fontSize: 8, fill: statusColor }),
        });
        status.position.set(x + PAD + SPR_BOX + 14, y + h - 18);
        root.addChild(status);

        // Hit area (only for unlocked planes)
        if (isUnlocked) {
            const hit = new Graphics();
            hit.rect(x + PAD, y + 2, w - PAD * 2, h - 4);
            hit.fill({ color: 0xffffff, alpha: 0.001 });
            hit.eventMode = 'static';
            hit.cursor    = 'pointer';
            hit.on('pointerdown', () => { rowBg.alpha = 0.6; });
            hit.on('pointerup',   () => { rowBg.alpha = 1; this.selectPlane(plane.id); });
            hit.on('pointerupoutside', () => { rowBg.alpha = 1; });
            root.addChild(hit);
        }

        // Dimming overlay for locked planes
        if (!isUnlocked) {
            const dim = new Graphics();
            dim.roundRect(x + PAD, y + 2, w - PAD * 2, h - 4, 5);
            dim.fill({ color: C.bgBase, alpha: 0.5 });
            root.addChild(dim);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Detail panel  (right column)
    // ═════════════════════════════════════════════════════════════════════════

    private paintDetail(x: number, y: number, w: number, h: number): void {
        const root   = this.detailLayer;
        const plane  = PLANES.find(p => p.id === this.selectedId)!;
        const owned  = this.unlockedIds.has(plane.id);
        const active = plane.id === this.selectedId && owned;

        // Panel card
        const panel = new Graphics();
        panel.roundRect(x, y, w, h, 8);
        panel.fill({ color: C.bgSurface, alpha: 0.75 });
        panel.roundRect(x, y, w, h, 8);
        panel.stroke({ color: C.cyan, width: 1.5, alpha: 0.5 });
        root.addChild(panel);

        // Corner accent brackets
        this.paintCornerAccents(root, x, y, w, h, C.cyan);

        // ── Showcase area ─────────────────────────────────────────────────────
        const SHOWCASE_H = Math.min(Math.floor(h * 0.40), 172);
        const cx         = x + w / 2;
        const cy         = y + SHOWCASE_H / 2 + 6;
        const ringR      = Math.min(w * 0.38, SHOWCASE_H * 0.44);

        // Showcase dark inset
        const inset = new Graphics();
        inset.roundRect(x + 5, y + 5, w - 10, SHOWCASE_H - 2, 5);
        inset.fill({ color: C.bgBase, alpha: 0.82 });
        root.addChild(inset);

        // Outer glow ring (animated)
        this.glowRing1 = new Graphics();
        this.glowRing1.circle(cx, cy, ringR);
        this.glowRing1.stroke({ color: C.cyan, width: 1.5, alpha: 0.22 });
        root.addChild(this.glowRing1);

        // Inner glow ring (animated, phase-offset)
        this.glowRing2 = new Graphics();
        this.glowRing2.circle(cx, cy, ringR * 0.65);
        this.glowRing2.stroke({ color: C.cyan, width: 1, alpha: 0.14 });
        root.addChild(this.glowRing2);

        // Runway reflection line
        const runway = new Graphics();
        runway.moveTo(x + 18, cy + ringR * 0.72);
        runway.lineTo(x + w - 18, cy + ringR * 0.72);
        runway.stroke({ color: C.cyan, width: 1, alpha: 0.16 });
        root.addChild(runway);

        // OGA plane sprite — LARGE, floats
        const tex    = getPlayerPlaneTexture(plane.id);
        const spr    = new Sprite(tex);
        spr.anchor.set(0.5);
        const sprH   = Math.min(SHOWCASE_H - 28, 96);
        const scale  = sprH / Math.max(tex.height, 1);
        spr.scale.set(scale);
        spr.position.set(cx, cy);
        spr.alpha    = owned ? 1 : 0.25;
        root.addChild(spr);
        this.floatSprite = spr;

        // Lock icon (if not unlocked)
        if (!owned) {
            const lockT = new Text({
                text: '🔒',
                style: new TextStyle({ fontSize: 28 }),
            });
            lockT.anchor.set(0.5);
            lockT.position.set(cx, cy);
            root.addChild(lockT);
        }

        // ── Info area ─────────────────────────────────────────────────────────
        const IX = x + 12;
        const IW = w - 24;
        let   iy = y + SHOWCASE_H + 10;

        // Plane name
        const nameText = new Text({
            text: plane.label,
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: Math.min(13, Math.floor(IW / 8)),
                fontWeight: 'bold',
                fill: C.cyan,
                dropShadow: { color: C.cyan, blur: 10, distance: 0, alpha: 0.5 },
            }),
        });
        nameText.position.set(IX, iy);
        root.addChild(nameText);
        iy += nameText.height + 3;

        // Tier badge
        const tierTxt = new Text({
            text: owned ? `✓ ${plane.tier}` : plane.tier,
            style: new TextStyle({
                fontFamily: 'monospace',
                fontSize: 9,
                fill: owned ? C.green : C.textMuted,
                fontWeight: owned ? 'bold' : 'normal',
            }),
        });
        tierTxt.position.set(IX, iy);
        root.addChild(tierTxt);
        iy += tierTxt.height + 8;

        // Separator
        const sep = new Graphics();
        sep.moveTo(IX, iy).lineTo(IX + IW, iy);
        sep.stroke({ color: C.cyan, width: 1, alpha: 0.2 });
        root.addChild(sep);
        iy += 8;

        // Description
        const descText = new Text({
            text: plane.description,
            style: new TextStyle({
                fontFamily: 'Arial, sans-serif',
                fontSize: 9,
                fill: C.textSec,
                wordWrap: true,
                wordWrapWidth: IW,
                lineHeight: 13,
            }),
        });
        descText.position.set(IX, iy);
        root.addChild(descText);
        iy += descText.height + 10;

        // ── Stat bars ─────────────────────────────────────────────────────────
        const STATS = [
            { label: 'SPEED',   value: plane.speed,   color: 0x00D1FF },
            { label: 'AGILITY', value: plane.agility, color: 0x22C55E },
            { label: 'POWER',   value: plane.power,   color: 0xFFD166 },
        ];
        const BAR_H   = 7;
        const ROW_GAP = 15;

        STATS.forEach(stat => {
            // Row label
            const lbl = new Text({
                text: stat.label,
                style: new TextStyle({
                    fontFamily: 'Orbitron, monospace',
                    fontSize: 8,
                    fontWeight: 'bold',
                    fill: C.textSec,
                    letterSpacing: 1,
                }),
            });
            lbl.position.set(IX, iy);
            root.addChild(lbl);

            // Value (right-aligned)
            const val = new Text({
                text: String(stat.value),
                style: new TextStyle({
                    fontFamily: 'Orbitron, monospace',
                    fontSize: 8,
                    fontWeight: 'bold',
                    fill: stat.color,
                }),
            });
            val.anchor.set(1, 0);
            val.position.set(IX + IW, iy);
            root.addChild(val);

            iy += lbl.height + 2;

            // Track background
            const track = new Graphics();
            track.roundRect(IX, iy, IW, BAR_H, BAR_H / 2);
            track.fill({ color: C.bgBase, alpha: 0.85 });
            root.addChild(track);

            // Animated fill bar
            const fill = new Graphics();
            root.addChild(fill);
            this.animateBar(fill, IX, iy, IW * (stat.value / 100), BAR_H, stat.color, 480);

            iy += BAR_H + ROW_GAP;
        });

        // ── Action button  (pinned near panel bottom) ─────────────────────────
        const BTN_Y = y + h - 52;
        if (owned) {
            const isActiveNow = plane.id === getSelectedPlaneId();
            const btn = this.buildActionButton(
                isActiveNow ? 'ACTIVE CRAFT ✓' : 'EQUIP THIS CRAFT',
                IW, 40,
                isActiveNow ? C.gold : C.cyan,
                () => {
                    if (!isActiveNow) {
                        setSelectedPlaneId(plane.id);
                        this.selectedId = plane.id;
                        this.rebuild();
                    }
                },
                isActiveNow,
            );
            btn.position.set(IX, BTN_Y);
            root.addChild(btn);
        } else {
            const btn = this.buildActionButton(
                `LOCKED — ${plane.tier}`,
                IW, 40, C.textMuted, () => {}, false,
            );
            btn.position.set(IX, BTN_Y);
            btn.alpha = 0.48;
            root.addChild(btn);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Nav bar (bottom strip)
    // ═════════════════════════════════════════════════════════════════════════

    private paintNavBar(x: number, y: number, w: number, h: number): void {
        const root = this.navLayer;
        const PAD  = 10;

        const bg = new Graphics();
        bg.rect(x, y, w, h);
        bg.fill({ color: C.bgSurface, alpha: 0.97 });
        bg.moveTo(x, y).lineTo(x + w, y);
        bg.stroke({ color: C.cyan, width: 1, alpha: 0.3 });
        root.addChild(bg);

        const BTN_H = 44;
        const BTN_W = Math.floor((w - PAD * 3) / 2);
        const by    = y + (h - BTN_H) / 2;

        const backBtn = this.buildActionButton('← MAIN MENU', BTN_W, BTN_H, C.bgElevated, () => {
            navigationEvents.navigate('main-menu' as any);
        }, false, /* ghost */ true);
        backBtn.position.set(PAD, by);
        root.addChild(backBtn);

        const storeBtn = this.buildActionButton('STORE  →', BTN_W, BTN_H, C.gold, () => {
            navigationEvents.navigate('shop' as any);
        });
        storeBtn.position.set(PAD * 2 + BTN_W, by);
        root.addChild(storeBtn);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Selection
    // ═════════════════════════════════════════════════════════════════════════

    private selectPlane(id: string): void {
        if (id === this.selectedId) return;
        this.selectedId = id;
        setSelectedPlaneId(id);
        this.rebuild();
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Animations
    // ═════════════════════════════════════════════════════════════════════════

    private startAnimations(): void {
        this.runFloat();
        this.runGlowPulse();
    }

    private stopAnimations(): void {
        if (this.floatRAF !== null) { cancelAnimationFrame(this.floatRAF); this.floatRAF = null; }
        if (this.glowRAF  !== null) { cancelAnimationFrame(this.glowRAF);  this.glowRAF  = null; }
        this.floatSprite = null;
        this.glowRing1   = null;
        this.glowRing2   = null;
    }

    private runFloat(): void {
        const spr   = this.floatSprite;
        if (!spr) return;
        const baseY = spr.y;
        const AMP   = 5;       // ± pixels
        const PERIOD = 2200;   // ms full cycle

        const tick = (now: number) => {
            if (!this.visible || !this.floatSprite) return;
            spr.y = baseY + Math.sin((now / PERIOD) * Math.PI * 2) * AMP;
            this.floatRAF = requestAnimationFrame(tick);
        };
        this.floatRAF = requestAnimationFrame(tick);
    }

    private runGlowPulse(): void {
        const r1 = this.glowRing1;
        const r2 = this.glowRing2;
        if (!r1 || !r2) return;
        const PERIOD = 1800;

        const tick = (now: number) => {
            if (!this.visible) return;
            const t = (now / PERIOD) * Math.PI * 2;
            r1.alpha = 0.15 + Math.sin(t)           * 0.28;
            r2.alpha = 0.10 + Math.sin(t + Math.PI) * 0.22;
            this.glowRAF = requestAnimationFrame(tick);
        };
        this.glowRAF = requestAnimationFrame(tick);
    }

    /**
     * Animate a stat-fill bar from 0 → fillW using ease-out-cubic.
     * The Graphics object must already be in the display list before calling.
     */
    private animateBar(
        g: Graphics,
        bx: number, by: number,
        fillW: number, barH: number,
        color: number,
        duration: number,
    ): void {
        const r  = barH / 2;
        const t0 = performance.now();

        const tick = (now: number) => {
            const p     = Math.min((now - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const w     = Math.max(r * 2, fillW * eased);

            g.clear();
            // Main fill
            g.roundRect(bx, by, w, barH, r);
            g.fill({ color });
            // Shine stripe
            g.roundRect(bx + 2, by + 1, Math.max(1, w - 4), Math.ceil(barH * 0.4), r - 1);
            g.fill({ color: 0xffffff, alpha: 0.16 });

            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Reusable UI factories
    // ═════════════════════════════════════════════════════════════════════════

    /** Small header / inline tap button */
    private buildTapButton(
        label: string,
        w: number, h: number,
        bgColor: number,
        accentColor: number,
        onClick: () => void,
    ): Container {
        const c  = new Container();
        const bg = new Graphics();
        bg.roundRect(0, 0, w, h, 6);
        bg.fill({ color: bgColor, alpha: 0.92 });
        bg.roundRect(0, 0, w, h, 6);
        bg.stroke({ color: accentColor, width: 1, alpha: 0.55 });
        c.addChild(bg);

        const t = new Text({
            text: label,
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: 9,
                fontWeight: 'bold',
                fill: accentColor,
            }),
        });
        t.anchor.set(0.5);
        t.position.set(w / 2, h / 2);
        c.addChild(t);

        c.eventMode = 'static';
        c.cursor = 'pointer';
        c.on('pointerdown', () => c.scale.set(0.95));
        c.on('pointerup',   () => { c.scale.set(1); onClick(); });
        c.on('pointerupoutside', () => c.scale.set(1));
        return c;
    }

    /**
     * Full-width action / nav button.
     * @param ghost   renders as outlined-only (no coloured fill) when true
     * @param dimmed  renders at reduced opacity (for "active already" state)
     */
    private buildActionButton(
        label: string,
        w: number, h: number,
        accentColor: number,
        onClick: () => void,
        dimmed  = false,
        ghost   = false,
    ): Container {
        const c  = new Container();
        const bg = new Graphics();
        bg.roundRect(0, 0, w, h, 8);
        bg.fill({ color: ghost ? accentColor : accentColor, alpha: ghost ? 0.10 : 0.16 });
        bg.roundRect(0, 0, w, h, 8);
        bg.stroke({ color: accentColor, width: 1.5, alpha: ghost ? 0.55 : 0.9 });
        c.addChild(bg);

        // Top shine
        const shine = new Graphics();
        shine.roundRect(2, 2, w - 4, Math.floor(h * 0.38), 6);
        shine.fill({ color: 0xffffff, alpha: 0.04 });
        c.addChild(shine);

        const t = new Text({
            text: label,
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: Math.min(11, Math.floor(w / (label.length * 0.7))),
                fontWeight: 'bold',
                fill: accentColor,
                dropShadow: { color: accentColor, blur: 7, distance: 0, alpha: 0.38 },
            }),
        });
        t.anchor.set(0.5);
        t.position.set(w / 2, h / 2);
        c.addChild(t);

        if (dimmed) c.alpha = 0.65;

        c.eventMode = 'static';
        c.cursor    = 'pointer';
        c.on('pointerdown', () => { c.scale.set(0.97); });
        c.on('pointerup',   () => { c.scale.set(1); onClick(); });
        c.on('pointerupoutside', () => c.scale.set(1));
        return c;
    }

    /** Four-corner bracket decoration for a panel */
    private paintCornerAccents(
        root: Container,
        x: number, y: number, w: number, h: number,
        color: number,
        len   = 12,
        thick = 1.5,
    ): void {
        const g = new Graphics();
        // top-left
        g.moveTo(x,         y + len).lineTo(x,         y).lineTo(x + len,     y);
        // top-right
        g.moveTo(x + w - len, y).lineTo(x + w, y).lineTo(x + w, y + len);
        // bottom-left
        g.moveTo(x,         y + h - len).lineTo(x,     y + h).lineTo(x + len, y + h);
        // bottom-right
        g.moveTo(x + w - len, y + h).lineTo(x + w, y + h).lineTo(x + w, y + h - len);
        g.stroke({ color, width: thick, alpha: 0.75 });
        root.addChild(g);
    }
}
