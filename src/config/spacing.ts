/**
 * Spacing System for Velocity Game
 * Based on 8px grid for consistent layout
 */

export const SPACING = {
  // Base units (multiples of 8)
  xs: 4,      // Tight spacing (half unit)
  sm: 8,      // Small spacing (1 unit)
  md: 16,     // Default spacing (2 units)
  lg: 24,     // Large spacing (3 units)
  xl: 32,     // Extra large (4 units)
  xxl: 48,    // Section spacing (6 units)

  // Semantic spacing for UI elements
  padding: {
    panel: 16,              // Interior padding for panels
    card: 12,               // Interior padding for cards
    button: { x: 24, y: 12 }, // Button internal padding
    dialog: 24,             // Dialog padding
    section: 16,            // Section padding
  },

  margin: {
    element: 8,     // Between elements
    section: 24,    // Between sections
    screen: 32,     // Screen edge margins
  },

  gap: {
    list: 8,        // Gap between list items
    grid: 16,       // Gap between grid items
    buttons: 12,    // Gap between buttons
    icons: 8,       // Gap between icons
  },

  // Component-specific spacing
  components: {
    // Button dimensions
    button: {
      height: 56,           // Touch-friendly height
      heightSmall: 44,      // Smaller variant
      minWidth: 120,        // Minimum button width
      iconSize: 24,         // Icon size in buttons
      iconMargin: 8,        // Margin between icon and text
    },

    // Panel dimensions
    panel: {
      headerHeight: 44,
      footerHeight: 56,
      borderWidth: 2,
      cornerRadius: 8,
    },

    // Stats bar
    statsBar: {
      height: 24,
      cornerRadius: 12,
      labelWidth: 80,
    },

    // Input field
    input: {
      height: 48,
      cornerRadius: 8,
      borderWidth: 2,
      padding: 12,
    },

    // Dialog
    dialog: {
      minWidth: 320,
      maxWidth: 720,
      minHeight: 240,
      cornerRadius: 16,
      borderWidth: 2,
    },
  },

  // Screen-specific dimensions
  screens: {
    width: 1080,           // Game canvas width (landscape)
    height: 1920,          // Game canvas height
    aspectRatio: 9 / 16,   // Portrait aspect ratio
  },

  // Responsive breakpoints (not fully implemented for mobile yet)
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
  },
} as const;

/**
 * Layout helper class for common spacing operations
 */
export class LayoutHelper {
  /**
   * Apply padding to container children
   * Shifts all children inward by the specified padding
   */
  static applyPadding(
    children: any[],
    padding: number | { x: number; y: number }
  ): void {
    const p = typeof padding === 'number'
      ? { x: padding, y: padding }
      : padding;

    children.forEach((child) => {
      child.x += p.x;
      child.y += p.y;
    });
  }

  /**
   * Stack elements vertically with gap
   * Arranges children in a vertical line with spacing
   */
  static stackVertical(
    children: any[],
    gap: number = SPACING.md,
    startY: number = 0
  ): void {
    let yOffset = startY;
    children.forEach((child) => {
      child.y = yOffset;
      yOffset += child.height + gap;
    });
  }

  /**
   * Stack elements horizontally with gap
   * Arranges children in a horizontal line with spacing
   */
  static stackHorizontal(
    children: any[],
    gap: number = SPACING.md,
    startX: number = 0
  ): void {
    let xOffset = startX;
    children.forEach((child) => {
      child.x = xOffset;
      xOffset += child.width + gap;
    });
  }

  /**
   * Arrange children in a grid
   * @param children - Array of elements to arrange
   * @param columns - Number of columns in the grid
   * @param gap - Gap between items
   * @param startX - Starting X position
   * @param startY - Starting Y position
   */
  static arrangeGrid(
    children: any[],
    columns: number,
    gap: number = SPACING.md,
    startX: number = 0,
    startY: number = 0
  ): void {
    children.forEach((child, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      child.x = startX + col * (child.width + gap);
      child.y = startY + row * (child.height + gap);
    });
  }

  /**
   * Center an element within a container
   */
  static center(
    element: any,
    container: { width: number; height: number },
    offsetX: number = 0,
    offsetY: number = 0
  ): void {
    element.x = (container.width - element.width) / 2 + offsetX;
    element.y = (container.height - element.height) / 2 + offsetY;
  }

  /**
   * Center horizontally
   */
  static centerX(
    element: any,
    containerWidth: number,
    offsetX: number = 0
  ): void {
    element.x = (containerWidth - element.width) / 2 + offsetX;
  }

  /**
   * Center vertically
   */
  static centerY(
    element: any,
    containerHeight: number,
    offsetY: number = 0
  ): void {
    element.y = (containerHeight - element.height) / 2 + offsetY;
  }

  /**
   * Get grid position
   * Useful for calculating positions before creating elements
   */
  static getGridPosition(
    index: number,
    columns: number,
    itemWidth: number,
    itemHeight: number,
    gap: number = SPACING.md,
    startX: number = 0,
    startY: number = 0
  ): { x: number; y: number } {
    const col = index % columns;
    const row = Math.floor(index / columns);

    return {
      x: startX + col * (itemWidth + gap),
      y: startY + row * (itemHeight + gap),
    };
  }

  /**
   * Align element to grid
   * Snaps element position to nearest grid intersection
   */
  static alignToGrid(
    element: any,
    gridSize: number = SPACING.sm
  ): void {
    element.x = Math.round(element.x / gridSize) * gridSize;
    element.y = Math.round(element.y / gridSize) * gridSize;
  }

  /**
   * Create safe bounds with padding
   * Returns bounds with padding applied
   */
  static createSafeBounds(
    width: number,
    height: number,
    padding: number = SPACING.screen
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return {
      x: padding,
      y: padding,
      width: width - padding * 2,
      height: height - padding * 2,
    };
  }
}
