import type { FlightDifficulty } from './vocalFlightRules';

let difficulty: FlightDifficulty = 'medium';

export function setRunDifficulty(d: FlightDifficulty | undefined): void {
    difficulty = d ?? 'medium';
}

export function getRunDifficulty(): FlightDifficulty {
    return difficulty;
}
