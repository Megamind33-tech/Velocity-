/**
 * SmartText Component
 * Intelligent text handling with overflow prevention
 * Automatically truncates or scales text to fit container
 */

import { Text, TextStyle, TextOptions } from 'pixi.js';

type OverflowMode = 'truncate' | 'scale' | 'wrap' | 'ignore';

interface SmartTextConfig {
  text: string;
  style: TextStyle | TextOptions;
  maxWidth?: number;
  maxHeight?: number;
  overflowMode?: OverflowMode;
  ellipsis?: string;
  minFontSize?: number;
}

export class SmartText extends Text {
  private maxWidth?: number;
  private maxHeight?: number;
  private overflowMode: OverflowMode;
  private ellipsis: string;
  private minFontSize: number;
  private originalFontSize: number;

  constructor(config: SmartTextConfig) {
    super(config.text, config.style);

    this.maxWidth = config.maxWidth;
    this.maxHeight = config.maxHeight;
    this.overflowMode = config.overflowMode || 'truncate';
    this.ellipsis = config.ellipsis || '...';
    this.minFontSize = config.minFontSize || 8;
    this.originalFontSize = this.style.fontSize as number;

    // Apply overflow handling
    if (this.maxWidth || this.maxHeight) {
      this.applyOverflowHandling();
    }
  }

  /**
   * Apply overflow handling based on configured mode
   */
  private applyOverflowHandling(): void {
    switch (this.overflowMode) {
      case 'truncate':
        this.truncateText();
        break;
      case 'scale':
        this.scaleToFit();
        break;
      case 'wrap':
        this.setupWordWrap();
        break;
      case 'ignore':
        // Do nothing
        break;
    }
  }

  /**
   * Truncate text with ellipsis if it exceeds maxWidth
   */
  private truncateText(): void {
    if (!this.maxWidth) return;

    let truncated = this.text;
    const maxIterations = this.text.length;
    let iterations = 0;

    while (this.width > this.maxWidth && truncated.length > 0 && iterations < maxIterations) {
      truncated = truncated.slice(0, -1);
      this.text = truncated + this.ellipsis;
      iterations++;
    }

    // If still too wide, remove ellipsis and keep truncating
    if (this.width > this.maxWidth && truncated.length > 0) {
      while (this.width > this.maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
        this.text = truncated;
      }
    }
  }

  /**
   * Scale font size to fit in container
   */
  private scaleToFit(): void {
    if (!this.maxWidth && !this.maxHeight) return;

    const originalFontSize = this.originalFontSize;

    // Check width first
    if (this.maxWidth && this.width > this.maxWidth) {
      const scaleRatio = this.maxWidth / this.width;
      let newFontSize = Math.max(
        this.minFontSize,
        Math.floor(originalFontSize * scaleRatio)
      );

      this.style.fontSize = newFontSize;

      // Recursively check if we need to scale more
      if (this.width > this.maxWidth) {
        this.scaleToFit();
      }
    }

    // Check height if specified
    if (this.maxHeight && this.height > this.maxHeight) {
      const scaleRatio = this.maxHeight / this.height;
      let newFontSize = Math.max(
        this.minFontSize,
        Math.floor((this.style.fontSize as number) * scaleRatio)
      );

      this.style.fontSize = newFontSize;

      // Recursively check if we need to scale more
      if (this.height > this.maxHeight) {
        this.scaleToFit();
      }
    }
  }

  /**
   * Setup word wrapping
   */
  private setupWordWrap(): void {
    if (!this.maxWidth) return;

    this.style.wordWrap = true;
    this.style.wordWrapWidth = this.maxWidth;

    // If maxHeight is set and text exceeds it, reduce font size
    if (this.maxHeight && this.height > this.maxHeight) {
      this.scaleToFit();
    }
  }

  /**
   * Update text and reapply overflow handling
   */
  updateText(newText: string, reapplyHandling: boolean = true): void {
    this.text = newText;

    if (reapplyHandling) {
      this.applyOverflowHandling();
    }
  }

  /**
   * Update text with new style and reapply handling
   */
  updateTextAndStyle(
    newText: string,
    newStyle: TextStyle | TextOptions | null = null,
    reapplyHandling: boolean = true
  ): void {
    if (newStyle) {
      this.style = new TextStyle(newStyle);
      this.originalFontSize = this.style.fontSize as number;
    }

    this.text = newText;

    if (reapplyHandling) {
      this.applyOverflowHandling();
    }
  }

  /**
   * Get the original text before truncation
   * Note: This returns the current text if not truncated
   */
  getOriginalText(): string {
    return this.text;
  }

  /**
   * Check if text was truncated
   */
  isTruncated(): boolean {
    return this.text.endsWith(this.ellipsis);
  }

  /**
   * Reset to original font size
   */
  resetFontSize(): void {
    this.style.fontSize = this.originalFontSize;
  }

  /**
   * Change overflow mode and reapply
   */
  setOverflowMode(mode: OverflowMode): void {
    this.overflowMode = mode;
    this.applyOverflowHandling();
  }

  /**
   * Get current overflow mode
   */
  getOverflowMode(): OverflowMode {
    return this.overflowMode;
  }

  /**
   * Set max width and reapply handling
   */
  setMaxWidth(width: number | undefined): void {
    this.maxWidth = width;
    if (width) {
      this.applyOverflowHandling();
    }
  }

  /**
   * Set max height and reapply handling
   */
  setMaxHeight(height: number | undefined): void {
    this.maxHeight = height;
    if (height) {
      this.applyOverflowHandling();
    }
  }

  /**
   * Get dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Get metrics
   */
  getMetrics(): {
    width: number;
    height: number;
    fontSize: number;
    truncated: boolean;
    overflowMode: OverflowMode;
  } {
    return {
      width: this.width,
      height: this.height,
      fontSize: this.style.fontSize as number,
      truncated: this.isTruncated(),
      overflowMode: this.overflowMode,
    };
  }

  /**
   * Static method to create SmartText with truncation
   */
  static truncated(
    text: string,
    maxWidth: number,
    style: TextStyle | TextOptions,
    ellipsis?: string
  ): SmartText {
    return new SmartText({
      text,
      style,
      maxWidth,
      overflowMode: 'truncate',
      ellipsis,
    });
  }

  /**
   * Static method to create SmartText with scaling
   */
  static scaled(
    text: string,
    maxWidth: number | undefined,
    maxHeight: number | undefined,
    style: TextStyle | TextOptions,
    minFontSize?: number
  ): SmartText {
    return new SmartText({
      text,
      style,
      maxWidth,
      maxHeight,
      overflowMode: 'scale',
      minFontSize,
    });
  }

  /**
   * Static method to create SmartText with wrapping
   */
  static wrapped(
    text: string,
    maxWidth: number,
    maxHeight: number | undefined,
    style: TextStyle | TextOptions,
    minFontSize?: number
  ): SmartText {
    return new SmartText({
      text,
      style,
      maxWidth,
      maxHeight,
      overflowMode: 'wrap',
      minFontSize,
    });
  }
}

/**
 * Utility function to fit text to container
 * Returns SmartText configured appropriately
 */
export function createFittingText(
  text: string,
  containerWidth: number,
  containerHeight: number | undefined,
  style: TextStyle | TextOptions,
  preferences?: {
    preferTruncate?: boolean;
    preferScale?: boolean;
    minFontSize?: number;
    ellipsis?: string;
  }
): SmartText {
  const { preferTruncate = false, preferScale = false, minFontSize = 8, ellipsis = '...' } =
    preferences || {};

  let mode: OverflowMode = 'wrap';
  if (preferTruncate) mode = 'truncate';
  if (preferScale) mode = 'scale';

  return new SmartText({
    text,
    style,
    maxWidth: containerWidth,
    maxHeight: containerHeight,
    overflowMode: mode,
    minFontSize,
    ellipsis,
  });
}
