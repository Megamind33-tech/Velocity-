import React from 'react';
import {
  Music,
  User,
  Trophy,
  Dumbbell,
  Settings,
  Zap,
  Target,
  Play,
} from 'lucide-react';
import { PlayerProfile } from '../lib/profile';
import type { Screen } from '../App';

interface HomeScreenProps {
  profile: PlayerProfile | null;
  onNavigate: (screen: Screen) => void;
}

export function HomeScreen({ profile, onNavigate }: HomeScreenProps) {
  const xpPct = profile ? Math.min(100, (profile.xp / (profile.level * 1000)) * 100) : 0;

  return (
    <div className="game-screen mg-stage flex flex-col">
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />

      <header className="mg-topbar shrink-0">
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-xl -m-1 p-1 active:opacity-90"
        >
          <div className="relative shrink-0">
            <div
              className="mg-hex w-11 h-12 text-sm"
              style={{
                background: 'linear-gradient(145deg, #9b7fff, #43e7ff)',
                boxShadow: '0 0 22px rgba(125,92,255,0.55)',
              }}
            >
              {profile?.username?.[0]?.toUpperCase() ?? 'V'}
            </div>
            <span
              className="absolute -bottom-0.5 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-md"
              style={{ background: '#FFC94A', color: '#05060c' }}
            >
              {profile?.level ?? 1}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black text-[#F5F7FC] truncate tracking-tight">
              {profile?.username ?? 'Performer'}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#7A8399]">
              XP {profile?.xp?.toLocaleString() ?? 0}
            </div>
            <div className="xp-bar-track w-full max-w-[140px] mt-1.5 h-1.5">
              <div className="xp-bar-fill h-full rounded-full" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="mg-action-icon shrink-0 w-11 h-11 rounded-xl"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <div className="mg-scroll flex flex-col gap-5">
        <div className="text-center pt-2">
          <p className="mg-logo-tag mb-2">Vocal rhythm</p>
          <h1 className="mg-logo">Velocity</h1>
          <p className="text-xs text-[#A7B0C6] mt-3 max-w-[280px] mx-auto leading-relaxed">
            Worlds, songs, and levels — tap Play to enter the campaign.
          </p>
        </div>

        <div className="mg-panel">
          <div className="mg-panel-header flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            Campaign
          </div>
          <p className="mg-panel-body mb-4">
            Progress through vocal worlds, unlock tracks, and chase three-star clears.
          </p>
          <button type="button" className="mg-cta" onClick={() => onNavigate('world-select')}>
            <Play className="w-5 h-5 shrink-0" fill="currentColor" />
            Play
          </button>
        </div>

        <div className="mg-action-grid">
          {[
            { label: 'Train', icon: <Dumbbell className="w-5 h-5" />, screen: 'training' as Screen },
            { label: 'Profile', icon: <User className="w-5 h-5" />, screen: 'profile' as Screen },
            { label: 'Rank', icon: <Trophy className="w-5 h-5" />, screen: 'leaderboard' as Screen },
            { label: 'Audio', icon: <Music className="w-5 h-5" />, screen: 'settings' as Screen },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.screen)}
              className="mg-action-tile"
            >
              <span className="mg-action-icon">{item.icon}</span>
              <span className="mg-action-label">{item.label}</span>
            </button>
          ))}
        </div>

        {profile && profile.songsPlayed > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: profile.songsPlayed, l: 'Runs', c: '#43E7FF' },
              { v: profile.perfectGates, l: 'Perfect', c: '#B9FF66' },
              { v: profile.totalScore, l: 'Score', c: '#7D5CFF' },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.08)]"
                style={{ background: 'rgba(12,14,26,0.85)' }}
              >
                <div className="score-display text-lg font-black tabular-nums" style={{ color: s.c }}>
                  {s.v > 9999 ? `${(s.v / 1000).toFixed(1)}k` : s.v}
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-[#7A8399] mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {profile?.dailyChallenge && (
          <div className="mg-panel" style={{ animation: 'none', boxShadow: '0 12px 40px rgba(0,0,0,0.45)' }}>
            <div className="mg-panel-header flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5" />
                Daily op
              </span>
              {profile.dailyChallenge.completed && (
                <span className="text-[9px] font-black uppercase text-[#B9FF66]">Done</span>
              )}
            </div>
            <h3 className="font-display text-base font-black text-[#F5F7FC] mb-1">
              {profile.dailyChallenge.title}
            </h3>
            <p className="text-xs text-[#A7B0C6] mb-3">{profile.dailyChallenge.description}</p>
            <div className="xp-bar-track h-2">
              <div
                className="xp-bar-fill"
                style={{
                  width: `${Math.min(100, (profile.dailyChallenge.progress / profile.dailyChallenge.target) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-[#7A8399] mt-2">
              <span>
                {profile.dailyChallenge.progress} / {profile.dailyChallenge.target}
              </span>
              <span style={{ color: '#FFC94A' }}>+{profile.dailyChallenge.reward} XP</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
