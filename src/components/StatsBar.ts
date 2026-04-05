/**
 * StatsBar Component
 * Game-quality progress/stats bar with animated fills
 * Used for displaying game stats (power, attack, defense, speed, health)
 */

import { Container, Text, Graphics, BlurFilter } from 'pixi.js';
import { ColorTheme } from '../utils/ColorTheme';
import { TEXT_STYLES } from '../config/typography';
import { SPACING } from '../config/spacing';
import { COLORS } from '../config/colors';

interface StatsBarConfig {
  label: string;
  maxValue: number;
  color: number;
  width?: number;
  height?: number;
  showLabel?: boolean;
  showValue?: boolean;
  showPercentage?: boolean;
  glowIntensity?: number;
}

export class StatsBar extends Container {
  private bgBar: Graphics;
  private fillBar: Graphics;
  private glowBar: Graphics;
  private labelText?: Text;
  private valueText?: Text;
  private percentageText?: Text;
  private currentValue: number = 0;
  private maxValue: number;
  private barColor: number;
  private config: StatsBarConfig;

  constructor(config: StatsBarConfig) {
    super();
    this.config = {
      width: 200,
      height: SPACING.components.statsBar.height,
      showLabel: true,
      showValue: true,
      showPercentage: false,
      glowIntensity: 0.4,
      ...config,
    };

    this.maxValue = this.config.maxValue;
    this.barColor = this.config.color;

    this.setupLabel();
    this.setupBars();
    this.setupValueDisplay();
  }

  /**
   * Setup label text above bar
   */
  private setupLabel(): void {
    if (this.config.showLabel && this.config.label) {
      this.labelText = new Text(
        this.config.label.toUpperCase(),
        TEXT_STYLES.statLabel
      );

      this.labelText.position.set(0, -22);
      this.addChild(this.labelText);
    }
  }

  /**
   * Setup background and fill bars
   */
  private setupBars(): void {
    const width = this.config.width!;
    const height = this.config.height!;
    const cornerRadius = height / 2;

    // Background bar (dark)
    this.bgBar = new Graphics();
    this.bgBar.beginFill(0x000000, 0.3);
    this.bgBar.drawRoundedRect(0, 0, width, height, cornerRadius);
    this.bgBar.endFill();
    this.bgBar.lineStyle(1, ColorTheme.get('ui.panelBorder'), 0.2);
    this.bgBar.drawRoundedRect(0, 0, width, height, cornerRadius);
    this.bgBar.endFill();
    this.addChild(this.bgBar);

    // Fill bar (will be updated with value)
    this.fillBar = new Graphics();
    this.addChild(this.fillBar);

    // Glow/shine effect
    this.glowBar = new Graphics();
    const blurFilter = new BlurFilter();
    blurFilter.blur = 3;
    this.glowBar.filters = [blurFilter];
    this.addChild(this.glowBar);

    // Set initial value to 0
    this.updateFill(0, this.maxValue);
  }

  /**
   * Setup value and percentage text
   */
  private setupValueDisplay(): void {
    if (this.config.showValue) {
      this.valueText = new Text('0', TEXT_STYLES.statValue);
      this.valueText.anchor.set(0, 0.5);
      this.valueText.position.set(this.config.width! + 12, this.config.height! / 2);
      this.addChild(this.valueText);
    }

    if (this.config.showPercentage) {
      this.percentageText = new Text('0%', TEXT_STYLES.statLabel);
      this.percentageText.anchor.set(0, 0.5);
      this.percentageText.position.set(
        this.config.width! + 12,
        this.config.height! / 2 + 20
      );
      this.addChild(this.percentageText);
    }
  }

  /**
   * Update bar fill without animation
   */
  setValue(value: number, maxValue?: number): void {
    const max = maxValue || this.maxValue;
    const clampedValue = Math.min(Math.max(value, 0), max);

    this.currentValue = clampedValue;
    this.maxValue = max;

    this.updateFill(clampedValue, max);
    this.updateText(clampedValue, max);
  }

  /**
   * Animate to a new value
   * Typical game UI feedback effect
   */
  async animateValue(
    targetValue: number,
    maxValue?: number,
    duration: number = 500,
    ease: 'linear' | 'easeOut' | 'easeIn' = 'easeOut'
  ): Promise<void> {
    return new Promise((resolve) => {
      const max = maxValue || this.maxValue;
      const startValue = this.currentValue;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Apply easing
        let eased = progress;
        switch (ease) {
          case 'easeOut':
            eased = 1 - Math.pow(1 - progress, 3);
            break;
          case 'easeIn':
            eased = Math.pow(progress, 3);
            break;
          case 'linear':
          default:
            eased = progress;
            break;
        }

        const currentValue = startValue + (targetValue - startValue) * eased;
        this.currentValue = currentValue;

        this.updateFill(currentValue, max);
        this.updateText(currentValue, max);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final value is exact
          this.currentValue = targetValue;
          this.updateFill(targetValue, max);
          this.updateText(targetValue, max);
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Update the visual fill bar
   */
  private updateFill(value: number, maxValue: number): void {
    const width = this.config.width!;
    const height = this.config.height!;
    const cornerRadius = height / 2;
    const padding = 2;

    // Calculate fill width
    const fillWidth = Math.max(0, (value / maxValue) * (width - padding * 2));

    // Clear and redraw fill bar
    this.fillBar.clear();

    // Main fill
    this.fillBar.beginFill(this.barColor);
    this.fillBar.drawRoundedRect(
      padding,
      padding,
      fillWidth,
      height - padding * 2,
      cornerRadius - padding
    );
    this.fillBar.endFill();

    // Add shine/highlight on top (typical game UI)
    const shineHeight = height / 3;
    this.fillBar.beginFill(0xffffff, 0.1);
    this.fillBar.drawRoundedRect(
      padding,
      padding,
      fillWidth,
      shineHeight,
      cornerRadius - padding
    );
    this.fillBar.endFill();

    // Update glow
    this.updateGlow(fillWidth, height, cornerRadius);
  }

  /**
   * Update glow effect
   */
  private updateGlow(fillWidth: number, height: number, cornerRadius: number): void {
    this.glowBar.clear();

    if (fillWidth > 0) {
      const padding = 2;
      const glowColor = this.barColor;

      this.glowBar.lineStyle(2, glowColor, 0.4);
      this.glowBar.drawRoundedRect(
        padding,
        padding,
        fillWidth,
        height - padding * 2,
        cornerRadius - padding
      );
      this.glowBar.endFill();
    }
  }

  /**
   * Update text displays
   */
  private updateText(value: number, maxValue: number): void {
    if (this.valueText) {
      this.valueText.text = Math.round(value).toString();
    }

    if (this.percentageText) {
      const percentage = Math.round((value / maxValue) * 100);
      this.percentageText.text = `${percentage}%`;
    }
  }

  /**
   * Get current value
   */
  getValue(): number {
    return this.currentValue;
  }

  /**
   * Get max value
   */
  getMaxValue(): number {
    return this.maxValue;
  }

  /**
   * Get percentage (0-100)
   */
  getPercentage(): number {
    return (this.currentValue / this.maxValue) * 100;
  }

  /**
   * Change bar color
   */
  setColor(color: number): void {
    this.barColor = color;
    this.updateFill(this.currentValue, this.maxValue);
  }

  /**
   * Pulse effect when stat changes
   */
  async pulse(duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const startScale = this.scale.y;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % (duration / 2)) / (duration / 2);

        // Sine wave
        const pulse = Math.sin(progress * Math.PI);
        const scale = startScale + pulse * 0.15;

        this.scale.y = scale;

        if (elapsed < duration) {
          requestAnimationFrame(animate);
        } else {
          this.scale.y = startScale;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Flash effect
   */
  async flash(duration: number = 200): Promise<void> {
    return new Promise((resolve) => {
      const startAlpha = this.alpha;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % 50) / 50;

        this.alpha = progress < 0.5 ? startAlpha : startAlpha * 0.6;

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
   * Get bar dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.config.width!,
      height: this.config.height!,
    };
  }

  /**
   * Destroy stats bar
   */
  destroyBar(): void {
    if (this.bgBar) {
      this.bgBar.destroy();
    }
    if (this.fillBar) {
      this.fillBar.destroy();
    }
    if (this.glowBar) {
      this.glowBar.destroy();
    }
    if (this.labelText) {
      this.labelText.destroy();
    }
    if (this.valueText) {
      this.valueText.destroy();
    }
    if (this.percentageText) {
      this.percentageText.destroy();
    }
    this.destroy({ children: true });
  }
}
