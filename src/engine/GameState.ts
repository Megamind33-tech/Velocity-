/**
 * Global run/pause flag. Gameplay systems and the mic respect this when paused.
 */
export class GameState {
    private static _paused = false;
    /** When false, gate/distance systems skip work (map, menus). */
    private static _runActive = false;

    public static get paused(): boolean {
        return this._paused;
    }

    public static setPaused(value: boolean): void {
        this._paused = value;
    }

    public static get runActive(): boolean {
        return this._runActive;
    }

    public static setRunActive(value: boolean): void {
        this._runActive = value;
    }
}
