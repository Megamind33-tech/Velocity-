import type { VocalStage } from './vocalStages';
import type { TourRegionId } from './worldTour';
import type { GameMode } from './gameModes';

export interface SongNote {
    time: number;
    pitch: number;
}

export interface Song {
    id: string;
    gameMode: GameMode;
    stage: VocalStage;
    orderInStage: number;
    sourceTrackKey?: string;
    name: string;
    displaySubtitle?: string;
    bpm: number;
    notes: SongNote[];
    starsRequired: number;
    secret?: boolean;
    bonusUnlockCost?: number;
    cruiseSpeedMultiplier: number;
    parallaxPalette: [number, number, number];
    tourLegIndex?: number;
    regionId?: TourRegionId;
}
