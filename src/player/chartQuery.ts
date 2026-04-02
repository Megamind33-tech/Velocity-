import type { Song } from '../data/songs';
import type { GameMode } from '../data/gameModes';
import type { TourRegionId } from '../data/worldTour';
import { isSongMaskedSecret } from './songUnlock';

export function chartsForMode(songs: Song[], mode: GameMode): Song[] {
    return songs.filter((s) => s.gameMode === mode);
}

export function visibleChartsForMode(songs: Song[], mode: GameMode): Song[] {
    return chartsForMode(songs, mode).filter((s) => !isSongMaskedSecret(s));
}

export function chartsForModeAndRegion(songs: Song[], mode: GameMode, region: TourRegionId): Song[] {
    return visibleChartsForMode(songs, mode).filter((s) => s.regionId === region);
}
