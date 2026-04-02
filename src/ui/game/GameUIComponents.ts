/**
 * GameUIComponents: Reusable game UI component factory
 * Creates consistent, game-focused UI elements
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GAME_COLORS, GAME_FONTS, GAME_SIZES, GAME_BUTTON_STYLES, GAME_PANEL_STYLES } from './GameUITheme';

export type GameButtonOptions = {
    /** Override fixed pixel width (for aligned menu columns). */
    width?: number;
    /** Override fixed pixel height. */
    height?: number;
};

/**
 * Full-screen menu backdrop: gradient + soft stars (Velocity palette).
 */
/** Full-screen dimmer behind modal panels (blocks seeing menu underneath). */
export function createModalDimmer(screenW: number, screenH: number, alpha = 0.78): Graphics {
    const g = new Graphics();
    g.rect(0, 0, screenW, screenH);
    g.fill({ color: 0x050510, alpha });
    g.eventMode = 'static';
    return g;
}

export function createMenuBackdrop(screenW: number, screenH: number): Container {
    const root = new Container();
    const g = new Graphics();
    g.rect(0, 0, screenW, screenH);
    g.fill({ color: GAME_COLORS.bg_darkest });
    const band = new Graphics();
    band.rect(0, screenH * 0.35, screenW, screenH * 0.65);
    band.fill({ color: 0x12122a, alpha: 0.85 });
    root.addChild(g, band);
    const rng = (n: number) => {
        let s = n >>> 0;
        return () => {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 0xffffffff;
        };
    };
    const rand = rng(0x56454c);
    const stars = new Graphics();
    for (let i = 0; i < 120; i++) {
        const x = rand() * screenW;
        const y = rand() * screenH;
        const a = 0.15 + rand() * 0.55;
        const r = rand() < 0.85 ? 1 : 2;
        stars.circle(x, y, r).fill({ color: 0xffffff, alpha: a });
    }
    root.addChild(stars);
    const glow = new Graphics();
    glow.circle(screenW * 0.5, screenH * 0.2, Math.min(screenW, screenH) * 0.45);
    glow.fill({ color: GAME_COLORS.primary, alpha: 0.04 });
    root.addChildAt(glow, 1);
    return root;
}

/**
 * Create a game button (simple interactive container)
 */
export function createGameButton(
    label: string,
    onClick: () => void,
    type: 'primary' | 'secondary' | 'danger' | 'success' | 'accent' = 'primary',
    size: 'small' | 'medium' | 'large' = 'medium',
    opts?: GameButtonOptions
): Container {
    const style = GAME_BUTTON_STYLES[type];
    const sizeConfig = GAME_SIZES.button[size];
    const bw = opts?.width ?? sizeConfig.width;
    const bh = opts?.height ?? sizeConfig.height;

    // Create button container
    const button = new Container();
    button.name = `game-button-${type}`;
    button.eventMode = 'static';
    button.cursor = 'pointer';

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, bw, bh, GAME_SIZES.radius.small);
    bg.fill({ color: style.bg, alpha: 0.95 });
    bg.stroke({
        color: style.border,
        width: GAME_SIZES.border.normal,
        alpha: 1.0,
    });
    button.addChild(bg);

    // Text
    const textStyle = new TextStyle({
        fill: style.text,
        fontSize: style.font_size,
        fontWeight: style.font_weight as any,
        fontFamily: GAME_FONTS.arcade,
        wordWrap: true,
        wordWrapWidth: Math.max(40, bw - 16),
        align: 'center',
        dropShadow: {
            alpha: 0.6,
            blur: 2,
            color: GAME_COLORS.bg_darkest,
            distance: 1,
        },
    });

    const text = new Text({ text: label, style: textStyle });
    text.anchor.set(0.5);
    text.position.set(bw / 2, bh / 2);
    button.addChild(text);

    // Click handler
    button.on('pointerdown', (e: any) => {
        e.stopPropagation();
        onClick();
    });

    const redrawBg = (hover: boolean) => {
        const bgGraphic = button.children[0] as Graphics;
        bgGraphic.clear();
        bgGraphic.roundRect(0, 0, bw, bh, GAME_SIZES.radius.small);
        bgGraphic.fill({ color: hover ? style.hover_bg : style.bg, alpha: 0.95 });
        bgGraphic.stroke({
            color: hover ? style.hover_border : style.border,
            width: GAME_SIZES.border.normal + (hover ? 1 : 0),
            alpha: 1.0,
        });
    };

    // Hover effects (desktop / some tablets)
    button.on('pointermove', () => redrawBg(true));

    button.on('pointerout', () => redrawBg(false));

    return button;
}

/**
 * Create a game panel container
 */
export function createGamePanel(
    width: number,
    height: number,
    type: 'default' | 'hud' | 'modal' = 'default',
    title?: string
): Container & { content: Container } {
    const panel = new Container() as Container & { content: Container };
    panel.name = 'game-panel';

    const style = GAME_PANEL_STYLES[type];

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, style.corner_radius);
    bg.fill({ color: style.bg, alpha: style.bg_alpha });
    bg.stroke({
        color: style.border,
        width: style.border_width,
        alpha: 1.0,
    });
    panel.addChild(bg);

    // Title if provided
    if (title) {
        const titleStyle = new TextStyle({
            fill: style.border,
            fontSize: GAME_SIZES.font.xl,
            fontWeight: 'bold',
            fontFamily: GAME_FONTS.arcade,
            dropShadow: {
                alpha: 0.6,
                blur: 2,
                color: GAME_COLORS.bg_darkest,
                distance: 1,
            },
        });

        const titleText = new Text({ text: title, style: titleStyle });
        titleText.anchor.set(0.5, 0);
        titleText.position.set(width / 2, GAME_SIZES.spacing.lg);
        panel.addChild(titleText);
    }

    // Content container
    const contentContainer = new Container();
    contentContainer.name = 'panel-content';
    contentContainer.position.set(style.padding, title ? GAME_SIZES.spacing.xl + GAME_SIZES.spacing.lg : style.padding);
    panel.addChild(contentContainer);

    // Store reference
    panel.content = contentContainer;

    return panel;
}

/**
 * Create a text label
 */
export function createGameLabel(
    text: string,
    fontSize: number = GAME_SIZES.font.base,
    color: number = GAME_COLORS.text_primary,
    bold: boolean = false
): Text {
    const style = new TextStyle({
        fill: color,
        fontSize: fontSize,
        fontWeight: bold ? 'bold' : 'normal',
        fontFamily: GAME_FONTS.standard,
        dropShadow: {
            alpha: 0.5,
            blur: 2,
            color: GAME_COLORS.bg_darkest,
            distance: 1,
        },
    });

    return new Text({ text, style });
}

/**
 * Create a score/stat display
 */
export function createStatDisplay(label: string, value: string | number, color: number = GAME_COLORS.primary): Container {
    const container = new Container();

    const labelStyle = new TextStyle({
        fill: GAME_COLORS.text_secondary,
        fontSize: GAME_SIZES.font.sm,
        fontFamily: GAME_FONTS.standard,
    });

    const labelText = new Text({ text: label, style: labelStyle });
    labelText.position.set(0, 0);
    container.addChild(labelText);

    const valueStyle = new TextStyle({
        fill: color,
        fontSize: GAME_SIZES.font.xl,
        fontWeight: 'bold',
        fontFamily: GAME_FONTS.monospace,
        dropShadow: {
            alpha: 0.6,
            blur: 2,
            color: color,
            distance: 0,
        },
    });

    const valueText = new Text({ text: String(value), style: valueStyle });
    valueText.position.set(0, GAME_SIZES.spacing.md);
    container.addChild(valueText);

    return container;
}

/**
 * Create a progress bar
 */
export function createProgressBar(
    width: number,
    height: number,
    current: number,
    max: number,
    color: number = GAME_COLORS.primary
): Container & { setProgress: (current: number, max: number) => void } {
    const container = new Container() as Container & { setProgress: (current: number, max: number) => void };

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, GAME_SIZES.radius.small);
    bg.fill({ color: GAME_COLORS.hud_bg, alpha: 0.8 });
    bg.stroke({
        color: GAME_COLORS.border_secondary,
        width: 1,
        alpha: 0.5,
    });
    container.addChild(bg);

    // Progress fill
    const progress = Math.min(1, current / max);
    const fillWidth = width * progress;

    const fill = new Graphics();
    fill.roundRect(0, 0, fillWidth, height, GAME_SIZES.radius.small);
    fill.fill({ color: color, alpha: 0.9 });
    container.addChild(fill);

    // Method to update progress
    container.setProgress = (current: number, max: number) => {
        const newProgress = Math.min(1, current / max);
        const newFillWidth = width * newProgress;
        fill.clear();
        fill.roundRect(0, 0, newFillWidth, height, GAME_SIZES.radius.small);
        fill.fill({ color: color, alpha: 0.9 });
    };

    return container;
}

/**
 * Create a divider/separator line
 */
export function createDivider(width: number, color: number = GAME_COLORS.border_secondary, alpha: number = 0.3): Graphics {
    const divider = new Graphics();
    divider.moveTo(0, 0);
    divider.lineTo(width, 0);
    divider.stroke({ color, width: 1, alpha });
    return divider;
}

/**
 * Create a vertical spacer
 */
export function createVerticalSpacer(height: number): Container {
    const spacer = new Container();
    spacer.height = height;
    return spacer;
}
