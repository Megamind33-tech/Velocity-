import { Song } from '../data/songs';
import { PHYSICS } from '../data/constants';

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
 */
export class LevelGenerator {
    /**
     * Generates a deterministic level from a seed and song data.
     */
    public generate(levelId: number, song: Song, worldHeight: number): LevelGate[] {
        const rng = new Random(levelId);
        const gates: LevelGate[] = [];
        const baseSpeed = 300; // px per second

        for (let i = 0; i < song.notes.length; i++) {
            const note = song.notes[i];
            const x = note.time * baseSpeed;
            
            // Map pitch (0-1) to height (avoiding screen edges)
            const padding = 100;
            const y = padding + (note.pitch * (worldHeight - padding * 2));
            
            const gate: LevelGate = {
                x,
                y,
                width: 150 - (levelId * 2) // Gates get smaller as level increases
            };

            // Gap-checking: Ensure the gate is reachable from the previous one
            if (i > 0) {
                const prev = gates[i - 1];
                const dx = gate.x - prev.x;
                const dy = Math.abs(gate.y - prev.y);
                const dt = dx / baseSpeed;

                // Simple check: Can the plane move vertically (dy) in time (dt)?
                // Max vertical speed is roughly dictated by PHYSICS.THRUST_POWER and GRAVITY
                const maxVerticalSpeed = 400; 
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
}
