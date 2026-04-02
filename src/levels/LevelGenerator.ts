import { Song } from '../data/songs';
import { DifficultyScaler } from './DifficultyScaler';

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
        const gates: LevelGate[] = [];
        const baseSpeed = 300; // px per second
        const diff = DifficultyScaler.getMultiplier(levelId);

        for (let i = 0; i < notesToUse.length; i++) {
            const note = notesToUse[i];
            const x = note.time * baseSpeed;

            const padding = 100;
            const y = padding + (note.pitch * (worldHeight - padding * 2));
            
            const baseW = 150 - levelId * 2;
            const gate: LevelGate = {
                x,
                y,
                width: Math.max(48, baseW / diff)
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
}
