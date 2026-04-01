import React from 'react';
import { Play, Star, Eye } from 'lucide-react';
import { getLevelInfo } from '../lib/progression';
import { Song } from '../lib/songs-extended';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SecondaryButton } from '../components/ui/SecondaryButton';

interface LevelSelectScreenProps {
  song: Song;
  worldId: number;
  levelProgress: { [key: number]: { stars: number; score: number } };
  onSelectLevel: (level: number, mode: 'A' | 'C') => void;
  onDemoLevel?: (level: number, mode: 'A' | 'C') => void;
  onBack: () => void;
}

export function LevelSelectScreen({
  song, worldId, levelProgress, onSelectLevel, onDemoLevel, onBack,
}: LevelSelectScreenProps) {
  const maxLevelsInWorld = [10, 15, 15, 18, 20][worldId - 1];

  return (
    <div className="game-screen mg-stage flex flex-col">
      <div className="mg-kit-layer mg-kit-layer--stage" aria-hidden />
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />
      <header className="mg-topbar shrink-0 flex-col items-stretch !gap-1">
        <h1 className="mg-topbar-title !normal-case !tracking-tight !text-base text-[#F5F7FC] line-clamp-2">
          {song.title}
        </h1>
        <p className="mg-topbar-sub !normal-case !tracking-normal !text-xs !font-medium text-[#A7B0C6]">
          {song.artist}
        </p>
      </header>

      <div className="mg-scroll space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#43E7FF] mb-1">Stage select</p>
        {Array.from({ length: maxLevelsInWorld }).map((_, index) => {
            const level = index + 1;
            const challenge = getLevelInfo(level);
            const progress = levelProgress[level];
            const stars = progress?.stars || 0;

            return (
              <div
                key={level}
                className="mg-panel !p-3 !animate-none hover:border-[rgba(125,92,255,0.4)] transition-colors"
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

                    <div className="flex gap-2 ml-[52px]">
                      {stars > 0 && (
                        <div className="flex gap-1">
                          {[1, 2, 3].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= stars ? 'fill-[#FFC94A] text-[#FFC94A]' : 'text-[var(--border-default)]'}`} />
                          ))}
                        </div>
                      )}
                      {progress?.score ? <span className="text-caption text-success font-bold">{progress.score} pts</span> : null}
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs ml-3"
                    style={{
                      background: challenge?.difficultyStars
                        ? ['#B9FF66', '#FFC94A', '#FF6B6B', '#7D5CFF', '#43E7FF', '#FF4FC3'][Math.min(challenge.difficultyStars - 1, 5)]
                        : '#666',
                    }}
                  >
                    {challenge?.difficultyStars}★
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  {(level <= 10 || worldId === 1) && (
                    <PrimaryButton variant="cyan" size="sm" fullWidth icon={<Play className="w-3 h-3" />} onClick={() => onSelectLevel(level, 'A')}>
                      Mode A
                    </PrimaryButton>
                  )}
                  {level > 10 && worldId > 1 && (
                    <PrimaryButton variant="violet" size="sm" fullWidth icon={<Play className="w-3 h-3" />} onClick={() => onSelectLevel(level, 'C')}>
                      Mode C
                    </PrimaryButton>
                  )}
                  {onDemoLevel && (
                    <SecondaryButton variant="default" size="sm" fullWidth icon={<Eye className="w-3 h-3" />} onClick={() => onDemoLevel(level, level > 10 && worldId > 1 ? 'C' : 'A')}>
                      Demo
                    </SecondaryButton>
                  )}
                </div>
              </div>
            );
        })}
      </div>

      <footer className="mg-footer-bar shrink-0">
        <button type="button" onClick={onBack} className="mg-btn-back">
          ← Songs
        </button>
      </footer>
    </div>
  );
}
