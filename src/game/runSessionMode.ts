/**
 * When a backing track defines session length, all gates may be cleared before the song ends.
 * GatePlayoutSystem defers LEVEL_COMPLETE until audio ends (see main.ts).
 */
let waitForTrackEnd = false;
let awaitingTrackEndAfterAllGates = false;

export function setRunSessionWaitForTrackEnd(value: boolean): void {
    waitForTrackEnd = value;
    if (!value) awaitingTrackEndAfterAllGates = false;
}

export function shouldDeferLevelCompleteUntilTrackEnd(): boolean {
    return waitForTrackEnd;
}

export function markAwaitingTrackEndAfterAllGates(): void {
    awaitingTrackEndAfterAllGates = true;
}

export function clearAwaitingTrackEndAfterAllGates(): void {
    awaitingTrackEndAfterAllGates = false;
}

export function isAwaitingTrackEndAfterAllGates(): boolean {
    return awaitingTrackEndAfterAllGates;
}
