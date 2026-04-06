/**
 * Song pitch span + live vocal flight targets for fixed-player vertical steering.
 */

import type { Song } from '../data/songs';

/** MIDI note numbers bounding the current song's written pitch (0–1 notes). */
let songMinMidi = 60;
let songMaxMidi = 72;

/** Hz → MIDI (A4 = 69). */
export function hzToMidi(hz: number): number {
    if (hz <= 0) return songMinMidi;
    return 69 + 12 * Math.log2(hz / 440);
}

/** Map live MIDI into 0–1 using current song span. */
export function midiToNormalized(midi: number): number {
    const span = Math.max(0.5, songMaxMidi - songMinMidi);
    return Math.max(0, Math.min(1, (midi - songMinMidi) / span));
}

/** Recompute song MIDI bounds from note pitches (0 = low, 1 = high). */
export function setSongPitchRangeFromNotes(song: Song): void {
    if (!song.notes.length) {
        songMinMidi = 55;
        songMaxMidi = 75;
        return;
    }
    const BASE = 58;
    const SPAN = 24;
    let lo = 127;
    let hi = 0;
    for (const n of song.notes) {
        const m = BASE + n.pitch * SPAN;
        lo = Math.min(lo, m);
        hi = Math.max(hi, m);
    }
    if (hi - lo < 3) {
        lo -= 2;
        hi += 2;
    }
    songMinMidi = lo;
    songMaxMidi = hi;
}

export function getSongMidiRange(): { min: number; max: number } {
    return { min: songMinMidi, max: songMaxMidi };
}

/** Normalized altitude 0–1 from screen Y (playfield). */
export function screenYToAltitude01(y: number, screenH: number, pad: number): number {
    const usable = Math.max(1, screenH - pad * 2);
    return Math.max(0, Math.min(1, (y - pad) / usable));
}

/** Target screen Y from normalized pitch 0–1. */
export function normalizedPitchToScreenY(t: number, screenH: number, pad: number): number {
    return pad + Math.max(0, Math.min(1, t)) * (screenH - pad * 2);
}
