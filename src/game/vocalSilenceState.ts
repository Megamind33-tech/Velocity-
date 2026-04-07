/** Consecutive fixed-tick frames below vocal volume gate (for hard breath penalty + cruise damp). */
let silentFrames = 0;

export function resetSilentFrames(): void {
    silentFrames = 0;
}

export function registerSilentFrame(isSilent: boolean): void {
    if (isSilent) silentFrames++;
    else silentFrames = 0;
}

export function getSilentFrames(): number {
    return silentFrames;
}
