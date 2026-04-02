import React, { useMemo } from 'react';
import { Music, Star, ChevronLeft } from 'lucide-react';
import { SONGS } from '../lib/songs-extended';
import { WORLDS } from '../lib/progression';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { IconButton } from '../components/ui/IconButton';

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
      <div className="mg-kit-layer mg-kit-layer--stage" aria-hidden />
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />

      <header className="mg-topbar shrink-0">
        <IconButton label="Back" variant="white" size="sm" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </IconButton>
        <div className="flex-1 min-w-0">
          <h1 className="mg-topbar-title !text-[15px] !tracking-[0.12em]">{world?.name ?? 'Tracks'}</h1>
          <p className="mg-topbar-sub !normal-case !tracking-normal !text-xs !font-medium text-[#8BA0C8] max-w-full">
            {world?.description}
          </p>
        </div>
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
                <div className="mg-panel !p-3 !animate-none hover:border-[rgba(100,180,255,0.50)] transition-colors h-full flex flex-col min-h-[200px]">
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className="w-9 h-9 shrink-0 mt-0.5 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.18)',
                      }}
                    >
                      <Music className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-black text-white truncate uppercase tracking-wide">{song.title}</h3>
                      <p className="text-[10px] text-[#6B85B0] truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>

                  <div className="space-y-1 mb-2 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-[#6B85B0]">Duration</span>
                      <span className="text-white font-bold tabular-nums">{song.duration}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B85B0]">Range</span>
                      <span className="text-white font-bold tabular-nums">
                        {Math.abs(song.maxNote - song.minNote)} st
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= stars
                            ? 'fill-[#FFC94A] text-[#FFC94A] mg-star'
                            : 'text-[rgba(100,180,255,0.25)] mg-star--empty'
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
                      variant="gold"
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
