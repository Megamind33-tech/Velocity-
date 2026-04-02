import React from 'react';
import { Zap, Lock, ChevronLeft } from 'lucide-react';
import { WORLDS } from '../lib/progression';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { IconButton } from '../components/ui/IconButton';

interface WorldSelectScreenProps {
  unlockedWorlds: number[];
  currentWorldProgress: { [key: number]: number };
  onSelectWorld: (worldId: number) => void;
  onBack: () => void;
}

export function WorldSelectScreen({
  unlockedWorlds,
  currentWorldProgress,
  onSelectWorld,
  onBack,
}: WorldSelectScreenProps) {
  return (
    <div className="game-screen mg-stage flex flex-col">
      <div className="mg-kit-layer mg-kit-layer--tournament" aria-hidden />
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />

      <header className="mg-topbar shrink-0">
        <IconButton label="Back" variant="white" size="sm" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </IconButton>
        <div className="flex-1 min-w-0">
          <h1 className="mg-topbar-title">Worlds</h1>
          <p className="mg-topbar-sub !normal-case !tracking-normal !text-xs !font-medium text-[#8BA0C8]">
            Choose a region — each world unlocks new tracks.
          </p>
        </div>
      </header>

      <div className="mg-scroll space-y-4">
        {WORLDS.map((world) => {
          const isUnlocked = unlockedWorlds.includes(world.id);
          const progress = currentWorldProgress[world.id] || 0;
          const progressPercent = (progress / world.minSongsToUnlock) * 100;

          const difficultyColors: Record<string, string> = {
            novice: '#B9FF66',
            intermediate: '#FFC94A',
            advanced: '#FF6B6B',
            master: '#7D5CFF',
            legend: '#43E7FF',
          };
          const diffColor = difficultyColors[world.difficulty] || '#FFC94A';

          return (
            <div
              key={world.id}
              className={`mg-panel !p-4 ${!isUnlocked ? '!opacity-55 !pointer-events-none' : 'cursor-pointer active:scale-[0.99] transition-transform'}`}
              style={!isUnlocked ? { animation: 'none' } : undefined}
              onClick={() => isUnlocked && onSelectWorld(world.id)}
              role="button"
              tabIndex={isUnlocked ? 0 : -1}
              onKeyDown={(e) => {
                if (isUnlocked && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectWorld(world.id);
                }
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-lg font-black text-white tracking-tight">{world.name}</h2>
                    {!isUnlocked && <Lock className="w-4 h-4 text-[#FF6B6B] shrink-0" />}
                  </div>
                  <p className="text-xs text-[#8BA0C8] leading-snug">{world.description}</p>
                </div>
                <div
                  className="mg-hex w-11 h-12 text-xs shrink-0 ml-3"
                  style={{
                    background: `linear-gradient(145deg, ${diffColor}, ${diffColor}cc)`,
                    boxShadow: `0 0 18px ${diffColor}55`,
                    color: '#0B0E2A',
                  }}
                >
                  {world.id}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="rounded-xl p-2" style={{ background: 'rgba(30,60,140,0.3)', border: '1px solid rgba(67,231,255,0.18)' }}>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[#6B85B0]">Songs</div>
                  <div className="text-base font-black text-[#43E7FF] tabular-nums">{world.totalSongs}</div>
                </div>
                <div className="rounded-xl p-2" style={{ background: 'rgba(40,30,100,0.3)', border: '1px solid rgba(125,92,255,0.18)' }}>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[#6B85B0]">Levels</div>
                  <div className="text-base font-black text-[#7D5CFF] tabular-nums">
                    {world.totalSongs * world.levelsPerSong}
                  </div>
                </div>
                <div className="rounded-xl p-2" style={{ background: 'rgba(40,80,20,0.2)', border: '1px solid rgba(185,255,102,0.18)' }}>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[#6B85B0]">Tier</div>
                  <div className="text-[11px] font-black text-[#B9FF66] capitalize leading-tight mt-1">{world.difficulty}</div>
                </div>
              </div>

              {isUnlocked && (
                <>
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B85B0]">Next unlock</span>
                      <span className="text-[10px] font-black text-white tabular-nums">
                        {progress}/{world.minSongsToUnlock}
                      </span>
                    </div>
                    <div className="mg-progress-track !h-2.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#43E7FF] to-[#7D5CFF] transition-all rounded-full"
                        style={{ width: `${Math.min(100, progressPercent)}%` }}
                      />
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <PrimaryButton
                      variant="gold"
                      size="md"
                      fullWidth
                      icon={<Zap className="w-4 h-4" />}
                      onClick={() => onSelectWorld(world.id)}
                    >
                      Enter
                    </PrimaryButton>
                  </div>
                </>
              )}

              {!isUnlocked && (
                <div className="text-center py-1">
                  <p className="text-[11px] text-[#6B85B0] leading-snug">
                    Clear {WORLDS[world.id - 2]?.minSongsToUnlock ?? 0} songs in {WORLDS[world.id - 2]?.name ?? 'prior world'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <footer className="mg-footer-bar shrink-0">
        <button type="button" onClick={onBack} className="mg-btn-back">
          ← Home
        </button>
      </footer>
    </div>
  );
}
