import React from 'react';
import { Zap, Lock } from 'lucide-react';
import { WORLDS } from '../lib/progression';
import type { PlayerProfile } from '../lib/profile';
import type { Screen } from '../App';
import {
  FantasyGameShell,
  mapFantasyNavToScreen,
  type FantasyNavKey,
} from '../components/layout/FantasyGameShell';

interface WorldSelectScreenProps {
  profile: PlayerProfile | null;
  unlockedWorlds: number[];
  currentWorldProgress: { [key: number]: number };
  onSelectWorld: (worldId: number) => void;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export function WorldSelectScreen({
  profile,
  unlockedWorlds,
  currentWorldProgress,
  onSelectWorld,
  onBack,
  onNavigate,
}: WorldSelectScreenProps) {
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
        <h1 className="fl-screen-title">Worlds</h1>
        <p className="text-xs text-[rgba(220,210,245,0.7)] mt-1 leading-relaxed">
          Choose a region — each world unlocks new tracks.
        </p>
      </div>
      <div className="fl-scroll !pt-2">
        {WORLDS.map((world) => {
          const isUnlocked = unlockedWorlds.includes(world.id);
          const progress = currentWorldProgress[world.id] || 0;
          const progressPercent = (progress / world.minSongsToUnlock) * 100;

          const difficultyColors = {
            novice: '#4ade80',
            intermediate: '#f0d78c',
            advanced: '#f87171',
            master: '#a78bfa',
            legend: '#38bdf8',
          };

          return (
            <div
              key={world.id}
              className={`fl-card mb-3 ${!isUnlocked ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-[#fff8e8] text-base tracking-tight">{world.name}</h2>
                    {!isUnlocked && <Lock className="w-4 h-4 text-[#f87171] shrink-0" />}
                  </div>
                  <p className="text-xs text-[rgba(220,210,245,0.65)] leading-snug">{world.description}</p>
                </div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0 text-[#0d0618]"
                  style={{
                    background: `linear-gradient(145deg, ${difficultyColors[world.difficulty]}, ${difficultyColors[world.difficulty]}99)`,
                    boxShadow: `0 0 16px ${difficultyColors[world.difficulty]}44`,
                  }}
                >
                  {world.id}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="rounded-xl py-2 px-1 border border-[rgba(255,215,120,0.15)] bg-[rgba(0,0,0,0.2)]">
                  <div className="text-[8px] font-bold uppercase tracking-wider text-[rgba(220,210,245,0.55)]">
                    Songs
                  </div>
                  <div className="text-sm font-black text-[#7dd3fc] tabular-nums">{world.totalSongs}</div>
                </div>
                <div className="rounded-xl py-2 px-1 border border-[rgba(255,215,120,0.15)] bg-[rgba(0,0,0,0.2)]">
                  <div className="text-[8px] font-bold uppercase tracking-wider text-[rgba(220,210,245,0.55)]">
                    Levels
                  </div>
                  <div className="text-sm font-black text-[#c4b5fd] tabular-nums">
                    {world.totalSongs * world.levelsPerSong}
                  </div>
                </div>
                <div className="rounded-xl py-2 px-1 border border-[rgba(255,215,120,0.15)] bg-[rgba(0,0,0,0.2)]">
                  <div className="text-[8px] font-bold uppercase tracking-wider text-[rgba(220,210,245,0.55)]">
                    Tier
                  </div>
                  <div className="text-[10px] font-black text-[#4ade80] capitalize leading-tight mt-1">
                    {world.difficulty}
                  </div>
                </div>
              </div>

              {isUnlocked && (
                <>
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[rgba(220,210,245,0.5)]">
                        Next unlock
                      </span>
                      <span className="text-[9px] font-bold text-[#fff8e8] tabular-nums">
                        {progress}/{world.minSongsToUnlock}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,215,120,0.12)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, progressPercent)}%`,
                          background: 'linear-gradient(90deg, #a78bfa, #c4b5fd)',
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="fl-play-btn fl-play-btn--compact w-full flex items-center justify-center gap-2"
                    onClick={() => onSelectWorld(world.id)}
                  >
                    <Zap className="w-4 h-4 shrink-0" />
                    Enter
                  </button>
                </>
              )}

              {!isUnlocked && (
                <p className="text-[11px] text-center text-[rgba(220,210,245,0.55)] leading-snug py-1">
                  Clear {WORLDS[world.id - 2]?.minSongsToUnlock ?? 0} songs in{' '}
                  {WORLDS[world.id - 2]?.name ?? 'prior world'}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="fl-back-bar">
        <button type="button" className="fl-back-btn" onClick={onBack}>
          ← Home
        </button>
      </div>
    </FantasyGameShell>
  );
}
