import type { Song } from './songs';

/**
 * Target time (seconds) for the **last** gate when no real audio length is set.
 * Spreads mock charts across a believable “song length” instead of ~8–12s of note data.
 */
export function defaultSongTimelineTargetSec(gateCount: number): number {
    const k = Math.max(0, gateCount - 1);
    return Math.max(22, 10 + k * 1.4);
}

/** Seconds to stretch the gate timeline to; prefer real track length when you have audio. */
export function getSongTimelineTargetSec(song: Song, gateCount: number): number {
    if (song.durationSec != null && Number.isFinite(song.durationSec) && song.durationSec > 4) {
        return song.durationSec;
    }
    return defaultSongTimelineTargetSec(gateCount);
}
