/**
 * NavigationEvents
 * Event emitter for screen navigation
 * Allows screens to communicate navigation requests
 */

import { EventEmitter } from 'events';

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
 */
class NavigationEmitter extends EventEmitter {
  private static instance: NavigationEmitter;

  private constructor() {
    super();
  }

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
    this.emit('navigate', action);
  }

  /**
   * Listen for navigation events
   */
  public onNavigate(callback: (action: NavigationAction) => void): void {
    this.on('navigate', callback);
  }

  /**
   * Remove navigation listener
   */
  public offNavigate(callback: (action: NavigationAction) => void): void {
    this.off('navigate', callback);
  }

  /**
   * Clear all listeners
   */
  public clearListeners(): void {
    this.removeAllListeners('navigate');
  }
}

export const navigationEvents = NavigationEmitter.getInstance();
