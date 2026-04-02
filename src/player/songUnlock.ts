import type { Song } from '../data/songs';
import type { SongUnlockRules } from './CareerProgress';
import { CareerProgress } from './CareerProgress';

export function toUnlockRules(song: Song): SongUnlockRules {
    return {
        id: song.id,
        starsRequired: song.starsRequired,
        secret: song.secret,
        bonusUnlockCost: song.bonusUnlockCost,
    };
}

/** Secret chart hidden until stars OR permanent credit unlock. */
export function isSongMaskedSecret(song: Song): boolean {
    if (!song.secret) return false;
    const rules = toUnlockRules(song);
    return !CareerProgress.canPlaySong(rules);
}

/** Charts visible in the picker (non-secret always; secret only when playable). */
export function visibleCharts(songs: Song[]): Song[] {
    return songs.filter((s) => !isSongMaskedSecret(s));
}
