/**
 * ArcadeButton: Professional neon-styled arcade button
 * Built on top of @pixi/ui Button component
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Button } from '@pixi/ui';
import { ARCADE_BUTTON_STYLES, ArcadeButtonStyle, ARCADE_SIZES } from './ArcadeTheme';

export type ButtonType = 'primary' | 'secondary' | 'danger' | 'success';

/**
 * Create an arcade-styled button with neon borders and glow
 */
export function createArcadeButton(
    label: string,
    onClick: () => void,
    buttonType: ButtonType = 'primary',
    sizeType: 'small' | 'medium' | 'large' = 'medium'
): Button {
    // Get style configuration
    const style = ARCADE_BUTTON_STYLES[buttonType];
    const size = sizeType === 'small' ? ARCADE_SIZES.buttonSmall :
                 sizeType === 'large' ? ARCADE_SIZES.buttonLarge :
                 ARCADE_SIZES.buttonMedium;

    // Create the button background view
    const view = new Container();
    view.name = `arcade-button-${buttonType}`;

    // Background rectangle
    const bg = new Graphics();
    bg.roundRect(0, 0, size.width, size.height, style.cornerRadius);
    bg.fill({ color: style.backgroundColor, alpha: 0.95 });
    bg.stroke({ color: style.borderColor, width: style.borderWidth, alpha: 1.0 });
    view.addChild(bg);

    // Neon glow effect (additional border for glow)
    const glow = new Graphics();
    glow.roundRect(2, 2, size.width - 4, size.height - 4, style.cornerRadius - 2);
    glow.stroke({ color: style.borderColor, width: 1, alpha: 0.3 });
    view.addChild(glow);

    // Text label
    const textStyle = new TextStyle({
        fill: style.textColor,
        fontSize: style.fontSize,
        fontWeight: 'bold',
        fontFamily: style.fontFamily,
        dropShadow: {
            alpha: 0.8,
            blur: 4,
            color: style.borderColor,
            distance: 0,
        },
    });

    const text = new Text({ text: label, style: textStyle });
    text.anchor.set(0.5);
    text.position.set(size.width / 2, size.height / 2);
    view.addChild(text);

    // Create button using @pixi/ui Button
    const button = new Button({
        view,
    });

    // Add click handler
    button.onPress.connect(() => {
        // Trigger visual feedback
        playButtonPress(view, size);
        onClick();
    });

    // Hover effects
    button.onHover.connect(() => {
        // Increase glow on hover
        enhanceGlow(bg, style);
    });

    button.onHoverOut.connect(() => {
        // Reset glow
        resetGlow(bg, style);
    });

    // Set interactive
    button.interactive = true;
    button.cursor = 'pointer';

    return button;
}

/**
 * Play button press animation
 */
function playButtonPress(view: Container, size: any): void {
    // Scale down slightly on press
    view.scale.set(0.95);

    // Scale back up
    setTimeout(() => {
        view.scale.set(1);
    }, 100);
}

/**
 * Enhance glow effect on hover
 */
function enhanceGlow(bg: Graphics, style: ArcadeButtonStyle): void {
    // Increase border alpha for glow effect
    bg.stroke({
        color: style.borderColor,
        width: style.borderWidth + 1,
        alpha: 1.0
    });
}

/**
 * Reset glow effect
 */
function resetGlow(bg: Graphics, style: ArcadeButtonStyle): void {
    // Reset border
    bg.stroke({
        color: style.borderColor,
        width: style.borderWidth,
        alpha: 1.0
    });
}
