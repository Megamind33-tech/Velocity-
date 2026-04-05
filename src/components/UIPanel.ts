/**
 * UIPanel Component
 * Game-quality panel component using NineSliceSprite
 * Supports headers, styling variants, and content management
 *
 * Requires Kenney UI Pack assets:
 * - assets/ui/kenney/panels/panel_blue.png (16px slicing)
 * - assets/ui/kenney/panels/panel_blue_header.png (16px slicing, for header)
 */

import { Container, NineSliceSprite, Texture, Text, Graphics, BlurFilter } from 'pixi.js';
import { ColorTheme } from '../utils/ColorTheme';
import { TEXT_STYLES } from '../config/typography';
import { SPACING } from '../config/spacing';
import { COLORS } from '../config/colors';

type PanelStyle = 'primary' | 'secondary' | 'dark';

interface UIPanelConfig {
  width: number;
  height: number;
  hasHeader?: boolean;
  headerText?: string;
  style?: PanelStyle;
  showGlow?: boolean;
  glowIntensity?: number;
  cornerRadius?: number;
}

export class UIPanel extends Container {
  private panelSprite!: NineSliceSprite;
  private headerSprite?: NineSliceSprite;
  private headerText?: Text;
  private contentContainer!: Container;
  private glowOverlay?: Graphics;
  private config: UIPanelConfig;

  constructor(config: UIPanelConfig) {
    super();
    this.config = {
      showGlow: true,
      glowIntensity: 0.3,
      cornerRadius: 8,
      ...config,
    };

    this.setupPanel();
    if (this.config.hasHeader && this.config.headerText) {
      this.setupHeader();
    }
    this.setupContent();
    this.applyStyle();
  }

  /**
   * Setup the main panel background with NineSliceSprite
   */
  private setupPanel(): void {
    // Get texture - will use Kenney UI Pack when assets are available
    // For now, we create a placeholder that will work with the texture when loaded
    let textureKey = 'panel_blue';

    switch (this.config.style) {
      case 'secondary':
        textureKey = 'panel_green';
        break;
      case 'dark':
        textureKey = 'panel_brown';
        break;
      case 'primary':
      default:
        textureKey = 'panel_blue';
        break;
    }

    try {
      const texture = Texture.from(textureKey);

      this.panelSprite = new NineSliceSprite({
        texture,
        leftWidth: 16,
        topHeight: 16,
        rightWidth: 16,
        bottomHeight: 16,
        width: this.config.width,
        height: this.config.height,
      });
    } catch (error) {
      // Fallback: create a simple rectangle if texture not available
      this.panelSprite = new NineSliceSprite({
        texture: Texture.WHITE,
        leftWidth: 1,
        topHeight: 1,
        rightWidth: 1,
        bottomHeight: 1,
        width: this.config.width,
        height: this.config.height,
      });
      this.panelSprite.tint = ColorTheme.get('ui.panel');
    }

    this.addChild(this.panelSprite);

    // Add glow effect for AAA game quality
    if (this.config.showGlow) {
      this.createGlow();
    }
  }

  /**
   * Create glow effect around panel border
   * Typical AAA game UI effect
   */
  private createGlow(): void {
    // Create a glow overlay using graphics
    this.glowOverlay = new Graphics();

    // Draw border glow
    this.glowOverlay.lineStyle(3, ColorTheme.get('ui.panelBorder'), this.config.glowIntensity!);
    this.glowOverlay.drawRoundedRect(
      0,
      0,
      this.config.width,
      this.config.height,
      this.config.cornerRadius
    );
    this.glowOverlay.endFill();

    // Add blur filter for glow effect
    const blurFilter = new BlurFilter();
    blurFilter.blur = 4;
    this.glowOverlay.filters = [blurFilter];

    this.addChildAt(this.glowOverlay, 0);
  }

  /**
   * Setup header if needed
   */
  private setupHeader(): void {
    const headerHeight = SPACING.components.panel.headerHeight;

    try {
      const headerTexture = Texture.from('panel_header');

      this.headerSprite = new NineSliceSprite({
        texture: headerTexture,
        leftWidth: 16,
        topHeight: 8,
        rightWidth: 16,
        bottomHeight: 8,
        width: this.config.width,
        height: headerHeight,
      });
    } catch {
      // Fallback header
      this.headerSprite = new NineSliceSprite({
        texture: Texture.WHITE,
        leftWidth: 1,
        topHeight: 1,
        rightWidth: 1,
        bottomHeight: 1,
        width: this.config.width,
        height: headerHeight,
      });
      this.headerSprite.tint = ColorTheme.get('ui.panelHeader');
    }

    this.addChild(this.headerSprite);

    // Add header text
    if (this.config.headerText) {
      this.headerText = new Text(
        this.config.headerText.toUpperCase(),
        TEXT_STYLES.panelHeader
      );

      // Center text in header
      this.headerText.anchor.set(0.5, 0.5);
      this.headerText.position.set(
        this.config.width / 2,
        headerHeight / 2
      );

      this.addChild(this.headerText);
    }
  }

  /**
   * Setup content container with proper padding
   */
  private setupContent(): void {
    this.contentContainer = new Container();

    // Apply padding
    const padding = SPACING.padding.panel;
    const startY = this.config.hasHeader ? SPACING.components.panel.headerHeight : 0;

    this.contentContainer.x = padding;
    this.contentContainer.y = startY + padding;

    this.addChild(this.contentContainer);
  }

  /**
   * Apply color tints based on style
   */
  private applyStyle(): void {
    let panelColor: number;
    let borderColor: number;

    switch (this.config.style) {
      case 'secondary':
        panelColor = ColorTheme.get('ui.panel');
        borderColor = ColorTheme.get('ui.panelBorder');
        break;
      case 'dark':
        panelColor = ColorTheme.darken('ui.panel', 20);
        borderColor = ColorTheme.darken('ui.panelBorder', 10);
        break;
      case 'primary':
      default:
        panelColor = ColorTheme.get('ui.panel');
        borderColor = ColorTheme.get('ui.panelBorder');
        break;
    }

    // Apply tints
    this.panelSprite.tint = panelColor;

    if (this.headerSprite) {
      this.headerSprite.tint = ColorTheme.get('ui.panelHeader');
    }

    if (this.glowOverlay) {
      this.glowOverlay.clear();
      this.glowOverlay.lineStyle(3, borderColor, this.config.glowIntensity!);
      this.glowOverlay.drawRoundedRect(
        0,
        0,
        this.config.width,
        this.config.height,
        this.config.cornerRadius
      );
      this.glowOverlay.endFill();
    }
  }

  /**
   * Add a child to the content container
   * Use this to add UI elements to the panel
   */
  addContent(child: Container): void {
    this.contentContainer.addChild(child);
  }

  /**
   * Remove a child from the content container
   */
  removeContent(child: Container): void {
    this.contentContainer.removeChild(child);
  }

  /**
   * Clear all content
   */
  clearContent(): void {
    this.contentContainer.removeChildren();
  }

  /**
   * Get the content container
   * Useful for direct manipulation
   */
  getContentContainer(): Container {
    return this.contentContainer;
  }

  /**
   * Get available content area dimensions
   * Useful for layout calculations
   */
  getContentArea(): { width: number; height: number } {
    const padding = SPACING.padding.panel;
    const headerHeight = this.config.hasHeader ? SPACING.components.panel.headerHeight : 0;

    return {
      width: this.config.width - padding * 2,
      height: this.config.height - headerHeight - padding * 2,
    };
  }

  /**
   * Update header text
   */
  setHeaderText(text: string): void {
    if (this.headerText) {
      this.headerText.text = text.toUpperCase();
      // Recenter
      this.headerText.position.set(
        this.config.width / 2,
        SPACING.components.panel.headerHeight / 2
      );
    }
  }

  /**
   * Show panel with fade-in animation
   */
  async fadeIn(duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      this.alpha = 0;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        this.alpha = progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.alpha = 1;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Hide panel with fade-out animation
   */
  async fadeOut(duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const startAlpha = this.alpha;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        this.alpha = startAlpha * (1 - progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.alpha = 0;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Slide in animation from direction
   */
  async slideIn(
    direction: 'left' | 'right' | 'top' | 'bottom' = 'left',
    duration: number = 400,
    distance: number = 100
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPos = { x: this.x, y: this.y };

      // Set initial offset
      switch (direction) {
        case 'left':
          this.x -= distance;
          break;
        case 'right':
          this.x += distance;
          break;
        case 'top':
          this.y -= distance;
          break;
        case 'bottom':
          this.y += distance;
          break;
      }

      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        if (direction === 'left' || direction === 'right') {
          this.x = startPos.x + (startPos.x - this.x) * (1 - eased);
        } else {
          this.y = startPos.y + (startPos.y - this.y) * (1 - eased);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.x = startPos.x;
          this.y = startPos.y;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Pulse animation for attention
   */
  async pulse(
    intensity: number = 0.1,
    duration: number = 500
  ): Promise<void> {
    return new Promise((resolve) => {
      const startAlpha = this.alpha;
      const startTime = Date.now();
      const cycles = 2; // Number of pulse cycles

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const totalDuration = (duration / cycles) * Math.PI;
        const progress = (elapsed % (duration / cycles)) / (duration / cycles);

        // Sine wave for smooth pulse
        const pulse = Math.sin(progress * Math.PI);
        this.alpha = startAlpha + pulse * intensity;

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
   * Get panel dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.config.width,
      height: this.config.height,
    };
  }

  /**
   * Destroy the panel and clean up resources
   */
  destroyPanel(): void {
    if (this.glowOverlay) {
      this.glowOverlay.destroy();
    }
    if (this.panelSprite) {
      this.panelSprite.destroy();
    }
    if (this.headerSprite) {
      this.headerSprite.destroy();
    }
    if (this.headerText) {
      this.headerText.destroy();
    }
    this.contentContainer.removeChildren();
    this.contentContainer.destroy();
    this.destroy({ children: true });
  }
}
