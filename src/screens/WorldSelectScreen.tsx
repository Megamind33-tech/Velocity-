import React from 'react';
import { Zap, Lock } from 'lucide-react';
import { WORLDS, canUnlockNextWorld } from '../lib/progression';
import { PrimaryButton } from '../components/ui/PrimaryButton';

interface WorldSelectScreenProps {
  unlockedWorlds: number[];
  currentWorldProgress: { [key: number]: number }; // songs beaten per world
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
    <div className="game-screen stage-bg flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-[var(--border-subtle)]">
        <h1 className="text-display-lg text-primary font-black mb-2">SELECT WORLD</h1>
        <p className="text-label text-secondary">Choose your vocal training level</p>
      </div>

      {/* World Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {WORLDS.map((world) => {
          const isUnlocked = unlockedWorlds.includes(world.id);
          const progress = currentWorldProgress[world.id] || 0;
          const progressPercent = (progress / world.minSongsToUnlock) * 100;

          const difficultyColors = {
            novice: '#B9FF66',
            intermediate: '#FFC94A',
            advanced: '#FF6B6B',
            master: '#7D5CFF',
            legend: '#43E7FF',
          };

          return (
            <div
              key={world.id}
              className={`p-4 rounded-2xl border-2 transition-all ${
                isUnlocked
                  ? 'border-[var(--border-primary)] bg-gradient-to-r from-[rgba(67,231,255,0.08)] to-transparent cursor-pointer hover:border-[var(--color-primary)]'
                  : 'border-[var(--border-subtle)] bg-[rgba(0,0,0,0.3)] opacity-60'
              }`}
              onClick={() => isUnlocked && onSelectWorld(world.id)}
            >
              {/* World Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-headline font-black text-primary">{world.name}</h2>
                    {!isUnlocked && <Lock className="w-4 h-4 text-[var(--color-danger)]" />}
                  </div>
                  <p className="text-caption text-secondary">{world.description}</p>
                </div>

                {/* World Number Badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center ml-4 font-black text-lg text-white"
                  style={{
                    background: `linear-gradient(135deg, ${difficultyColors[world.difficulty]}, ${difficultyColors[world.difficulty]}99)`,
                    boxShadow: `0 0 16px ${difficultyColors[world.difficulty]}40`,
                  }}
                >
                  W{world.id}
                </div>
              </div>

              {/* World Stats */}
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-[rgba(67,231,255,0.1)] rounded-lg p-2">
                  <div className="text-label text-tertiary">Songs</div>
                  <div className="text-title font-black text-primary">{world.totalSongs}</div>
                </div>
                <div className="bg-[rgba(125,92,255,0.1)] rounded-lg p-2">
                  <div className="text-label text-tertiary">Levels</div>
                  <div className="text-title font-black text-secondary">
                    {world.totalSongs * world.levelsPerSong}
                  </div>
                </div>
                <div className="bg-[rgba(185,255,102,0.1)] rounded-lg p-2">
                  <div className="text-label text-tertiary">Difficulty</div>
                  <div className="text-title font-black text-success capitalize">{world.difficulty}</div>
                </div>
              </div>

              {/* Progress Bar */}
              {isUnlocked && (
                <>
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-caption text-secondary">Progress to next world</span>
                      <span className="text-caption font-bold text-primary">
                        {progress}/{world.minSongsToUnlock}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--bg-surface-elevated)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#43E7FF] to-[#7D5CFF] transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Play Button */}
                  <PrimaryButton
                    variant="cyan"
                    size="md"
                    fullWidth
                    icon={<Zap className="w-4 h-4" />}
                    onClick={() => onSelectWorld(world.id)}
                  >
                    Enter World
                  </PrimaryButton>
                </>
              )}

              {/* Locked State */}
              {!isUnlocked && (
                <div className="text-center py-2">
                  <p className="text-caption text-tertiary mb-1">
                    Beat {WORLDS[world.id - 2]?.minSongsToUnlock || 0} songs in {WORLDS[world.id - 2]?.name || ''} to unlock
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl border border-[var(--border-default)] text-secondary hover:bg-[var(--bg-surface-elevated)] transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
