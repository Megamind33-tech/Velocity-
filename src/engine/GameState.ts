/**
 * Global run/pause flag. Gameplay systems and the mic respect this when paused.
 */
export class GameState {
    private static _paused = false;

    public static get paused(): boolean {
        return this._paused;
    }

    public static setPaused(value: boolean): void {
        this._paused = value;
    }
}
