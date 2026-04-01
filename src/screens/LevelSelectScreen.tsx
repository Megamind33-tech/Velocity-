import React from 'react';
import { Play, Lock, Star } from 'lucide-react';
import { LEVEL_CHALLENGES, getLevelInfo } from '../lib/progression';
import { Song } from '../lib/songs-extended';
import { PrimaryButton } from '../components/ui/PrimaryButton';

interface LevelSelectScreenProps {
  song: Song;
  worldId: number;
  levelProgress: { [key: number]: { stars: number; score: number } };
  onSelectLevel: (level: number, mode: 'A' | 'C') => void;
  onBack: () => void;
}

export function LevelSelectScreen({
  song,
  worldId,
  levelProgress,
  onSelectLevel,
  onBack,
}: LevelSelectScreenProps) {
  const maxLevelsInWorld = [10, 15, 15, 18, 20][worldId - 1];

  return (
    <div className="game-screen stage-bg flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-[var(--border-subtle)]">
        <h1 className="text-display-lg text-primary font-black mb-1">{song.title}</h1>
        <p className="text-label text-secondary">{song.artist}</p>
      </div>

      {/* Levels Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          {Array.from({ length: maxLevelsInWorld }).map((_, index) => {
            const level = index + 1;
            const challenge = getLevelInfo(level);
            const progress = levelProgress[level];
            const stars = progress?.stars || 0;

            return (
              <div
                key={level}
                className="card-accent-secondary hover:border-[var(--color-secondary)] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#7D5CFF] to-[#5B4CB8] rounded-lg flex items-center justify-center font-black text-white">
                        {level}
                      </div>
                      <div>
                        <h3 className="text-label font-black text-secondary">{challenge?.name}</h3>
                        <p className="text-caption text-tertiary">{challenge?.description}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-13">
                      {stars > 0 && (
                        <div className="flex gap-1">
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
                      )}
                      {progress?.score && (
                        <span className="text-caption text-success font-bold">{progress.score} pts</span>
                      )}
                    </div>
                  </div>

                  {/* Difficulty Indicator */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs ml-3"
                    style={{
                      background: challenge?.difficultyStars
                        ? ['#B9FF66', '#FFC94A', '#FF6B6B', '#7D5CFF', '#43E7FF', '#FF4FC3'][
                            Math.min(challenge.difficultyStars - 1, 5)
                          ]
                        : '#666',
                    }}
                  >
                    {challenge?.difficultyStars}★
                  </div>
                </div>

                {/* Mode Selection */}
                <div className="flex gap-2 mt-3">
                  {(level <= 10 || worldId === 1) && (
                    <PrimaryButton
                      variant="cyan"
                      size="sm"
                      fullWidth
                      icon={<Play className="w-3 h-3" />}
                      onClick={() => onSelectLevel(level, 'A')}
                    >
                      Mode A
                    </PrimaryButton>
                  )}
                  {level > 10 && worldId > 1 && (
                    <PrimaryButton
                      variant="violet"
                      size="sm"
                      fullWidth
                      icon={<Play className="w-3 h-3" />}
                      onClick={() => onSelectLevel(level, 'C')}
                    >
                      Mode C
                    </PrimaryButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl border border-[var(--border-default)] text-secondary hover:bg-[var(--bg-surface-elevated)] transition-all"
        >
          Back to Songs
        </button>
      </div>
    </div>
  );
}
