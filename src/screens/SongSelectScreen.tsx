import React, { useMemo } from 'react';
import { Music, Star } from 'lucide-react';
import { SONGS } from '../lib/songs-extended';
import { WORLDS } from '../lib/progression';
import type { PlayerProfile } from '../lib/profile';
import type { Screen } from '../App';
import {
  FantasyGameShell,
  mapFantasyNavToScreen,
  type FantasyNavKey,
} from '../components/layout/FantasyGameShell';

interface SongSelectScreenProps {
  profile: PlayerProfile | null;
  worldId: number;
  completedSongs: { [key: string]: { score: number; stars: number } };
  onSelectSong: (songId: string) => void;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export function SongSelectScreen({
  profile,
  worldId,
  completedSongs,
  onSelectSong,
  onBack,
  onNavigate,
}: SongSelectScreenProps) {
  const world = WORLDS.find((w) => w.id === worldId);
  const worldSongs = useMemo(() => SONGS.filter((s) => s.world === worldId).slice(0, 20), [worldId]);

  const handleNav = (key: FantasyNavKey) => {
    if (key === 'play') return;
    onNavigate(mapFantasyNavToScreen(key));
  };

  return (
    <FantasyGameShell
      profile={profile}
      activeNav="play"
      onNav={handleNav}
      onOpenSettings={() => onNavigate('settings')}
    >
      <div className="px-4 pt-2 pb-1 shrink-0">
        <h1 className="fl-screen-title !normal-case !tracking-tight !text-lg">{world?.name ?? 'Tracks'}</h1>
        <p className="text-xs text-[rgba(220,210,245,0.7)] mt-1 leading-relaxed">{world?.description}</p>
      </div>

      <div className="fl-scroll !pt-2">
        <div className="grid grid-cols-2 gap-3">
          {worldSongs.map((song) => {
            const completion = completedSongs[song.id];
            const stars = completion?.stars || 0;
            const bestScore = completion?.score || 0;

            return (
              <div
                key={song.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectSong(song.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSong(song.id);
                  }
                }}
                className="fl-card text-left w-full cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-[rgba(255,215,120,0.25)]"
                    style={{ background: 'rgba(0,0,0,0.25)' }}
                  >
                    <Music className="w-4 h-4 text-[#7dd3fc]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[11px] font-bold text-[#fff8e8] truncate uppercase tracking-wide">
                      {song.title}
                    </h3>
                    <p className="text-[9px] text-[rgba(220,210,245,0.55)] truncate mt-0.5">{song.artist}</p>
                  </div>
                </div>

                <div className="space-y-0.5 mb-2 text-[9px]">
                  <div className="flex justify-between gap-2">
                    <span className="text-[rgba(220,210,245,0.5)]">Duration</span>
                    <span className="text-[#fff8e8] font-bold tabular-nums">{song.duration}s</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[rgba(220,210,245,0.5)]">Range</span>
                    <span className="text-[#fff8e8] font-bold tabular-nums">
                      {Math.abs(song.maxNote - song.minNote)} st
                    </span>
                  </div>
                </div>

                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= stars ? 'fill-[#f0d78c] text-[#f0d78c]' : 'text-[rgba(255,255,255,0.15)]'
                      }`}
                    />
                  ))}
                </div>

                {bestScore > 0 && (
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#4ade80] mb-2">
                    Best {bestScore.toLocaleString()}
                  </p>
                )}

                <div className="fl-play-btn fl-play-btn--compact !py-2.5 text-center pointer-events-none">
                  Select
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fl-back-bar">
        <button type="button" className="fl-back-btn" onClick={onBack}>
          ← Worlds
        </button>
      </div>
    </FantasyGameShell>
  );
}
