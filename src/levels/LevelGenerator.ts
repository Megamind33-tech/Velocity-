import { Song } from '../data/songs';
import { LevelDefinition } from '../data/levelDefinitions';
import { DifficultyScaler } from './DifficultyScaler';

/**
 * Deterministic PRNG using LCG algorithm.
 */
class Random {
    private seed: number;
    constructor(seed: number) { this.seed = seed; }
    next(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
}

export interface LevelGate {
    x: number;
    y: number;
    width: number;
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
        const baseSpeed = 300;
        const gateWidth = 150 - (levelId * 2);
        return this.buildGates(levelId, song, worldHeight, baseSpeed, gateWidth);
    }

    /**
     * Generates a level using a full LevelDefinition for learning-aware progression.
     */
    public generateFromDefinition(def: LevelDefinition, song: Song, worldHeight: number): LevelGate[] {
        const scrollSpeed = DifficultyScaler.getScrollSpeed(def.scrollSpeed, def.id, def.zone);
        const gateWidth = DifficultyScaler.getGateWidth(def.gateWidth, def.id, def.zone);
        return this.buildGates(def.id, song, worldHeight, scrollSpeed, gateWidth, def.gateCount);
    }

    private buildGates(
        seed: number,
        song: Song,
        worldHeight: number,
        baseSpeed: number,
        gateWidth: number,
        maxGates?: number,
    ): LevelGate[] {
        const rng = new Random(seed);
        const gates: LevelGate[] = [];
        const notesToUse = maxGates ? song.notes.slice(0, maxGates) : song.notes;

        for (let i = 0; i < notesToUse.length; i++) {
            const note = notesToUse[i];
            const x = note.time * baseSpeed;

            const padding = 100;
            const y = padding + (note.pitch * (worldHeight - padding * 2));

            const gate: LevelGate = {
                x,
                y,
                width: Math.max(80, gateWidth + rng.next() * 10 - 5),
            };

            if (i > 0) {
                const prev = gates[i - 1];
                const dx = gate.x - prev.x;
                const dy = Math.abs(gate.y - prev.y);
                const dt = dx / baseSpeed;

                const maxVerticalSpeed = 400;
                if (dt > 0 && dy / dt > maxVerticalSpeed) {
                    const direction = gate.y > prev.y ? 1 : -1;
                    gate.y = prev.y + (direction * maxVerticalSpeed * dt);
                }
            }

            gates.push(gate);
        }

        return gates;
    }
}
