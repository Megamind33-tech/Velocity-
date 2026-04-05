/**
 * UIButton Component
 * Game-quality button with hexagonal/sci-fi design
 * Supports multiple states, icons, and variants
 *
 * Requires Kenney UI Pack assets:
 * - assets/ui/kenney/buttons/button_long.png (20px slicing)
 * - assets/ui/kenney/buttons/button_square.png (20px slicing)
 */

import {
  Container,
  NineSliceSprite,
  Texture,
  Text,
  Sprite,
  Graphics,
  BlurFilter,
} from 'pixi.js';
import { ColorTheme } from '../utils/ColorTheme';
import { TEXT_STYLES } from '../config/typography';
import { SPACING } from '../config/spacing';
import { COLORS } from '../config/colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
type ButtonState = 'normal' | 'hover' | 'active' | 'disabled';

interface UIButtonConfig {
  text: string;
  width?: number;
  height?: number;
  icon?: string;
  iconScale?: number;
  variant?: ButtonVariant;
  onClick?: () => void;
  onHover?: (isHovering: boolean) => void;
  showGlow?: boolean;
  glowColor?: string;
}

export class UIButton extends Container {
  private background!: NineSliceSprite;
  private captionText!: Text;
  private icon?: Sprite;
  private glowOverlay?: Graphics;
  private state: ButtonState = 'normal';
  private config: UIButtonConfig;
  private isDisabled: boolean = false;

  // State animations
  private hoverScale: number = 1.05;
  private activeScale: number = 0.98;

  constructor(config: UIButtonConfig) {
    super();
    this.config = {
      width: 200,
      height: SPACING.components.button.height,
      showGlow: true,
      glowColor: 'brand.primary',
      ...config,
    };

    this.setupButton();
    this.setupLabel();
    if (this.config.icon) {
      this.setupIcon();
    }
    this.setupInteractivity();
    this.applyVariantStyle();
  }

  /**
   * Setup button background with NineSliceSprite
   */
  private setupButton(): void {
    const textureKey = this.config.width! > 150 ? 'button_long' : 'button_square';

    try {
      const texture = Texture.from(textureKey);

      this.background = new NineSliceSprite({
        texture,
        leftWidth: 20,
        topHeight: 20,
        rightWidth: 20,
        bottomHeight: 20,
        width: this.config.width!,
        height: this.config.height!,
      });
    } catch {
      // Fallback button
      this.background = new NineSliceSprite({
        texture: Texture.WHITE,
        leftWidth: 1,
        topHeight: 1,
        rightWidth: 1,
        bottomHeight: 1,
        width: this.config.width!,
        height: this.config.height!,
      });
    }

    this.addChild(this.background);

    // Add glow effect
    if (this.config.showGlow) {
      this.createGlow();
    }
  }

  /**
   * Create glow effect for button (game UI standard)
   */
  private createGlow(): void {
    this.glowOverlay = new Graphics();

    const glowColor = this.config.glowColor ?
      ColorTheme.get(this.config.glowColor as any) :
      ColorTheme.get('brand.primary');

    this.glowOverlay.lineStyle(2, glowColor, 0.5);
    this.glowOverlay.drawRoundedRect(
      0,
      0,
      this.config.width!,
      this.config.height!,
      8
    );
    this.glowOverlay.endFill();

    // Subtle blur
    const blurFilter = new BlurFilter();
    blurFilter.blur = 2;
    this.glowOverlay.filters = [blurFilter];

    this.addChildAt(this.glowOverlay, 0);
  }

  /**
   * Setup button label
   */
  private setupLabel(): void {
    this.captionText = new Text(
      this.config.text.toUpperCase(),
      TEXT_STYLES.buttonText
    );

    this.captionText.anchor.set(0.5);

    // Position based on icon
    if (this.config.icon) {
      // Shift right if there's an icon
      this.captionText.x = this.config.width! / 2 + SPACING.components.button.iconMargin;
    } else {
      this.captionText.x = this.config.width! / 2;
    }

    this.captionText.y = this.config.height! / 2;
    this.addChild(this.captionText);
  }

  /**
   * Setup button icon
   */
  private setupIcon(): void {
    try {
      this.icon = Sprite.from(this.config.icon!);
      this.icon.scale.set(this.config.iconScale || 0.5);

      // Position icon on left side
      this.icon.x = 16 + this.icon.width / 2;
      this.icon.y = this.config.height! / 2;
      this.icon.anchor.set(0.5);

      this.addChild(this.icon);

      // Adjust label position to account for icon
      this.captionText.x = this.config.width! / 2 + SPACING.components.button.iconMargin;
    } catch (error) {
      console.warn(`Failed to load button icon: ${this.config.icon}`, error);
    }
  }

  /**
   * Setup interactivity
   */
  private setupInteractivity(): void {
    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointerover', () => this.onHover());
    this.on('pointerout', () => this.onOut());
    this.on('pointerdown', () => this.onDown());
    this.on('pointerup', () => this.onUp());
    this.on('pointerupoutside', () => this.onUp());
  }

  /**
   * Apply style based on variant
   */
  private applyVariantStyle(): void {
    let buttonColor: number;
    let textColor: number;

    switch (this.config.variant) {
      case 'secondary':
        buttonColor = ColorTheme.get('ui.buttonSecondary');
        textColor = ColorTheme.get('text.primary');
        break;
      case 'danger':
        buttonColor = ColorTheme.get('semantic.danger');
        textColor = ColorTheme.get('text.primary');
        break;
      case 'success':
        buttonColor = ColorTheme.get('semantic.success');
        textColor = ColorTheme.get('text.primary');
        break;
      case 'warning':
        buttonColor = ColorTheme.get('semantic.warning');
        textColor = ColorTheme.get('text.primary');
        break;
      case 'primary':
      default:
        buttonColor = ColorTheme.get('ui.buttonPrimary');
        textColor = ColorTheme.get('text.primary');
        break;
    }

    this.background.tint = buttonColor;
    this.captionText.style.fill = textColor;
  }

  /**
   * Handle hover state
   */
  private onHover(): void {
    if (this.isDisabled) return;

    this.setState('hover');
    this.config.onHover?.(true);
  }

  /**
   * Handle hover exit
   */
  private onOut(): void {
    if (this.isDisabled) return;

    this.setState('normal');
    this.config.onHover?.(false);
  }

  /**
   * Handle button press
   */
  private onDown(): void {
    if (this.isDisabled) return;

    this.setState('active');
  }

  /**
   * Handle button release
   */
  private onUp(): void {
    if (this.isDisabled) return;

    this.setState('hover');
    this.config.onClick?.();
  }

  /**
   * Update button state with visual feedback
   */
  private setState(state: ButtonState): void {
    this.state = state;

    const stateEffects = {
      normal: { scale: 1, alpha: 1, brightness: 1 },
      hover: { scale: this.hoverScale, alpha: 1, brightness: 1.1 },
      active: { scale: this.activeScale, alpha: 0.9, brightness: 0.9 },
      disabled: { scale: 1, alpha: 0.5, brightness: 0.7 },
    };

    const effect = stateEffects[state];

    // Animate scale
    this.animateScale(effect.scale, 100);
    this.alpha = effect.alpha;

    // Adjust brightness via tint
    if (effect.brightness !== 1) {
      const variant = this.config.variant || 'primary';
      const baseColor = this.getVariantColor(variant);
      const brightened = this.adjustBrightness(baseColor, effect.brightness);
      this.background.tint = brightened;
    } else {
      this.applyVariantStyle();
    }
  }

  /**
   * Animate scale smoothly
   */
  private animateScale(targetScale: number, duration: number = 100): void {
    const startScale = this.scale.x;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentScale = startScale + (targetScale - startScale) * eased;

      this.scale.set(currentScale);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Get variant color
   */
  private getVariantColor(variant: ButtonVariant): number {
    const colorMap: Record<ButtonVariant, any> = {
      primary: 'ui.buttonPrimary',
      secondary: 'ui.buttonSecondary',
      danger: 'semantic.danger',
      success: 'semantic.success',
      warning: 'semantic.warning',
    };

    return ColorTheme.get(colorMap[variant]);
  }

  /**
   * Adjust color brightness
   */
  private adjustBrightness(color: number, brightness: number): number {
    const r = Math.min(255, Math.round(((color >> 16) & 255) * brightness));
    const g = Math.min(255, Math.round(((color >> 8) & 255) * brightness));
    const b = Math.min(255, Math.round((color & 255) * brightness));

    return (r << 16) | (g << 8) | b;
  }

  /**
   * Enable/disable button
   */
  setDisabled(disabled: boolean): void {
    this.isDisabled = disabled;
    this.eventMode = disabled ? 'none' : 'static';
    this.cursor = disabled ? 'default' : 'pointer';
    this.setState(disabled ? 'disabled' : 'normal');
  }

  /**
   * Check if button is disabled
   */
  isButtonDisabled(): boolean {
    return this.isDisabled;
  }

  /**
   * Update button text
   */
  setText(text: string): void {
    this.captionText.text = text.toUpperCase();
  }

  /**
   * Get button text
   */
  getText(): string {
    return this.captionText.text;
  }

  /**
   * Trigger button click programmatically
   */
  triggerClick(): void {
    this.config.onClick?.();
  }

  /**
   * Pulse effect for attention
   */
  async pulse(
    intensity: number = 0.15,
    duration: number = 500
  ): Promise<void> {
    return new Promise((resolve) => {
      const startScale = this.scale.x;
      const startTime = Date.now();
      const cycles = 2;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const cycleDuration = duration / cycles;
        const progress = (elapsed % cycleDuration) / cycleDuration;

        // Sine wave pulse
        const pulse = Math.sin(progress * Math.PI);
        const scale = startScale + pulse * intensity;

        this.scale.set(scale);

        if (elapsed < duration) {
          requestAnimationFrame(animate);
        } else {
          this.scale.set(startScale);
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Flash effect (typical game UI feedback)
   */
  async flash(
    duration: number = 300,
    flashes: number = 2
  ): Promise<void> {
    return new Promise((resolve) => {
      const startAlpha = this.alpha;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const cycleDuration = duration / flashes;
        const progress = (elapsed % cycleDuration) / cycleDuration;

        // Square wave flash
        this.alpha = progress < 0.5 ? startAlpha : startAlpha * 0.5;

        if (elapsed < duration) {
          requestAnimationFrame(animate);
        } else {
          this.alpha = startAlpha;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Get button dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.config.width!,
      height: this.config.height!,
    };
  }

  /**
   * Destroy button
   */
  destroyButton(): void {
    if (this.glowOverlay) {
      this.glowOverlay.destroy();
    }
    if (this.background) {
      this.background.destroy();
    }
    if (this.captionText) {
      this.captionText.destroy();
    }
    if (this.icon) {
      this.icon.destroy();
    }
    this.destroy({ children: true });
  }
}
