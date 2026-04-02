import { GameEvent } from './GameEvents';

type EventCallback = (payload?: any) => void;

/**
 * A globally accessible, typed Singleton EventBus for cross-system communication.
 */
export class EventBus {
    private static instance: EventBus;
    private listeners: Map<GameEvent, Set<EventCallback>>;

    private constructor() {
        this.listeners = new Map();
    }

    /**
     * Retrieves the Singleton instance of the EventBus.
     */
    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * Subscribe to a GameEvent.
     * @param event The event to subscribe to.
     * @param callback The callback invoked when the event is emitted.
     */
    public on(event: GameEvent, callback: EventCallback): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    /**
     * Unsubscribe from a GameEvent.
     * @param event The event to unsubscribe from.
     * @param callback The callback to remove.
     */
    public off(event: GameEvent, callback: EventCallback): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
            if (eventListeners.size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * Emit a GameEvent to all subscribers.
     * @param event The event to emit.
     * @param payload Optional payload to pass to subscribers.
     */
    public emit(event: GameEvent, payload?: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            // Create a copy of the Set to iterate safely if listeners are added/removed during emit
            const listenersCopy = new Set(eventListeners);
            listenersCopy.forEach(callback => {
                try {
                    callback(payload);
                } catch (error) {
                    console.error(`Error executing event callback for ${event}:`, error);
                }
            });
        }
    }
    
    /**
     * Clear all listeners for all events, useful for environment resets in dev.
     */
    public reset(): void {
        this.listeners.clear();
    }
}
