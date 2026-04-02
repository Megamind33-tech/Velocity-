/**
 * Wires arcade GameUIManager screens to the game bootstrap in main.ts.
 */

export type GameFlowCallbacks = {
    openMissionSelect: () => void;
    openMainMenu: () => void;
};

let flow: Partial<GameFlowCallbacks> = {};

export function registerGameFlowCallbacks(cb: GameFlowCallbacks): void {
    flow = cb;
}

export function gameFlow(): GameFlowCallbacks {
    return {
        openMissionSelect: () => flow.openMissionSelect?.(),
        openMainMenu: () => flow.openMainMenu?.(),
    };
}

export type HudDataSource = {
    getScore: () => number;
    getLevelId: () => number;
    getVocal01: () => number;
    getAltitudeDisplay: () => number;
    getForwardSpeed: () => number;
};

const defaultHud: HudDataSource = {
    getScore: () => 0,
    getLevelId: () => 1,
    getVocal01: () => 0,
    getAltitudeDisplay: () => 0,
    getForwardSpeed: () => 0,
};

let hudSource: HudDataSource = defaultHud;

export function registerHudDataSource(src: HudDataSource): void {
    hudSource = src;
}

export function getHudDataSource(): HudDataSource {
    return hudSource;
}

export type RunEndCallbacks = {
    onRetryRun: () => void;
    onNextLevel: () => void;
};

let runEnd: Partial<RunEndCallbacks> = {};

export function registerRunEndCallbacks(cb: RunEndCallbacks): void {
    runEnd = cb;
}

export function runEndActions(): RunEndCallbacks {
    return {
        onRetryRun: () => runEnd.onRetryRun?.(),
        onNextLevel: () => runEnd.onNextLevel?.(),
    };
}

export type PauseRequestHandler = () => void;

let pauseHandler: PauseRequestHandler | null = null;

export function registerPauseHandler(h: PauseRequestHandler): void {
    pauseHandler = h;
}

export function requestGamePause(): void {
    pauseHandler?.();
}

export type PauseResumeCallback = () => void;

let pauseResume: PauseResumeCallback | null = null;

export function registerPauseResume(cb: PauseResumeCallback): void {
    pauseResume = cb;
}

export function resumeFromGamePause(): void {
    pauseResume?.();
}

export type RunSummary = {
    score: number;
    stars: number;
    gatesPassed: number;
    totalGates: number;
};

let lastRunSummary: RunSummary = { score: 0, stars: 0, gatesPassed: 0, totalGates: 0 };

export function setLastRunSummary(partial: Partial<RunSummary>): void {
    lastRunSummary = { ...lastRunSummary, ...partial };
}

export function getLastRunSummary(): RunSummary {
    return { ...lastRunSummary };
}
