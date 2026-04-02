/**
 * ArcadePanel: Neon-styled panel container
 * Base container for arcade UI menus and dialogs
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { ARCADE_PANEL_STYLE, ARCADE_COLORS, ARCADE_FONTS } from './ArcadeTheme';

export interface ArcadePanelOptions {
    width: number;
    height: number;
    title?: string;
    showBorder?: boolean;
    showGlow?: boolean;
    borderColor?: number;
    backgroundColor?: number;
}

/**
 * Create an arcade-styled panel
 */
export function createArcadePanel(options: ArcadePanelOptions): Container {
    const panel = new Container();
    panel.name = 'arcade-panel';

    const {
        width,
        height,
        title,
        showBorder = true,
        showGlow = true,
        borderColor = ARCADE_PANEL_STYLE.borderColor,
        backgroundColor = ARCADE_PANEL_STYLE.backgroundColor,
    } = options;

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, ARCADE_PANEL_STYLE.cornerRadius);
    bg.fill({ color: backgroundColor, alpha: 0.9 });
    if (showBorder) {
        bg.stroke({ color: borderColor, width: ARCADE_PANEL_STYLE.borderWidth, alpha: 1.0 });
    }
    panel.addChild(bg);

    // Glow effect (outer border)
    if (showGlow) {
        const glow = new Graphics();
        glow.roundRect(-4, -4, width + 8, height + 8, ARCADE_PANEL_STYLE.cornerRadius + 2);
        glow.stroke({
            color: borderColor,
            width: 1,
            alpha: 0.2,
        });
        panel.addChildAt(glow, 0);
    }

    // Title if provided
    if (title) {
        const titleStyle = new TextStyle({
            fill: borderColor,
            fontSize: 24,
            fontWeight: 'bold',
            fontFamily: ARCADE_FONTS.primary,
            dropShadow: {
                alpha: 0.8,
                blur: 4,
                color: borderColor,
                distance: 0,
            },
        });

        const titleText = new Text({ text: title, style: titleStyle });
        titleText.anchor.set(0.5, 0);
        titleText.position.set(width / 2, 20);
        panel.addChild(titleText);
    }

    // Create a content container for child elements
    const contentContainer = new Container();
    contentContainer.name = 'arcade-panel-content';
    contentContainer.position.set(ARCADE_PANEL_STYLE.padding, title ? 60 : ARCADE_PANEL_STYLE.padding);
    panel.addChild(contentContainer);

    // Expose content container for easier child management
    (panel as any).contentContainer = contentContainer;

    return panel;
}

/**
 * Add a text label to the panel
 */
export function addPanelLabel(
    panel: Container,
    text: string,
    y: number,
    color: number = ARCADE_COLORS.white,
    fontSize: number = 14
): Text {
    const contentContainer = (panel as any).contentContainer;

    const labelStyle = new TextStyle({
        fill: color,
        fontSize: fontSize,
        fontFamily: ARCADE_FONTS.secondary,
        dropShadow: {
            alpha: 0.5,
            blur: 2,
            color: ARCADE_COLORS.black,
            distance: 1,
        },
    });

    const label = new Text({ text, style: labelStyle });
    label.position.set(0, y);
    contentContainer.addChild(label);

    return label;
}

/**
 * Add a title to the panel (if not provided at creation)
 */
export function setPanelTitle(panel: Container, title: string, color: number = ARCADE_COLORS.primary): void {
    // Remove existing title if any
    const existingTitle = panel.children.find(child => (child as any).name === 'panel-title');
    if (existingTitle) {
        panel.removeChild(existingTitle);
    }

    const titleStyle = new TextStyle({
        fill: color,
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: ARCADE_FONTS.primary,
        dropShadow: {
            alpha: 0.8,
            blur: 4,
            color: color,
            distance: 0,
        },
    });

    const titleText = new Text({ text: title, style: titleStyle });
    titleText.name = 'panel-title';
    titleText.anchor.set(0.5, 0);
    titleText.position.set(panel.width / 2, 20);
    panel.addChild(titleText);
}

/**
 * Change panel border color (for theme changes)
 */
export function setPanelBorderColor(panel: Container, color: number): void {
    const bg = panel.children[0] as Graphics;
    if (bg) {
        bg.clear();
        const width = panel.width;
        const height = panel.height;
        bg.roundRect(0, 0, width, height, ARCADE_PANEL_STYLE.cornerRadius);
        bg.fill({ color: ARCADE_PANEL_STYLE.backgroundColor, alpha: 0.9 });
        bg.stroke({ color: color, width: ARCADE_PANEL_STYLE.borderWidth, alpha: 1.0 });
    }
}
