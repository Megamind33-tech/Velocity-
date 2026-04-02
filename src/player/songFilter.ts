import type { Song } from '../data/songs';
import type { TourRegionId } from '../data/worldTour';

/** Charts tagged for a continent (after secret visibility filter). */
export function chartsForTourRegion(songs: Song[], regionId: TourRegionId): Song[] {
    return songs.filter((s) => s.regionId === regionId);
}
