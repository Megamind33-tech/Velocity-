/**
 * Global run/pause flag. Gameplay systems and the mic respect this when paused.
 * When gameplay is inactive (world map, menus), the engine skips fixed-step simulation.
 */
export class GameState {
    private static _paused = false;
    private static _gameplayActive = false;

    public static get paused(): boolean {
        return this._paused;
    }

    public static setPaused(value: boolean): void {
        this._paused = value;
    }

    public static get gameplayActive(): boolean {
        return this._gameplayActive;
    }

    public static setGameplayActive(value: boolean): void {
        this._gameplayActive = value;
    }
}
