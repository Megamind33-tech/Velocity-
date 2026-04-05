/**
 * Semantic Color System for Velocity Game
 * Follows AAA quality standards with consistent palette
 */

export const COLORS = {
  // Backgrounds
  background: {
    primary: '#0a0514',      // Deep space purple
    secondary: '#1a0b2e',    // Lighter purple
    tertiary: '#2d1b4e',     // Panel background
  },

  // Brand Colors
  brand: {
    primary: '#00d4ff',      // Cyber cyan (main actions)
    secondary: '#8b5cf6',    // Violet (secondary actions)
    tertiary: '#3b82f6',     // Blue (info/neutral)
  },

  // Semantic States
  semantic: {
    success: '#10b981',      // Green (achievements, unlocks)
    warning: '#f59e0b',      // Amber (caution, upgrades)
    danger: '#ef4444',       // Red (locked, errors)
    info: '#06b6d4',         // Cyan (notifications)
  },

  // UI Elements
  ui: {
    panel: '#0d4d4d',        // Teal panel base
    panelBorder: '#00d4ff',  // Cyan border
    panelHeader: '#1a5f5f',  // Darker teal for headers
    buttonPrimary: '#ff8c00', // Orange CTA
    buttonSecondary: '#0d4d4d', // Teal secondary
    disabled: '#4a5568',     // Gray disabled state
  },

  // Text Hierarchy
  text: {
    primary: '#ffffff',      // Main text
    secondary: '#cbd5e1',    // Supporting text
    tertiary: '#94a3b8',     // Muted text
    disabled: '#64748b',     // Disabled text
    accent: '#00d4ff',       // Highlight text (stats, values)
  },

  // Progress Bars & Stats
  stats: {
    power: '#8b5cf6',        // Violet
    attack: '#ef4444',       // Red
    defense: '#3b82f6',      // Blue
    speed: '#10b981',        // Green
    health: '#f59e0b',       // Amber
  },
} as const;

export type ColorPath =
  | 'background.primary'
  | 'background.secondary'
  | 'background.tertiary'
  | 'brand.primary'
  | 'brand.secondary'
  | 'brand.tertiary'
  | 'semantic.success'
  | 'semantic.warning'
  | 'semantic.danger'
  | 'semantic.info'
  | 'ui.panel'
  | 'ui.panelBorder'
  | 'ui.panelHeader'
  | 'ui.buttonPrimary'
  | 'ui.buttonSecondary'
  | 'ui.disabled'
  | 'text.primary'
  | 'text.secondary'
  | 'text.tertiary'
  | 'text.disabled'
  | 'text.accent'
  | 'stats.power'
  | 'stats.attack'
  | 'stats.defense'
  | 'stats.speed'
  | 'stats.health';
