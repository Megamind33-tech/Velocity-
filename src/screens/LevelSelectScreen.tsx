import React from 'react';
import { Play, Star, Eye, ChevronLeft } from 'lucide-react';
import { getLevelInfo } from '../lib/progression';
import { Song } from '../lib/songs-extended';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SecondaryButton } from '../components/ui/SecondaryButton';
import { IconButton } from '../components/ui/IconButton';

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

      <header className="mg-topbar shrink-0">
        <IconButton label="Back" variant="white" size="sm" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </IconButton>
        <div className="flex-1 min-w-0">
          <h1 className="mg-topbar-title !normal-case !tracking-tight !text-base text-white line-clamp-2">
            {song.title}
          </h1>
          <p className="mg-topbar-sub !normal-case !tracking-normal !text-xs !font-medium text-[#8BA0C8]">
            {song.artist}
          </p>
        </div>
      </header>

      <div className="mg-scroll space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#80c8ff] mb-1">Stage select</p>
        {Array.from({ length: maxLevelsInWorld }).map((_, index) => {
            const level = index + 1;
            const challenge = getLevelInfo(level);
            const progress = levelProgress[level];
            const stars = progress?.stars || 0;

            return (
              <div
                key={level}
                className="mg-panel !p-3 !animate-none hover:border-[rgba(100,180,255,0.45)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white"
                        style={{
                          background: 'linear-gradient(135deg, rgba(80,120,200,0.6), rgba(40,60,140,0.7))',
                          border: '1px solid rgba(100,180,255,0.3)',
                        }}
                      >
                        {level}
                      </div>
                      <div>
                        <h3 className="text-label font-black text-white">{challenge?.name}</h3>
                        <p className="text-caption text-[#6B85B0]">{challenge?.description}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-[52px]">
                      {stars > 0 && (
                        <div className="flex gap-1">
                          {[1, 2, 3].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= stars ? 'fill-[#FFC94A] text-[#FFC94A] mg-star' : 'text-[rgba(100,180,255,0.25)]'}`} />
                          ))}
                        </div>
                      )}
                      {progress?.score ? <span className="text-caption text-[#B9FF66] font-bold">{progress.score} pts</span> : null}
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs ml-3"
                    style={{
                      background: challenge?.difficultyStars
                        ? ['#B9FF66', '#FFC94A', '#FF6B6B', '#7D5CFF', '#43E7FF', '#FF4FC3'][Math.min(challenge.difficultyStars - 1, 5)]
                        : '#666',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
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
