import React, { useMemo } from 'react';
import { Music, Star } from 'lucide-react';
import { SONGS } from '../lib/songs-extended';
import { WORLDS } from '../lib/progression';
import { PrimaryButton } from '../components/ui/PrimaryButton';

interface SongSelectScreenProps {
  worldId: number;
  completedSongs: { [key: string]: { score: number; stars: number } };
  onSelectSong: (songId: string) => void;
  onBack: () => void;
}

export function SongSelectScreen({
  worldId,
  completedSongs,
  onSelectSong,
  onBack,
}: SongSelectScreenProps) {
  const world = WORLDS.find(w => w.id === worldId);
  const worldSongs = useMemo(() => {
    return SONGS.filter(s => s.world === worldId).slice(0, 20);
  }, [worldId]);

  return (
    <div className="game-screen stage-bg flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-[var(--border-subtle)]">
        <h1 className="text-display-lg text-primary font-black mb-1">{world?.name}</h1>
        <p className="text-label text-secondary">{world?.description}</p>
      </div>

      {/* Song Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {worldSongs.map((song) => {
            const completion = completedSongs[song.id];
            const stars = completion?.stars || 0;
            const bestScore = completion?.score || 0;

            return (
              <div
                key={song.id}
                onClick={() => onSelectSong(song.id)}
                className="group cursor-pointer"
              >
                <div className="card-accent-primary hover:border-[var(--color-primary)] transition-all h-full flex flex-col">
                  <div className="flex items-start gap-2 mb-2">
                    <Music className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-label font-black text-primary truncate">{song.title}</h3>
                      <p className="text-caption text-secondary truncate">{song.artist}</p>
                    </div>
                  </div>

                  <div className="space-y-1 mb-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-tertiary">Duration:</span>
                      <span className="text-secondary font-bold">{song.duration}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-tertiary">Range:</span>
                      <span className="text-secondary font-bold">
                        {Math.abs(song.maxNote - song.minNote)} semitones
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= stars
                            ? 'fill-[#FFC94A] text-[#FFC94A]'
                            : 'text-[var(--border-default)]'
                        }`}
                      />
                    ))}
                  </div>

                  {bestScore > 0 && (
                    <p className="text-caption text-success font-bold">Best: {bestScore}</p>
                  )}

                  <PrimaryButton
                    variant="cyan"
                    size="sm"
                    fullWidth
                    onClick={() => onSelectSong(song.id)}
                    className="mt-auto"
                  >
                    Select
                  </PrimaryButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl border border-[var(--border-default)] text-secondary hover:bg-[var(--bg-surface-elevated)] transition-all"
        >
          Back to Worlds
        </button>
      </div>
    </div>
  );
}
