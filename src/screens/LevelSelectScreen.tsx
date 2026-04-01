import React from 'react';
import { Play, Star, Eye } from 'lucide-react';
import { getLevelInfo } from '../lib/progression';
import { Song } from '../lib/songs-extended';
import type { PlayerProfile } from '../lib/profile';
import type { Screen } from '../App';
import {
  FantasyGameShell,
  mapFantasyNavToScreen,
  type FantasyNavKey,
} from '../components/layout/FantasyGameShell';

interface LevelSelectScreenProps {
  profile: PlayerProfile | null;
  song: Song;
  worldId: number;
  levelProgress: { [key: number]: { stars: number; score: number } };
  onSelectLevel: (level: number, mode: 'A' | 'C') => void;
  onDemoLevel?: (level: number, mode: 'A' | 'C') => void;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export function LevelSelectScreen({
  profile,
  song,
  worldId,
  levelProgress,
  onSelectLevel,
  onDemoLevel,
  onBack,
  onNavigate,
}: LevelSelectScreenProps) {
  const maxLevelsInWorld = [10, 15, 15, 18, 20][worldId - 1];

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
        <h1 className="fl-screen-title !normal-case !tracking-tight !text-base text-[#fff8e8] line-clamp-2">
          {song.title}
        </h1>
        <p className="text-xs text-[rgba(220,210,245,0.7)] mt-1">{song.artist}</p>
      </div>

      <div className="fl-scroll !pt-2 space-y-3">
        <p className="fl-card-title !mb-0">Stage select</p>
        {Array.from({ length: maxLevelsInWorld }).map((_, index) => {
          const level = index + 1;
          const challenge = getLevelInfo(level);
          const progress = levelProgress[level];
          const stars = progress?.stars || 0;

          return (
            <div key={level} className="fl-card">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-[#0d0618] shrink-0"
                      style={{
                        background: 'linear-gradient(145deg, #c9a227, #8b6914)',
                        boxShadow: '0 0 14px rgba(201,162,39,0.35)',
                      }}
                    >
                      {level}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#fff8e8]">{challenge?.name}</h3>
                      <p className="text-[11px] text-[rgba(220,210,245,0.6)] leading-snug">
                        {challenge?.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 ml-[52px] items-center">
                    {stars > 0 && (
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= stars ? 'fill-[#f0d78c] text-[#f0d78c]' : 'text-[rgba(255,255,255,0.12)]'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {progress?.score ? (
                      <span className="text-[10px] font-bold text-[#4ade80]">{progress.score} pts</span>
                    ) : null}
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                  style={{
                    background: challenge?.difficultyStars
                      ? ['#4ade80', '#f0d78c', '#f87171', '#a78bfa', '#38bdf8', '#f472b6'][
                          Math.min(challenge.difficultyStars - 1, 5)
                        ]
                      : '#555',
                  }}
                >
                  {challenge?.difficultyStars}★
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-3">
                <div className="flex gap-2">
                  {(level <= 10 || worldId === 1) && (
                    <button
                      type="button"
                      className="fl-play-btn fl-play-btn--compact flex-1 flex items-center justify-center gap-1.5"
                      onClick={() => onSelectLevel(level, 'A')}
                    >
                      <Play className="w-3.5 h-3.5 shrink-0" />
                      Mode A
                    </button>
                  )}
                  {level > 10 && worldId > 1 && (
                    <button
                      type="button"
                      className="fl-play-btn fl-play-btn--compact flex-1 flex items-center justify-center gap-1.5"
                      style={{
                        background: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 40%, #5b21b6 100%)',
                        boxShadow: '0 5px 0 #4c1d95, 0 10px 28px rgba(124,58,237,0.4), inset 0 2px 0 rgba(255,255,255,0.25)',
                        color: '#fff',
                      }}
                      onClick={() => onSelectLevel(level, 'C')}
                    >
                      <Play className="w-3.5 h-3.5 shrink-0" />
                      Mode C
                    </button>
                  )}
                </div>
                {onDemoLevel && (
                  <button
                    type="button"
                    className="fl-btn-outline flex items-center justify-center gap-2"
                    onClick={() => onDemoLevel(level, level > 10 && worldId > 1 ? 'C' : 'A')}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Demo
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fl-back-bar">
        <button type="button" className="fl-back-btn" onClick={onBack}>
          ← Songs
        </button>
      </div>
    </FantasyGameShell>
  );
}
