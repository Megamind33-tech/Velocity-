import React, { useState } from 'react';
import { ChevronLeft, Trophy, Crown } from 'lucide-react';
import { PlayerProfile } from '../lib/profile';
import { IconButton } from '../components/ui/IconButton';

interface LeaderboardScreenProps {
  profile: PlayerProfile | null;
  onBack: () => void;
}

type Category = 'global' | 'weekly' | 'personal';

const MOCK_GLOBAL = [
  { name: 'SoundWave',   score: 145020, level: 42 },
  { name: 'PitchMaster', score: 132400, level: 38 },
  { name: 'VocalForce',  score: 128900, level: 40 },
  { name: 'HarmonyX',   score: 115000, level: 35 },
  { name: 'RhythmPro',  score: 108500, level: 31 },
  { name: 'NoteHunter', score: 97200,  level: 28 },
  { name: 'MelodyDrift', score: 88600, level: 25 },
];

const MOCK_WEEKLY = [
  { name: 'PitchMaster', score: 48200, level: 38 },
  { name: 'SoundWave',   score: 41900, level: 42 },
  { name: 'HarmonyX',   score: 39100, level: 35 },
  { name: 'RhythmPro',  score: 33000, level: 31 },
];

const CATEGORY_TABS: { key: Category; label: string }[] = [
  { key: 'global',   label: 'Global' },
  { key: 'weekly',   label: 'Weekly' },
  { key: 'personal', label: 'Personal' },
];

export function LeaderboardScreen({ profile, onBack }: LeaderboardScreenProps) {
  const [category, setCategory] = useState<Category>('global');

  const playerEntry = {
    name: profile?.username ?? 'You',
    score: profile?.totalScore ?? 0,
    level: profile?.level ?? 1,
    isYou: true,
  };

  const getEntries = () => {
    if (category === 'personal') {
      const highScores = profile?.highScores ?? {};
      return Object.entries(highScores)
        .map(([key, score]) => {
          const [songId, diff] = key.split('_');
          return { songId, diff, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    }
    const mock = category === 'weekly' ? MOCK_WEEKLY : MOCK_GLOBAL;
    const all = [...mock, playerEntry].sort((a, b) => b.score - a.score);
    return all;
  };

  const entries = getEntries();

  const rankColors = ['#FFD700', '#C0C8D8', '#CD7F32'];

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
          <h2 className="mg-topbar-title !text-sm">Rankings</h2>
          <p className="mg-topbar-sub !normal-case !tracking-normal !text-[11px] !font-medium text-[#8BA0C8]">
            Global · Weekly · Personal
          </p>
        </div>
        <Trophy className="w-7 h-7 text-[#FFC94A] shrink-0" style={{ filter: 'drop-shadow(0 0 8px rgba(255,201,74,0.5))' }} />
      </header>

      {/* Tab bar */}
      <div className="relative z-[3] flex gap-1.5 px-4 py-3 shrink-0 border-b border-[rgba(80,160,255,0.15)] bg-[rgba(10,15,50,0.6)] backdrop-blur-md">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setCategory(tab.key)}
            className="flex-1 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95"
            style={category === tab.key
              ? { background: 'linear-gradient(180deg, #FFE566, #FFBF00)', color: '#3D2000', border: 'none', boxShadow: '0 3px 0 #8B6508, 0 4px 12px rgba(255,191,0,0.3)' }
              : { background: 'rgba(30,60,140,0.25)', color: '#6B85B0', border: '1.5px solid rgba(100,180,255,0.18)' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mg-scroll !pt-3">

        {/* Personal bests */}
        {category === 'personal' && (
          <>
            {(entries as { songId: string; diff: string; score: number }[]).length === 0 ? (
              <div className="text-center py-16 text-[#6B85B0]">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">No scores yet.</p>
                <p className="text-xs mt-1">Play some songs to see your best scores here.</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid rgba(100,180,255,0.18)' }}>
                {(entries as { songId: string; diff: string; score: number }[]).map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center px-4 py-3.5 border-b last:border-0"
                    style={{
                      borderColor: 'rgba(80,160,255,0.1)',
                      background: i % 2 === 0 ? 'rgba(30,60,140,0.2)' : 'transparent',
                    }}
                  >
                    <div className="text-sm font-black text-[#6B85B0] w-6">{i + 1}</div>
                    <div className="flex-1 ml-3 min-w-0">
                      <div className="text-sm font-bold text-white capitalize truncate">{e.songId.replace(/_/g, ' ')}</div>
                      <div className="text-[10px] text-[#6B85B0] uppercase font-bold tracking-wider">{e.diff}</div>
                    </div>
                    <div className="font-mono font-black text-lg text-[#43E7FF] score-display">{e.score.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Global / weekly */}
        {category !== 'personal' && (
          <>
            {/* Podium */}
            {(entries as { name: string; score: number; level: number; isYou?: boolean }[]).length >= 3 && (
              <div className="flex items-end justify-center gap-3 pt-4 pb-6">
                {[1, 0, 2].map(idx => {
                  const entry = (entries as { name: string; score: number; level: number; isYou?: boolean }[])[idx];
                  if (!entry) return null;
                  const isFirst = idx === 0;
                  const color = rankColors[idx];
                  return (
                    <div key={idx} className={`flex flex-col items-center ${isFirst ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}>
                      {isFirst && <Crown className="w-5 h-5 mb-1" style={{ color, filter: `drop-shadow(0 0 6px ${color}88)` }} />}
                      <div
                        className="rounded-2xl flex items-center justify-center font-black text-base"
                        style={{
                          width: isFirst ? 60 : 48,
                          height: isFirst ? 60 : 48,
                          background: `linear-gradient(135deg, ${color}, ${color}99)`,
                          boxShadow: `0 4px 0 rgba(0,0,0,0.2), 0 0 20px ${color}66`,
                          color: '#0B0E2A',
                          fontSize: isFirst ? 22 : 18,
                        }}
                      >
                        {entry.name[0]?.toUpperCase()}
                      </div>
                      <div className={`font-black text-xs mt-2 text-center max-w-[72px] truncate ${entry.isYou ? 'text-[#43E7FF]' : 'text-white'}`}>
                        {entry.name}
                      </div>
                      <div className="font-mono text-sm font-black score-display" style={{ color }}>
                        {entry.score.toLocaleString()}
                      </div>
                      <div
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                        style={{ background: `${color}cc`, color: '#0B0E2A' }}
                      >
                        #{idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid rgba(100,180,255,0.18)' }}>
              {(entries as { name: string; score: number; level: number; isYou?: boolean }[]).map((entry, i) => {
                const isTop3 = i < 3;
                return (
                  <div
                    key={i}
                    className="flex items-center px-4 py-4 border-b last:border-0 transition-colors"
                    style={{
                      borderColor: 'rgba(80,160,255,0.1)',
                      background: entry.isYou
                        ? 'rgba(67,231,255,0.08)'
                        : i % 2 === 0 ? 'rgba(30,60,140,0.2)' : 'transparent',
                      borderLeft: entry.isYou ? '2px solid rgba(67,231,255,0.5)' : undefined,
                    }}
                  >
                    <div
                      className="w-8 text-center font-black text-base"
                      style={{
                        color: isTop3 ? rankColors[i] : '#6B85B0',
                        textShadow: isTop3 ? `0 0 8px ${rankColors[i]}88` : 'none',
                      }}
                    >
                      {i + 1}
                    </div>

                    <div className="flex-1 ml-3 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${entry.isYou ? 'text-[#43E7FF]' : 'text-white'}`}>
                          {entry.name}
                        </span>
                        {entry.isYou && (
                          <span
                            className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(67,231,255,0.15)', color: '#43E7FF', border: '1px solid rgba(67,231,255,0.3)' }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#6B85B0] font-bold uppercase tracking-wider">
                        Lv {entry.level}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className="font-mono font-black text-lg score-display"
                        style={{ color: entry.isYou ? '#43E7FF' : '#FFFFFF' }}
                      >
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-[#6B85B0] font-bold uppercase tracking-wider">pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
