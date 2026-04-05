/**
 * PlaneStoreScreen — Velocity Craft Store
 *
 * Full-screen mobile portrait store.  Shows all five OGA aircraft as rich
 * preview cards with real sprites, unlock conditions and a live "selected
 * card" detail area at the top.
 *
 * Architecture
 * ─────────────
 * • Registered in ScreenManager → shown via navigationEvents.navigate('plane-store')
 *   OR wired from the ShopScreen "PLANES" tab.
 * • No external component dependencies beyond PixiJS 8 core.
 * • Animations:
 *     1. Floating hero sprite      (sine-wave, ~2.4 s period)
 *     2. Glow-ring pulse           (phase-offset, on hero panel)
 *     3. Card tap ripple           (scale bounce on selection)
 *     4. Stats-bar fill animation  (ease-out cubic, 450 ms)
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

// ─── Plane catalogue (mirrored from HangarScreen for single source of truth) ──

interface PlaneDef {
    id:           string;
    label:        string;
    tier:         string;
    unlockLevel:  number;
    description:  string;
    speed:        number;
    agility:      number;
    power:        number;
    flavour:      string;   // short marketing line for the store card
}

const PLANES: PlaneDef[] = [
    {
        id:           'cadet',
        label:        'CADET MK-I',
        tier:         'Starter',
        unlockLevel:  0,
        description:  'A reliable all-rounder for new pilots with forgiving flight dynamics.',
        speed:        68,
        agility:      74,
        power:        58,
        flavour:      'Your first craft. Built to last.',
    },
    {
        id:           'cartoon',
        label:        'STUNT FOX',
        tier:         'Level 3+',
        unlockLevel:  3,
        description:  'Built for aerobatics. Exceptional agility threads gates others cannot.',
        speed:        78,
        agility:      96,
        power:        62,
        flavour:      'Maximum agility. Zero compromises.',
    },
    {
        id:           'scout',
        label:        'SCOUT RAPTOR',
        tier:         'Level 5+',
        unlockLevel:  5,
        description:  'High-speed recon frame. Favourite of veteran route runners worldwide.',
        speed:        91,
        agility:      84,
        power:        74,
        flavour:      'Swift. Precise. Relentless.',
    },
    {
        id:           'liner',
        label:        'SKY LINER',
        tier:         'Level 8+',
        unlockLevel:  8,
        description:  'Heavy transport reworked for competition. Raw power compensates agility.',
        speed:        63,
        agility:      57,
        power:        93,
        flavour:      'When raw power is the only answer.',
    },
    {
        id:           'interceptor',
        label:        'INTERCEPTOR',
        tier:         'Level 10+',
        unlockLevel:  10,
        description:  'Elite combat frame. The pinnacle of Velocity engineering.',
        speed:        100,
        agility:      79,
        power:        97,
        flavour:      'The endgame craft. Earn it.',
    },
];

// ─── Colour aliases ───────────────────────────────────────────────────────────

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

// ─── PlaneStoreScreen ─────────────────────────────────────────────────────────

export class PlaneStoreScreen extends Container {

    // ── state ──────────────────────────────────────────────────────────────
    private selectedId  = 'cadet';
    private unlockedIds = new Set<string>(['cadet']);

    // ── layer roots ────────────────────────────────────────────────────────
    private bgLayer:     Container;
    private headerLayer: Container;
    private heroLayer:   Container;
    private listLayer:   Container;
    private navLayer:    Container;

    // ── animation handles ─────────────────────────────────────────────────
    private floatRAF:    number | null = null;
    private glowRAF:     number | null = null;
    private floatSprite: Sprite   | null = null;
    private glowRing1:   Graphics | null = null;
    private glowRing2:   Graphics | null = null;

    // ── dimensions ────────────────────────────────────────────────────────
    private sw = 390;
    private sh = 844;

    constructor() {
        super();
        this.bgLayer     = new Container();
        this.headerLayer = new Container();
        this.heroLayer   = new Container();
        this.listLayer   = new Container();
        this.navLayer    = new Container();

        this.addChild(this.bgLayer);
        this.addChild(this.headerLayer);
        this.addChild(this.heroLayer);
        this.addChild(this.listLayer);
        this.addChild(this.navLayer);

        this.visible = false;
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Lifecycle
    // ═════════════════════════════════════════════════════════════════════════

    async fadeIn(duration = 320): Promise<void> {
        this.refreshData();
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
        this.stopAnims();
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
        this.stopAnims();
        this.destroy({ children: true });
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Data
    // ═════════════════════════════════════════════════════════════════════════

    private refreshData(): void {
        const prog = getMainMenuProgress();
        const ids  = getUnlockedPlaneIds(prog.maxUnlocked);
        this.unlockedIds = new Set(ids);
        this.selectedId  = getSelectedPlaneId();
        if (!this.unlockedIds.has(this.selectedId)) this.selectedId = 'cadet';
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Build
    // ═════════════════════════════════════════════════════════════════════════

    private build(): void {
        this.stopAnims();
        this.bgLayer.removeChildren();
        this.headerLayer.removeChildren();
        this.heroLayer.removeChildren();
        this.listLayer.removeChildren();
        this.navLayer.removeChildren();

        const sw = this.sw;
        const sh = this.sh;

        const PAD      = 10;
        const HEADER_H = 56;
        const NAV_H    = 62;
        const HERO_H   = Math.min(Math.floor((sh - HEADER_H - NAV_H) * 0.42), 196);
        const LIST_Y   = HEADER_H + HERO_H + 4;
        const LIST_H   = sh - LIST_Y - NAV_H;

        this.paintBg(sw, sh);
        this.paintHeader(PAD, 0, sw - PAD, HEADER_H);
        this.paintHero(PAD, HEADER_H, sw - PAD * 2, HERO_H);
        this.paintList(PAD, LIST_Y, sw - PAD * 2, LIST_H);
        this.paintNav(0, sh - NAV_H, sw, NAV_H);

        this.startAnims();
    }

    private rebuild(): void {
        this.build();
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Background
    // ═════════════════════════════════════════════════════════════════════════

    private paintBg(sw: number, sh: number): void {
        const root = this.bgLayer;

        const base = new Graphics();
        base.rect(0, 0, sw, sh);
        base.fill({ color: C.bgBase });
        root.addChild(base);

        // Angled hex-style grid
        const grid = new Graphics();
        const step = 44;
        for (let xi = -sh; xi < sw + sh; xi += step) {
            grid.moveTo(xi, 0).lineTo(xi + sh, sh);
        }
        grid.stroke({ color: C.gold, width: 0.5, alpha: 0.028 });
        root.addChild(grid);

        // Vertical edge vignette (left and right glow bands)
        const leftGlow = new Graphics();
        leftGlow.rect(0, 0, 3, sh);
        leftGlow.fill({ color: C.gold, alpha: 0.07 });
        root.addChild(leftGlow);

        const rightGlow = new Graphics();
        rightGlow.rect(sw - 3, 0, 3, sh);
        rightGlow.fill({ color: C.gold, alpha: 0.07 });
        root.addChild(rightGlow);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Header
    // ═════════════════════════════════════════════════════════════════════════

    private paintHeader(x: number, y: number, w: number, h: number): void {
        const root = this.headerLayer;

        const bar = new Graphics();
        bar.rect(0, y, x + w, h);
        bar.fill({ color: C.bgSurface, alpha: 0.97 });
        bar.moveTo(0, y + h - 1).lineTo(x + w, y + h - 1);
        bar.stroke({ color: C.gold, width: 1.5, alpha: 0.45 });
        root.addChild(bar);

        // Title
        const title = new Text({
            text: 'CRAFT STORE',
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: 19,
                fontWeight: 'bold',
                fill: C.gold,
                dropShadow: { color: C.gold, blur: 14, distance: 0, alpha: 0.6 },
            }),
        });
        title.anchor.set(0.5, 0.5);
        title.position.set((x + w) / 2, y + h / 2);
        root.addChild(title);

        // Back button
        const back = this.mkTapBtn('← BACK', 78, 34, C.bgElevated, C.gold, () => {
            navigationEvents.navigate('main-menu' as any);
        });
        back.position.set(x, y + (h - 34) / 2);
        root.addChild(back);

        // Hangar shortcut (right)
        const hBtn = this.mkTapBtn('HANGAR', 68, 34, C.bgElevated, C.cyan, () => {
            navigationEvents.navigate('hangar' as any);
        });
        hBtn.position.set(x + w - 68, y + (h - 34) / 2);
        root.addChild(hBtn);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Hero preview  (selected craft)
    // ═════════════════════════════════════════════════════════════════════════

    private paintHero(x: number, y: number, w: number, h: number): void {
        const root  = this.heroLayer;
        const plane = PLANES.find(p => p.id === this.selectedId)!;
        const owned = this.unlockedIds.has(plane.id);

        // Panel card
        const panel = new Graphics();
        panel.roundRect(x, y, w, h, 10);
        panel.fill({ color: C.bgSurface, alpha: 0.8 });
        panel.roundRect(x, y, w, h, 10);
        panel.stroke({ color: C.gold, width: 1.5, alpha: 0.55 });
        root.addChild(panel);

        this.paintCornerBrackets(root, x, y, w, h, C.gold);

        // ── Left side: sprite showcase ────────────────────────────────────────
        const SPR_ZONE_W = Math.floor(w * 0.44);
        const cx         = x + SPR_ZONE_W / 2;
        const cy         = y + h / 2;
        const ringR      = Math.min(SPR_ZONE_W, h) * 0.36;

        // Glow rings
        this.glowRing1 = new Graphics();
        this.glowRing1.circle(cx, cy, ringR);
        this.glowRing1.stroke({ color: C.gold, width: 1.5, alpha: 0.22 });
        root.addChild(this.glowRing1);

        this.glowRing2 = new Graphics();
        this.glowRing2.circle(cx, cy, ringR * 0.62);
        this.glowRing2.stroke({ color: C.gold, width: 1, alpha: 0.14 });
        root.addChild(this.glowRing2);

        // Shadow ellipse under sprite
        const shadow = new Graphics();
        shadow.ellipse(cx, cy + ringR * 0.66, ringR * 0.55, ringR * 0.14);
        shadow.fill({ color: C.gold, alpha: 0.09 });
        root.addChild(shadow);

        // OGA sprite
        const tex   = getPlayerPlaneTexture(plane.id);
        const spr   = new Sprite(tex);
        spr.anchor.set(0.5);
        const sprH  = Math.min(h - 20, 90);
        spr.scale.set(sprH / Math.max(tex.height, 1));
        spr.position.set(cx, cy);
        spr.alpha   = owned ? 1 : 0.25;
        root.addChild(spr);
        this.floatSprite = spr;

        if (!owned) {
            const lock = new Text({ text: '🔒', style: new TextStyle({ fontSize: 26 }) });
            lock.anchor.set(0.5);
            lock.position.set(cx, cy);
            root.addChild(lock);
        }

        // Vertical divider
        const div = new Graphics();
        div.moveTo(x + SPR_ZONE_W, y + 8).lineTo(x + SPR_ZONE_W, y + h - 8);
        div.stroke({ color: C.gold, width: 1, alpha: 0.2 });
        root.addChild(div);

        // ── Right side: info ──────────────────────────────────────────────────
        const IX = x + SPR_ZONE_W + 10;
        const IW = w - SPR_ZONE_W - 20;
        let   iy = y + 10;

        // Plane name
        const nameT = new Text({
            text: plane.label,
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: Math.min(13, Math.floor(IW / 7.5)),
                fontWeight: 'bold',
                fill: C.gold,
                dropShadow: { color: C.gold, blur: 8, distance: 0, alpha: 0.45 },
            }),
        });
        nameT.position.set(IX, iy);
        root.addChild(nameT);
        iy += nameT.height + 3;

        // Tier / status line
        const tierColor = owned ? C.green : C.textMuted;
        const tierTxt   = owned ? `✓ OWNED  ·  ${plane.tier}` : plane.tier;
        const tier = new Text({
            text: tierTxt,
            style: new TextStyle({ fontFamily: 'monospace', fontSize: 9, fill: tierColor, fontWeight: owned ? 'bold' : 'normal' }),
        });
        tier.position.set(IX, iy);
        root.addChild(tier);
        iy += tier.height + 8;

        // Flavour line
        const flav = new Text({
            text: `"${plane.flavour}"`,
            style: new TextStyle({
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'italic',
                fontSize: 9,
                fill: C.textSec,
                wordWrap: true,
                wordWrapWidth: IW,
                lineHeight: 12,
            }),
        });
        flav.position.set(IX, iy);
        root.addChild(flav);
        iy += flav.height + 8;

        // Mini stats
        const STATS = [
            { label: 'SPD', value: plane.speed,   color: 0x00D1FF },
            { label: 'AGL', value: plane.agility, color: 0x22C55E },
            { label: 'PWR', value: plane.power,   color: 0xFFD166 },
        ];
        const SBAR_W = Math.floor((IW - 8) / 3);
        const SBAR_H = 5;

        STATS.forEach((s, si) => {
            const sx = IX + si * (SBAR_W + 4);

            const lbl = new Text({
                text: s.label,
                style: new TextStyle({ fontFamily: 'Orbitron, monospace', fontSize: 7, fill: s.color, fontWeight: 'bold' }),
            });
            lbl.position.set(sx, iy);
            root.addChild(lbl);

            const track = new Graphics();
            track.roundRect(sx, iy + 10, SBAR_W, SBAR_H, SBAR_H / 2);
            track.fill({ color: C.bgBase, alpha: 0.8 });
            root.addChild(track);

            const fill = new Graphics();
            root.addChild(fill);
            this.animateBar(fill, sx, iy + 10, SBAR_W * (s.value / 100), SBAR_H, s.color, 450);
        });

        iy += 26;

        // Action button (equip / locked)
        const remaining = h - (iy - y) - 10;
        if (remaining >= 32) {
            const btnH  = Math.min(40, remaining);
            const isAct = owned && plane.id === getSelectedPlaneId();
            const btn   = this.mkActionBtn(
                isAct ? 'ACTIVE CRAFT ✓' : owned ? 'EQUIP CRAFT' : `UNLOCK AT ${plane.tier}`,
                IW, btnH,
                isAct ? C.gold : owned ? C.cyan : C.textMuted,
                () => {
                    if (owned && !isAct) {
                        setSelectedPlaneId(plane.id);
                        this.selectedId = plane.id;
                        this.rebuild();
                    }
                },
                isAct,
                !owned,
            );
            btn.position.set(IX, iy);
            if (!owned) btn.alpha = 0.48;
            root.addChild(btn);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Plane list (scrollable cards below hero)
    // ═════════════════════════════════════════════════════════════════════════

    private paintList(x: number, y: number, w: number, h: number): void {
        const root = this.listLayer;

        // Section label
        const lbl = new Text({
            text: 'ALL AIRCRAFT',
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: 8,
                fontWeight: 'bold',
                fill: C.textMuted,
                letterSpacing: 2,
            }),
        });
        lbl.position.set(x, y);
        root.addChild(lbl);

        const CARD_H   = Math.floor((h - 20) / PLANES.length);
        const CARD_GAP = 4;
        const startY   = y + 18;

        PLANES.forEach((plane, idx) => {
            const cy = startY + idx * (CARD_H + CARD_GAP);
            const isSelected = plane.id === this.selectedId;
            const isUnlocked  = this.unlockedIds.has(plane.id);
            this.paintPlaneCard(root, plane, x, cy, w, CARD_H, isSelected, isUnlocked);
        });
    }

    private paintPlaneCard(
        root: Container,
        plane: PlaneDef,
        x: number, y: number, w: number, h: number,
        isSelected: boolean,
        isUnlocked: boolean,
    ): void {

        // Card background
        const card = new Graphics();
        card.roundRect(x, y, w, h, 7);
        card.fill({ color: isSelected ? C.bgElevated : C.bgSurface, alpha: isSelected ? 1 : 0.55 });
        root.addChild(card);

        // Selected border
        if (isSelected) {
            const border = new Graphics();
            border.roundRect(x, y, w, h, 7);
            border.stroke({ color: C.gold, width: 1.5, alpha: 0.85 });
            root.addChild(border);
        } else {
            const border = new Graphics();
            border.roundRect(x, y, w, h, 7);
            border.stroke({ color: C.cyan, width: 0.5, alpha: 0.15 });
            root.addChild(border);
        }

        // Left accent stripe (active craft)
        if (isSelected) {
            const stripe = new Graphics();
            stripe.roundRect(x, y + 5, 3, h - 10, 2);
            stripe.fill({ color: C.gold });
            root.addChild(stripe);
        }

        // OGA sprite thumbnail
        const SPR_W  = Math.min(h - 8, 52);
        const tex    = getPlayerPlaneTexture(plane.id);
        const spr    = new Sprite(tex);
        spr.anchor.set(0.5);
        spr.scale.set(SPR_W / Math.max(tex.width, tex.height, 1));
        spr.position.set(x + 10 + SPR_W / 2, y + h / 2);
        spr.alpha    = isUnlocked ? 1 : 0.18;
        root.addChild(spr);

        // Locked overlay tint
        if (!isUnlocked) {
            const dim = new Graphics();
            dim.roundRect(x, y, w, h, 7);
            dim.fill({ color: C.bgBase, alpha: 0.45 });
            root.addChild(dim);
        }

        // Plane label
        const nameColor = isSelected ? C.gold : isUnlocked ? C.textPrimary : C.textMuted;
        const name = new Text({
            text: plane.label,
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: 10,
                fontWeight: 'bold',
                fill: nameColor,
            }),
        });
        name.position.set(x + SPR_W + 20, y + 7);
        root.addChild(name);

        // Tier / flavour line
        const sub = new Text({
            text: isUnlocked ? plane.flavour : `🔒  ${plane.tier}`,
            style: new TextStyle({
                fontFamily: 'Arial, sans-serif',
                fontSize: 9,
                fill: isUnlocked ? C.textSec : C.textMuted,
                wordWrap: true,
                wordWrapWidth: w - SPR_W - 100,
            }),
        });
        sub.position.set(x + SPR_W + 20, y + 7 + name.height + 2);
        root.addChild(sub);

        // Right-side badges stack
        const BADGE_X = x + w - 8;
        let   by      = y + 6;

        // Tier badge
        const tierBg = new Graphics();
        const tierW  = 60;
        const tierH  = 18;
        tierBg.roundRect(BADGE_X - tierW, by, tierW, tierH, 4);
        tierBg.fill({ color: isUnlocked ? C.green : C.bgElevated, alpha: isUnlocked ? 0.25 : 0.5 });
        tierBg.roundRect(BADGE_X - tierW, by, tierW, tierH, 4);
        tierBg.stroke({ color: isUnlocked ? C.green : C.textMuted, width: 1, alpha: 0.7 });
        root.addChild(tierBg);

        const tierTxt = new Text({
            text: isUnlocked ? 'OWNED' : plane.tier,
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: 7,
                fontWeight: 'bold',
                fill: isUnlocked ? C.green : C.textMuted,
            }),
        });
        tierTxt.anchor.set(0.5, 0.5);
        tierTxt.position.set(BADGE_X - tierW / 2, by + tierH / 2);
        root.addChild(tierTxt);

        by += tierH + 4;

        // Stat mini-row (speed + power)
        const spdTxt = new Text({
            text: `SPD ${plane.speed}`,
            style: new TextStyle({ fontFamily: 'monospace', fontSize: 8, fill: 0x00D1FF }),
        });
        spdTxt.anchor.set(1, 0);
        spdTxt.position.set(BADGE_X, by);
        root.addChild(spdTxt);

        by += spdTxt.height + 1;

        const pwrTxt = new Text({
            text: `PWR ${plane.power}`,
            style: new TextStyle({ fontFamily: 'monospace', fontSize: 8, fill: 0xFFD166 }),
        });
        pwrTxt.anchor.set(1, 0);
        pwrTxt.position.set(BADGE_X, by);
        root.addChild(pwrTxt);

        // Hit area
        const hit = new Graphics();
        hit.rect(x, y, w, h);
        hit.fill({ color: 0xffffff, alpha: 0.001 });
        hit.eventMode = 'static';
        hit.cursor    = 'pointer';
        hit.on('pointerdown', () => { card.alpha = 0.7; });
        hit.on('pointerup', () => {
            card.alpha = 1;
            this.selectPlane(plane.id);
        });
        hit.on('pointerupoutside', () => { card.alpha = 1; });
        root.addChild(hit);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Nav bar
    // ═════════════════════════════════════════════════════════════════════════

    private paintNav(x: number, y: number, w: number, h: number): void {
        const root = this.navLayer;
        const PAD  = 10;

        const bg = new Graphics();
        bg.rect(x, y, w, h);
        bg.fill({ color: C.bgSurface, alpha: 0.97 });
        bg.moveTo(x, y).lineTo(x + w, y);
        bg.stroke({ color: C.gold, width: 1, alpha: 0.28 });
        root.addChild(bg);

        const BTN_H = 44;
        const BTN_W = Math.floor((w - PAD * 3) / 2);
        const by    = y + (h - BTN_H) / 2;

        const backBtn = this.mkActionBtn('← MAIN MENU', BTN_W, BTN_H, C.bgElevated, () => {
            navigationEvents.navigate('main-menu' as any);
        }, false, true);
        backBtn.position.set(PAD, by);
        root.addChild(backBtn);

        const hangarBtn = this.mkActionBtn('HANGAR →', BTN_W, BTN_H, C.cyan, () => {
            navigationEvents.navigate('hangar' as any);
        });
        hangarBtn.position.set(PAD * 2 + BTN_W, by);
        root.addChild(hangarBtn);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Selection
    // ═════════════════════════════════════════════════════════════════════════

    private selectPlane(id: string): void {
        if (id === this.selectedId) return;
        this.selectedId = id;
        this.rebuild();
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  Animations
    // ═════════════════════════════════════════════════════════════════════════

    private startAnims(): void {
        this.runFloat();
        this.runGlow();
    }

    private stopAnims(): void {
        if (this.floatRAF !== null) { cancelAnimationFrame(this.floatRAF); this.floatRAF = null; }
        if (this.glowRAF  !== null) { cancelAnimationFrame(this.glowRAF);  this.glowRAF  = null; }
        this.floatSprite = null;
        this.glowRing1   = null;
        this.glowRing2   = null;
    }

    private runFloat(): void {
        const spr = this.floatSprite;
        if (!spr) return;
        const baseY  = spr.y;
        const AMP    = 5;
        const PERIOD = 2400;
        const tick   = (now: number) => {
            if (!this.visible || !this.floatSprite) return;
            spr.y = baseY + Math.sin((now / PERIOD) * Math.PI * 2) * AMP;
            this.floatRAF = requestAnimationFrame(tick);
        };
        this.floatRAF = requestAnimationFrame(tick);
    }

    private runGlow(): void {
        const r1 = this.glowRing1;
        const r2 = this.glowRing2;
        if (!r1 || !r2) return;
        const PERIOD = 1900;
        const tick   = (now: number) => {
            if (!this.visible) return;
            const t = (now / PERIOD) * Math.PI * 2;
            r1.alpha = 0.12 + Math.sin(t)           * 0.26;
            r2.alpha = 0.08 + Math.sin(t + Math.PI) * 0.20;
            this.glowRAF = requestAnimationFrame(tick);
        };
        this.glowRAF = requestAnimationFrame(tick);
    }

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
            g.roundRect(bx, by, w, barH, r);
            g.fill({ color });
            g.roundRect(bx + 1, by + 1, Math.max(1, w - 2), Math.ceil(barH * 0.4), r - 0.5);
            g.fill({ color: 0xffffff, alpha: 0.16 });
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  UI factories
    // ═════════════════════════════════════════════════════════════════════════

    private mkTapBtn(
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
            style: new TextStyle({ fontFamily: 'Orbitron, monospace', fontSize: 9, fontWeight: 'bold', fill: accentColor }),
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

    private mkActionBtn(
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
        bg.fill({ color: accentColor, alpha: ghost ? 0.10 : 0.16 });
        bg.roundRect(0, 0, w, h, 8);
        bg.stroke({ color: accentColor, width: 1.5, alpha: ghost ? 0.5 : 0.88 });
        c.addChild(bg);

        const shine = new Graphics();
        shine.roundRect(2, 2, w - 4, Math.floor(h * 0.38), 6);
        shine.fill({ color: 0xffffff, alpha: 0.04 });
        c.addChild(shine);

        const t = new Text({
            text: label,
            style: new TextStyle({
                fontFamily: 'Orbitron, monospace',
                fontSize: Math.min(11, Math.floor(w / (label.length * 0.68))),
                fontWeight: 'bold',
                fill: accentColor,
                dropShadow: { color: accentColor, blur: 6, distance: 0, alpha: 0.36 },
            }),
        });
        t.anchor.set(0.5);
        t.position.set(w / 2, h / 2);
        c.addChild(t);

        if (dimmed) c.alpha = 0.65;

        c.eventMode = 'static';
        c.cursor    = 'pointer';
        c.on('pointerdown', () => c.scale.set(0.97));
        c.on('pointerup',   () => { c.scale.set(1); onClick(); });
        c.on('pointerupoutside', () => c.scale.set(1));
        return c;
    }

    private paintCornerBrackets(
        root: Container,
        x: number, y: number, w: number, h: number,
        color: number,
        len   = 12,
        thick = 1.5,
    ): void {
        const g = new Graphics();
        g.moveTo(x,         y + len).lineTo(x,         y).lineTo(x + len,     y);
        g.moveTo(x + w - len, y).lineTo(x + w, y).lineTo(x + w, y + len);
        g.moveTo(x,         y + h - len).lineTo(x,     y + h).lineTo(x + len, y + h);
        g.moveTo(x + w - len, y + h).lineTo(x + w, y + h).lineTo(x + w, y + h - len);
        g.stroke({ color, width: thick, alpha: 0.72 });
        root.addChild(g);
    }
}
