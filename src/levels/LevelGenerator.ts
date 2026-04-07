import { Song } from '../data/songs';
import { getSongTimelineTargetSec } from '../data/songTimeline';
import { LevelDefinition } from '../data/levelDefinitions';
import { DifficultyScaler } from './DifficultyScaler';

export interface LevelGate {
    x: number;
    y: number;
    width: number;
    /** Target MIDI note for pitch gates / HUD tuning meter. */
    targetMidi: number;
}

/**
 * Generates rhythm-based levels with guaranteed solvability.
 * Supports both legacy (levelId + Song) and new (LevelDefinition) generation paths.
 */
export class LevelGenerator {
    /**
     * Generates a deterministic level from a seed and song data.
     */
    public generate(levelId: number, song: Song, worldHeight: number): LevelGate[] {
        let notesToUse = song.notes.map((n) => ({ ...n }));
        notesToUse = this.prepareNoteTimeline(song, notesToUse, 1.6);
        const gates: LevelGate[] = [];
        const baseSpeed = 300; // px per second
        const diff = DifficultyScaler.getMultiplier(levelId);

        const midiBase = 58;
        const midiSpan = 24;

        for (let i = 0; i < notesToUse.length; i++) {
            const note = notesToUse[i];
            const x = note.time * baseSpeed;

            const padding = 100;
            const y = padding + (note.pitch * (worldHeight - padding * 2));
            const targetMidi = midiBase + note.pitch * midiSpan;

            const baseW = 150 - levelId * 2;
            const gate: LevelGate = {
                x,
                y,
                width: Math.max(48, baseW / diff),
                targetMidi,
            };

            if (i > 0) {
                const prev = gates[i - 1];
                const dx = gate.x - prev.x;
                const dy = Math.abs(gate.y - prev.y);
                const dt = dx / baseSpeed;

                // Simple check: Can the plane move vertically (dy) in time (dt)?
                // Max vertical speed is roughly dictated by PHYSICS.THRUST_POWER and GRAVITY
                const maxVerticalSpeed = 420 / diff;
                if (dy / dt > maxVerticalSpeed) {
                    // Adjust y to be solvable
                    const direction = gate.y > prev.y ? 1 : -1;
                    gate.y = prev.y + (direction * maxVerticalSpeed * dt);
                }
            }

            gates.push(gate);
        }

        return gates;
    }

    /** Build gates from a level definition (note count, scroll speed, gate width). */
    public generateForDefinition(def: LevelDefinition, song: Song, worldHeight: number): LevelGate[] {
        if (song.notes.length === 0) {
            return this.generate(def.id, song, worldHeight);
        }
        let notes = song.notes.slice(0, def.gateCount).map((n) => ({ ...n }));
        if (notes.length < def.gateCount) {
            const src = song.notes;
            while (notes.length < def.gateCount) {
                notes.push({ ...src[notes.length % src.length] });
            }
        }
        notes = this.prepareNoteTimeline(song, notes, 2.4);

        const gates: LevelGate[] = [];
        const baseSpeed = def.scrollSpeed;
        const diff = DifficultyScaler.getMultiplier(def.id);

        const midiBase = 58;
        const midiSpan = 24;

        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            const x = note.time * baseSpeed;

            const padding = 100;
            const y = padding + note.pitch * (worldHeight - padding * 2);
            const targetMidi = midiBase + note.pitch * midiSpan;

            const baseW = def.gateWidth;
            const gate: LevelGate = {
                x,
                y,
                width: Math.max(48, baseW / diff),
                targetMidi,
            };

            if (i > 0) {
                const prev = gates[i - 1];
                const dx = gate.x - prev.x;
                const dy = Math.abs(gate.y - prev.y);
                const dt = dx / baseSpeed;

                const maxVerticalSpeed = 420 / diff;
                if (dy / dt > maxVerticalSpeed) {
                    const direction = gate.y > prev.y ? 1 : -1;
                    gate.y = prev.y + direction * maxVerticalSpeed * dt;
                }
            }

            gates.push(gate);
        }

        return gates;
    }

    /**
     * Ensures consecutive note times are at least `minGapSec` apart (preserves order).
     * Fixes “5 gates in 10s” tracks that were ~20s of flight at 180 px/s.
     */
    private expandNoteTimesToMinGap(notes: { time: number; pitch: number }[], minGapSec: number): { time: number; pitch: number }[] {
        if (notes.length === 0) return notes;
        const out = notes.map((n) => ({ ...n }));
        let t = out[0]!.time;
        for (let i = 1; i < out.length; i++) {
            const nextMin = t + minGapSec;
            if (out[i]!.time < nextMin) {
                out[i]!.time = nextMin;
            }
            t = out[i]!.time;
        }
        return out;
    }

    /**
     * Min-gap expansion then linear scale so the last gate time matches song target length
     * (real `durationSec` or a default from gate count). Keeps relative rhythm, fills the run.
     */
    private prepareNoteTimeline(
        song: Song,
        notes: { time: number; pitch: number }[],
        minGapSec: number
    ): { time: number; pitch: number }[] {
        if (notes.length === 0) return notes;
        let out = this.expandNoteTimesToMinGap(notes, minGapSec);
        const targetEnd = getSongTimelineTargetSec(song, out.length);
        out = this.scaleNoteTimesToEnd(out, targetEnd, 0.5);
        return out;
    }

    /** Map first → startPad, last → endTime (seconds), linearly. */
    private scaleNoteTimesToEnd(
        notes: { time: number; pitch: number }[],
        endTime: number,
        startPad: number
    ): { time: number; pitch: number }[] {
        if (notes.length === 0) return notes;
        const t0 = notes[0]!.time;
        const tL = notes[notes.length - 1]!.time;
        const span = tL - t0;
        const out = notes.map((n) => ({ ...n }));
        const targetEnd = Math.max(startPad + 2, endTime);
        if (span < 1e-4) {
            if (out.length === 1) {
                out[0]!.time = targetEnd;
                return out;
            }
            const spread = Math.max(4, targetEnd - startPad);
            const denom = Math.max(1, out.length - 1);
            for (let i = 0; i < out.length; i++) {
                out[i]!.time = startPad + (spread * i) / denom;
            }
            return out;
        }
        for (let i = 0; i < out.length; i++) {
            const u = (out[i]!.time - t0) / span;
            out[i]!.time = startPad + u * (targetEnd - startPad);
        }
        return out;
    }
}
