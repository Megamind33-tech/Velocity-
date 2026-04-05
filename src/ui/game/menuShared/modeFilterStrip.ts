/**
 * Cross-orientation mode filter (missions / routes / …) — one channel-deck system.
 * Replaces split portrait segment tabs vs landscape mode tabs personalities.
 */

import {
    Container,
    FederatedPointerEvent,
    Graphics,
    NineSliceSprite,
    Text,
    TextStyle,
} from 'pixi.js';
import { getVelocityUiTexture } from '../velocityUiArt';
import { VELOCITY_UI_SLICE } from '../velocityUiSlice';
import { kenneyTabTrack } from '../menuLandscape/kenneyLandscapeWidgets';
import { fitLabelToWidth } from './fitLabelToWidth';

const TAB_BS = VELOCITY_UI_SLICE.button;
const SCIFI_BS = VELOCITY_UI_SLICE.scifiButton;

/** Product-wide tab channel colors (same for portrait + landscape). */
export const MODE_FILTER_TAB_THEME = {
    tabActive: {
        tint: 0xc5efff,
        text: 0xf8fbff,
        face: 0x19384a,
        rim: 0x79d9ff,
        cue: 0x9fe8ff,
    },
    tabIdle: {
        tint: 0xd3deea,
        text: 0xa6b4c8,
        face: 0x0d1521,
        rim: 0x2b3a52,
    },
} as const;

export const MODE_FILTER_LABELS = ['Missions', 'Routes', 'Training', 'Fleet', 'Events'] as const;
/** Legacy abbreviations — prefer full labels + fitLabelToWidth (FIX D). */
export const MODE_FILTER_LABELS_SHORT = ['MISS.', 'ROUTE', 'TRAIN', 'FLEET', 'EVNT'] as const;

function pressTab(root: Container, onUp: () => void): void {
    root.eventMode = 'static';
    root.cursor = 'pointer';
    const stop = (e: FederatedPointerEvent) => e.stopPropagation();
    root.on('pointerdown', (e) => {
        stop(e);
        root.scale.set(0.98);
    });
    root.on('pointerup', (e) => {
        stop(e);
        root.scale.set(1);
        onUp();
    });
    root.on('pointerupoutside', () => root.scale.set(1));
    root.on('pointercancel', () => root.scale.set(1));
}

export type ModeFilterStripResult = {
    root: Container;
    setActive: (i: number) => void;
    /** Optional: portrait-only ambient glow strokes */
    tabGlows: Graphics[];
};

/**
 * @param fontFamily — GAME_FONTS.standard from caller
 * @param vectorTrackFillStroke — portrait base track when no Kenney track: { fill, stroke, strokeAlpha }
 */
export function buildModeFilterStrip(
    cw: number,
    H: number,
    fontFamily: string,
    onSelect: (index: number) => void,
    options?: {
        vectorTrack?: { fill: number; stroke: number; strokeAlpha: number; cornerRadius: number };
        useKenneyTrack?: boolean;
        /** When true, draw channel glow + bottom cue on active (portrait-style emphasis). */
        channelGlow?: boolean;
    },
): ModeFilterStripResult {
    const root = new Container();
    const useKenneyTrack = options?.useKenneyTrack !== false;
    const track =
        useKenneyTrack && kenneyTabTrack(cw, H)
            ? kenneyTabTrack(cw, H)!
            : (() => {
                  const g = new Graphics();
                  const vr = options?.vectorTrack?.cornerRadius ?? 12;
                  g.roundRect(0, 0, cw, H, vr);
                  const vt = options?.vectorTrack ?? {
                      fill: 0x030509,
                      stroke: 0x1a2638,
                      strokeAlpha: 0.6,
                      cornerRadius: 12,
                  };
                  g.fill({ color: vt.fill, alpha: 1 });
                  g.stroke({ color: vt.stroke, width: 1, alpha: vt.strokeAlpha });
                  return g;
              })();
    root.addChild(track);

    const channelGlow = options?.channelGlow ?? false;
    const n = MODE_FILTER_LABELS.length;
    const innerPad = Math.max(6, Math.floor(Math.min(cw, H) * 0.08));
    const tabGap = Math.max(4, Math.floor(Math.min(cw, H) * 0.04));
    const tabW = Math.floor((cw - innerPad * 2 - tabGap * (n - 1)) / n);
    const innerW = tabW - (channelGlow ? 4 : 6);
    const innerH = H - (channelGlow ? 12 : 16);
    const labels = MODE_FILTER_LABELS;
    const tabFontSize = tabW < 72 ? 8 : tabW < 90 ? 9 : 11;

    const sciIdle = getVelocityUiTexture('scifi_button_rectangle');
    const sciOn = getVelocityUiTexture('scifi_button_rectangle_depth');
    const useScifiTabs = innerW >= 72 && !!sciIdle && !!sciOn;
    const useK9 =
        !useScifiTabs &&
        innerW >= 72 &&
        !!getVelocityUiTexture('button_primary') &&
        !!getVelocityUiTexture('button_secondary');
    const texturedTabBg = useScifiTabs || useK9;

    const textMaxW = Math.max(36, innerW - 8);
    const buttons: Container[] = [];
    const tabGlows: Graphics[] = [];

    function makeTabLabel(str: string, on: boolean): Text {
        const capFs = on ? tabFontSize + 1 : tabFontSize;
        return fitLabelToWidth(
            str.toUpperCase(),
            textMaxW,
            (fs) =>
                new TextStyle({
                    fontFamily,
                    fontSize: Math.min(fs, capFs),
                    fontWeight: on ? '800' : '700',
                    fill: on ? MODE_FILTER_TAB_THEME.tabActive.text : MODE_FILTER_TAB_THEME.tabIdle.text,
                    letterSpacing: tabFontSize <= 9 ? 0.35 : 0.5,
                    align: 'center',
                    dropShadow: on ? { alpha: 0.5, blur: 2, color: 0x000000, distance: 1 } : undefined,
                }),
            capFs,
            7,
        );
    }

    for (let i = 0; i < n; i++) {
        const b = new Container();
        b.position.set(innerPad + i * (tabW + tabGap), channelGlow ? 6 : 7);

        const glow = new Graphics();
        tabGlows.push(glow);
        b.addChild(glow);

        if (!texturedTabBg) {
            const idleSlot = new Graphics();
            idleSlot.roundRect(0, 1, tabW - 6, H - 16, 10);
            idleSlot.fill({ color: MODE_FILTER_TAB_THEME.tabIdle.face, alpha: 0.85 });
            idleSlot.stroke({ color: MODE_FILTER_TAB_THEME.tabIdle.rim, width: 1, alpha: 0.7 });
            b.addChild(idleSlot);

            const activePlate = new Graphics();
            activePlate.visible = false;
            activePlate.roundRect(2, 0, tabW - 10, H - 17, 10);
            activePlate.fill({ color: MODE_FILTER_TAB_THEME.tabActive.face, alpha: 0.84 });
            activePlate.stroke({ color: MODE_FILTER_TAB_THEME.tabActive.rim, width: 1.4, alpha: 0.52 });
            activePlate.roundRect(8, 2, tabW - 22, 2, 1);
            activePlate.fill({ color: MODE_FILTER_TAB_THEME.tabActive.cue, alpha: 0.65 });
            b.addChild(activePlate);
        }

        let bg: NineSliceSprite | Graphics;
        if (useScifiTabs) {
            const spr = new NineSliceSprite({
                texture: sciIdle!,
                leftWidth: SCIFI_BS.L,
                rightWidth: SCIFI_BS.R,
                topHeight: SCIFI_BS.T,
                bottomHeight: SCIFI_BS.B,
                width: innerW,
                height: innerH,
            });
            spr.position.set(channelGlow ? 2 : 2, channelGlow ? 0 : 0);
            spr.alpha = 0.88;
            spr.tint = MODE_FILTER_TAB_THEME.tabIdle.tint;
            b.addChild(spr);
            bg = spr;
        } else if (useK9) {
            const spr = new NineSliceSprite({
                texture: getVelocityUiTexture('button_secondary')!,
                leftWidth: TAB_BS.L,
                rightWidth: TAB_BS.R,
                topHeight: TAB_BS.T,
                bottomHeight: TAB_BS.B,
                width: innerW,
                height: innerH,
            });
            spr.position.set(channelGlow ? 2 : 2, channelGlow ? 0 : 0);
            spr.alpha = 0.86;
            spr.tint = MODE_FILTER_TAB_THEME.tabIdle.tint;
            b.addChild(spr);
            bg = spr;
        } else {
            const gr = new Graphics();
            gr.roundRect(2, 0, tabW - 10, innerH, 10);
            gr.fill({ color: MODE_FILTER_TAB_THEME.tabIdle.face, alpha: 0.84 });
            b.addChild(gr);
            bg = gr;
        }

        const t = makeTabLabel(labels[i], false);
        t.anchor.set(0.5);
        t.position.set((tabW - 6) / 2, (H - 18) / 2 + 1);
        b.addChild(t);

        const idx = i;
        pressTab(b, () => {
            onSelect(idx);
            paint(idx);
        });
        buttons.push(b);
        root.addChild(b);
    }

    function paint(active: number): void {
        buttons.forEach((b, i) => {
            const on = i === active;
            const gw = tabGlows[i];
            gw.clear();
            if (channelGlow && on) {
                gw.roundRect(2, 0, innerW, innerH, 8);
                gw.stroke({ color: MODE_FILTER_TAB_THEME.tabActive.rim, width: 2, alpha: 0.65 });
                gw.roundRect(innerW * 0.2 + 2, innerH - 3, innerW * 0.6, 2, 1);
                gw.fill({ color: MODE_FILTER_TAB_THEME.tabActive.cue, alpha: 0.9 });
            }

            const bgIdx = texturedTabBg ? 1 : 3;
            const txIdx = texturedTabBg ? 2 : 4;
            const idle = texturedTabBg ? null : (b.children[1] as Graphics);
            const plate = texturedTabBg ? null : (b.children[2] as Graphics);
            const bg0 = b.children[bgIdx];
            const tx = b.children[txIdx] as Text;

            if (plate) plate.visible = on;
            if (idle) idle.alpha = on ? 0.22 : 0.92;

            if (useScifiTabs && bg0 instanceof NineSliceSprite) {
                bg0.texture = (on ? sciOn! : sciIdle!);
                bg0.leftWidth = SCIFI_BS.L;
                bg0.rightWidth = SCIFI_BS.R;
                bg0.topHeight = SCIFI_BS.T;
                bg0.bottomHeight = SCIFI_BS.B;
                bg0.tint = on ? MODE_FILTER_TAB_THEME.tabActive.tint : MODE_FILTER_TAB_THEME.tabIdle.tint;
                bg0.alpha = on ? 0.98 : 0.8;
            } else if (useK9 && bg0 instanceof NineSliceSprite) {
                const k = on ? 'button_primary' : 'button_secondary';
                bg0.texture = getVelocityUiTexture(k)!;
                bg0.leftWidth = TAB_BS.L;
                bg0.rightWidth = TAB_BS.R;
                bg0.topHeight = TAB_BS.T;
                bg0.bottomHeight = TAB_BS.B;
                bg0.tint = on ? MODE_FILTER_TAB_THEME.tabActive.tint : MODE_FILTER_TAB_THEME.tabIdle.tint;
                bg0.alpha = on ? 0.97 : 0.74;
            } else if (bg0 instanceof Graphics) {
                bg0.clear();
                bg0.roundRect(2, 0, tabW - 10, innerH, 10);
                bg0.fill({
                    color: on ? MODE_FILTER_TAB_THEME.tabActive.face : MODE_FILTER_TAB_THEME.tabIdle.face,
                    alpha: on ? 0.96 : 0.78,
                });
                bg0.stroke({
                    color: on ? MODE_FILTER_TAB_THEME.tabActive.rim : MODE_FILTER_TAB_THEME.tabIdle.rim,
                    width: on ? 1.5 : 1,
                    alpha: on ? 0.55 : 0.45,
                });
            }
            const nextLabel = makeTabLabel(labels[i], on);
            b.removeChild(tx);
            tx.destroy();
            nextLabel.anchor.set(0.5);
            nextLabel.position.set((tabW - 6) / 2, (H - 18) / 2 + 1);
            b.addChildAt(nextLabel, txIdx);
        });
    }

    paint(0);
    return { root, setActive: paint, tabGlows };
}
