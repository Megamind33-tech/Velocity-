/**
 * ColorTheme Utility
 * Provides easy access to the semantic color system
 * Converts hex color strings to PixiJS-compatible hex numbers
 */

import { COLORS, ColorPath } from '../config/colors';

export class ColorTheme {
  /**
   * Get a color value by semantic path
   * @param path - Dot-notation path to color (e.g., 'brand.primary', 'semantic.success')
   * @returns PixiJS-compatible hex number (0xRRGGBB)
   * @throws Logs warning if path not found, returns white (0xffffff)
   *
   * @example
   * ```typescript
   * const primaryColor = ColorTheme.get('brand.primary');      // 0x00d4ff
   * const panelColor = ColorTheme.get('ui.panel');            // 0x0d4d4d
   * const dangerColor = ColorTheme.get('semantic.danger');    // 0xef4444
   * ```
   */
  static get(path: ColorPath): number {
    try {
      const parts = path.split('.');
      let value: any = COLORS;

      // Navigate through the color object
      for (const part of parts) {
        value = value[part];
        if (value === undefined) {
          console.warn(`Color path "${path}" not found in color system`);
          return 0xffffff; // Return white as fallback
        }
      }

      // Validate it's a string
      if (typeof value !== 'string') {
        console.warn(`Color path "${path}" is not a valid hex string`);
        return 0xffffff;
      }

      // Convert hex string to PixiJS number
      return this.hexToNumber(value);
    } catch (error) {
      console.error(`Error getting color from path "${path}":`, error);
      return 0xffffff; // Return white as fallback
    }
  }

  /**
   * Get a color with optional alpha/opacity
   * @param path - Dot-notation path to color
   * @param alpha - Alpha value (0-1)
   * @returns PixiJS hex number
   *
   * @example
   * ```typescript
   * const semiTransparent = ColorTheme.getWithAlpha('brand.primary', 0.7);
   * ```
   */
  static getWithAlpha(path: ColorPath, alpha: number): number {
    const hexColor = this.get(path);
    // Alpha is typically handled separately in PixiJS using .alpha property
    // This is a convenience method for reference
    return hexColor;
  }

  /**
   * Convert hex string to PixiJS hex number
   * @param hex - Hex color string (e.g., '#ff0000' or 'ff0000')
   * @returns PixiJS-compatible hex number
   *
   * @example
   * ```typescript
   * const color = ColorTheme.hexToNumber('#00d4ff'); // 0x00d4ff
   * ```
   */
  static hexToNumber(hex: string): number {
    const cleanHex = hex.replace('#', '');
    return parseInt(cleanHex, 16);
  }

  /**
   * Convert PixiJS hex number to hex string
   * @param num - PixiJS hex number (0xRRGGBB)
   * @returns Hex string (e.g., '#ff0000')
   *
   * @example
   * ```typescript
   * const hex = ColorTheme.numberToHex(0x00d4ff); // '#00d4ff'
   * ```
   */
  static numberToHex(num: number): string {
    return '#' + num.toString(16).padStart(6, '0');
  }

  /**
   * Convert RGB values to PixiJS hex number
   * @param r - Red (0-255)
   * @param g - Green (0-255)
   * @param b - Blue (0-255)
   * @returns PixiJS-compatible hex number
   *
   * @example
   * ```typescript
   * const cyan = ColorTheme.rgb(0, 212, 255); // 0x00d4ff
   * ```
   */
  static rgb(r: number, g: number, b: number): number {
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Get all colors as a flat object with hex numbers
   * Useful for debugging or exporting colors
   * @returns Object with all colors as hex numbers
   */
  static getAllAsNumbers(): Record<string, number> {
    const result: Record<string, number> = {};

    const processObject = (obj: any, prefix: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.startsWith('#')) {
          const path = prefix ? `${prefix}.${key}` : key;
          result[path] = this.hexToNumber(value);
        } else if (typeof value === 'object' && value !== null) {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          processObject(value, newPrefix);
        }
      }
    };

    processObject(COLORS);
    return result;
  }

  /**
   * Check if a color value is dark (useful for determining text color contrast)
   * Uses luminance formula
   * @param path - Color path or hex number
   * @returns True if color is dark
   */
  static isDark(colorOrPath: ColorPath | number): boolean {
    let hex: number;

    if (typeof colorOrPath === 'number') {
      hex = colorOrPath;
    } else {
      hex = this.get(colorOrPath);
    }

    // Extract RGB components
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance < 0.5;
  }

  /**
   * Get contrasting text color (white or black) based on background
   * @param backgroundPath - Color path of background
   * @returns Text color (white for dark backgrounds, black for light)
   */
  static getContrastTextColor(backgroundPath: ColorPath): number {
    const bgColor = this.get(backgroundPath);
    return this.isDark(bgColor) ? 0xffffff : 0x000000;
  }

  /**
   * Lighten a color by a percentage
   * @param path - Color path
   * @param amount - Lighten amount (0-100)
   * @returns Lightened hex number
   */
  static lighten(path: ColorPath, amount: number): number {
    const hex = this.get(path);
    const r = Math.min(255, ((hex >> 16) & 255) + (amount * 255) / 100);
    const g = Math.min(255, ((hex >> 8) & 255) + (amount * 255) / 100);
    const b = Math.min(255, (hex & 255) + (amount * 255) / 100);

    return this.rgb(Math.round(r), Math.round(g), Math.round(b));
  }

  /**
   * Darken a color by a percentage
   * @param path - Color path
   * @param amount - Darken amount (0-100)
   * @returns Darkened hex number
   */
  static darken(path: ColorPath, amount: number): number {
    const hex = this.get(path);
    const r = Math.max(0, ((hex >> 16) & 255) - (amount * 255) / 100);
    const g = Math.max(0, ((hex >> 8) & 255) - (amount * 255) / 100);
    const b = Math.max(0, (hex & 255) - (amount * 255) / 100);

    return this.rgb(Math.round(r), Math.round(g), Math.round(b));
  }

  /**
   * Create a debug string showing all colors
   * Useful for logging or debugging
   * @returns String representation of color palette
   */
  static debugPalette(): string {
    const colors = this.getAllAsNumbers();
    let output = '\n=== Velocity Color Palette ===\n';

    for (const [path, value] of Object.entries(colors)) {
      const hex = this.numberToHex(value);
      output += `${path.padEnd(25)} | ${hex.toUpperCase()} | 0x${value.toString(16).toUpperCase().padStart(6, '0')}\n`;
    }

    return output;
  }
}

// Export convenience aliases
export const getColor = (path: ColorPath) => ColorTheme.get(path);
export const getHex = (path: ColorPath) => ColorTheme.numberToHex(ColorTheme.get(path));
