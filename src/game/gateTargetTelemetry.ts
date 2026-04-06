/**
 * Nearest-ahead gate target pitch for HUD tuning meter (cents vs sung note).
 */

import { hzToMidi } from './vocalFlightState';
import { getPlayerWorldX, getWorldScrollX } from './worldScroll';

export type GateTarget = { logicalX: number; targetMidi: number };

let targets: GateTarget[] = [];

export function setLevelGateTargets(list: GateTarget[]): void {
    targets = list.slice().sort((a, b) => a.logicalX - b.logicalX);
}

export function clearGateTargets(): void {
    targets = [];
}

function playerLogicalX(): number {
    return getWorldScrollX() + getPlayerWorldX();
}

/**
 * Signed cents from sung pitch to nearest gate ahead (null if none / not singing).
 */
export function getTuningCentsFromSungHz(sungHz: number, volume: number, volGate: number): number | null {
    if (volume <= volGate || sungHz <= 0 || targets.length === 0) return null;
    const px = playerLogicalX();
    const sung = hzToMidi(sungHz);
    let best: GateTarget | null = null;
    let bestDx = Infinity;
    for (const g of targets) {
        if (g.logicalX < px - 20) continue;
        const dx = g.logicalX - px;
        if (dx >= -40 && dx < bestDx) {
            bestDx = dx;
            best = g;
        }
    }
    if (!best) return null;
    return Math.round((sung - best.targetMidi) * 100);
}
