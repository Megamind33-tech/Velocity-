import { Song } from '../data/songs';

export interface LevelGate {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Generates rhythm-based levels with guaranteed solvability.
 */
export class LevelGenerator {
    /**
     * Generates a deterministic level from a seed and song data.
     */
    public generate(levelId: number, song: Song, worldHeight: number, startX: number = 0): LevelGate[] {
        const gates: LevelGate[] = [];
        const difficultyTier = song.difficultyTier ?? Math.min(5, Math.max(1, Math.ceil(levelId / 3)));
        const baseSpeed = this.getBaseSpeed(song, difficultyTier);
        const gateWidth = this.getGateWidth(song, difficultyTier);
        const gateHeight = this.getGateHeight(song, difficultyTier);
        const padding = 96;

        for (let i = 0; i < song.notes.length; i++) {
            const note = song.notes[i];
            const x = startX + (note.time * baseSpeed);
            
            // Map pitch (0-1) to height (avoiding screen edges)
            const y = padding + (note.pitch * (worldHeight - padding * 2));
            
            const gate: LevelGate = {
                x,
                y,
                width: gateWidth,
                height: gateHeight
            };

            // Gap-checking: Ensure the gate is reachable from the previous one
            if (i > 0) {
                const prev = gates[i - 1];
                const dx = gate.x - prev.x;
                const dy = Math.abs(gate.y - prev.y);
                const dt = dx / baseSpeed;

                // Simple check: Can the plane move vertically (dy) in time (dt)?
                const maxVerticalSpeed = this.getReachabilityLimit(song, difficultyTier);
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

    private getBaseSpeed(song: Song, difficultyTier: number): number {
        const lessonBase = song.lessonType === 'harmony_static'
            ? 240
            : song.lessonType === 'rhythm'
                ? 320
                : 285;
        return lessonBase + ((difficultyTier - 1) * 10);
    }

    private getGateWidth(song: Song, difficultyTier: number): number {
        const lessonBase = song.lessonType === 'harmony_static'
            ? 250
            : song.lessonType === 'harmony_moving'
                ? 185
                : song.lessonType === 'rhythm'
                    ? 145
                    : 180;
        return Math.max(110, lessonBase - ((difficultyTier - 1) * 12));
    }

    private getGateHeight(song: Song, difficultyTier: number): number {
        const lessonBase = song.lessonType === 'registration'
            ? 170
            : song.lessonType === 'interval'
                ? 180
                : song.lessonType === 'harmony_static'
                    ? 210
                    : 195;
        return Math.max(110, lessonBase - ((difficultyTier - 1) * 10));
    }

    private getReachabilityLimit(song: Song, difficultyTier: number): number {
        const lessonBase = song.lessonType === 'interval'
            ? 440
            : song.lessonType === 'harmony_moving'
                ? 360
                : 400;
        return Math.max(300, lessonBase - ((difficultyTier - 1) * 12));
    }
}
