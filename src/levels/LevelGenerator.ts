import { Song } from '../data/songs';
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
        const notesToUse = song.notes;
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
        let notes = song.notes.slice(0, def.gateCount);
        if (notes.length < def.gateCount) {
            const src = song.notes;
            while (notes.length < def.gateCount) {
                notes.push(src[notes.length % src.length]);
            }
        }
        /** Stretch timeline so short songs don’t end in a few seconds at high scrollSpeed. */
        const minGapSec = 2.4;
        notes = this.expandNoteTimesToMinGap(notes, minGapSec);

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
}
