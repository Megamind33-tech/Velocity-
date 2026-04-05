/**
 * NavigationEvents
 * Browser-compatible event system for screen navigation
 * Allows screens to communicate navigation requests
 */

export type NavigationAction =
  | 'shop'
  | 'hangar'
  | 'plane-store'
  | 'play'
  | 'resume'
  | 'save'
  | 'restart'
  | 'arcade'
  | 'classic'
  | 'upgrade'
  | 'exit'
  | 'back';

/**
 * Navigation event emitter - Singleton
 * Browser-compatible implementation (no Node.js EventEmitter)
 */
class NavigationEmitter {
  private static instance: NavigationEmitter;
  private listeners: Set<(action: NavigationAction) => void> = new Set();

  private constructor() {}

  public static getInstance(): NavigationEmitter {
    if (!NavigationEmitter.instance) {
      NavigationEmitter.instance = new NavigationEmitter();
    }
    return NavigationEmitter.instance;
  }

  /**
   * Emit navigation event
   */
  public navigate(action: NavigationAction): void {
    console.log(`🧭 Navigation: ${action}`);
    // Call all listeners
    this.listeners.forEach((callback) => {
      callback(action);
    });
  }

  /**
   * Listen for navigation events
   */
  public onNavigate(callback: (action: NavigationAction) => void): void {
    this.listeners.add(callback);
  }

  /**
   * Remove navigation listener
   */
  public offNavigate(callback: (action: NavigationAction) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * Clear all listeners
   */
  public clearListeners(): void {
    this.listeners.clear();
  }
}

export const navigationEvents = NavigationEmitter.getInstance();
