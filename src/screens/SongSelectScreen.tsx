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
    <div className="game-screen mg-stage flex flex-col">
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />
      <header className="mg-topbar shrink-0 flex-col items-stretch !gap-1">
        <h1 className="mg-topbar-title !text-[15px] !tracking-[0.12em]">{world?.name ?? 'Tracks'}</h1>
        <p className="mg-topbar-sub !normal-case !tracking-normal !text-xs !font-medium text-[#A7B0C6] max-w-full">
          {world?.description}
        </p>
      </header>

      <div className="mg-scroll !pt-3">
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
                <div className="mg-panel !p-3 !animate-none hover:border-[rgba(67,231,255,0.45)] transition-colors h-full flex flex-col min-h-[200px]">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="mg-action-icon w-9 h-9 shrink-0 mt-0.5 p-0">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-black text-[#F5F7FC] truncate uppercase tracking-wide">{song.title}</h3>
                      <p className="text-[10px] text-[#7A8399] truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>

                  <div className="space-y-1 mb-2 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-[#7A8399]">Duration</span>
                      <span className="text-[#F5F7FC] font-bold tabular-nums">{song.duration}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7A8399]">Range</span>
                      <span className="text-[#F5F7FC] font-bold tabular-nums">
                        {Math.abs(song.maxNote - song.minNote)} st
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= stars
                            ? 'fill-[#FFC94A] text-[#FFC94A]'
                            : 'text-[var(--border-default)]'
                        }`}
                      />
                    ))}
                  </div>

                  {bestScore > 0 && (
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#B9FF66] mb-2">
                      Best {bestScore.toLocaleString()}
                    </p>
                  )}

                  <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
                    <PrimaryButton
                      variant="cyan"
                      size="sm"
                      fullWidth
                      onClick={() => onSelectSong(song.id)}
                      className="!text-[10px] !tracking-[0.15em]"
                    >
                      Select
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mg-footer-bar shrink-0">
        <button type="button" onClick={onBack} className="mg-btn-back">
          ← Worlds
        </button>
      </footer>
    </div>
  );
}
