import React from 'react';
import { Crown, Target } from 'lucide-react';
import { PlayerProfile } from '../lib/profile';
import type { Screen } from '../App';
import {
  FantasyGameShell,
  mapFantasyNavToScreen,
  type FantasyNavKey,
} from '../components/layout/FantasyGameShell';

interface HomeScreenProps {
  profile: PlayerProfile | null;
  onNavigate: (screen: Screen) => void;
}

export function HomeScreen({ profile, onNavigate }: HomeScreenProps) {
  const xpPct = profile ? Math.min(100, (profile.xp / (profile.level * 1000)) * 100) : 0;

  const handleNav = (key: FantasyNavKey) => {
    if (key === 'play') {
      onNavigate('world-select');
      return;
    }
    onNavigate(mapFantasyNavToScreen(key));
  };

  return (
    <FantasyGameShell
      profile={profile}
      activeNav="play"
      onNav={handleNav}
      onOpenSettings={() => onNavigate('settings')}
    >
      <div className="fl-scroll">
        <div className="fl-level-panel">
          <div className="fl-panel-crest" aria-hidden>
            <Crown className="w-7 h-7 text-[#f0d78c]" strokeWidth={1.8} />
          </div>
          <h1 className="fl-panel-title">Velocity</h1>
          <p className="fl-panel-sub">
            Worlds, songs, and levels — enter the campaign and chase three-star clears across every track.
          </p>
          <button type="button" className="fl-play-btn" onClick={() => onNavigate('world-select')}>
            Play
          </button>
        </div>

        {profile && (
          <div className="fl-card mb-4">
            <div className="fl-card-title">Pilot</div>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-sm text-[#0d0618]"
                style={{
                  background: 'linear-gradient(145deg, #c9a227, #8b6914)',
                  boxShadow: '0 0 20px rgba(201,162,39,0.35)',
                }}
              >
                {profile.username?.[0]?.toUpperCase() ?? 'V'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[#fff8e8] truncate">{profile.username ?? 'Performer'}</div>
                <div className="text-[11px] text-[rgba(220,210,245,0.65)] mt-0.5">
                  Level {profile.level} · {profile.xp.toLocaleString()} XP
                </div>
                <div
                  className="mt-2 h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,215,120,0.2)' }}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${xpPct}%`,
                      background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                      boxShadow: '0 0 10px rgba(74,222,128,0.5)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {profile?.dailyChallenge && (
          <div className="fl-card">
            <div className="fl-card-title flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-[#f0d78c]" />
              Daily quest
            </div>
            <h3 className="font-semibold text-[#fff8e8] text-sm mb-1">{profile.dailyChallenge.title}</h3>
            <p className="text-xs text-[rgba(220,210,245,0.7)] mb-3 leading-relaxed">
              {profile.dailyChallenge.description}
            </p>
            {profile.dailyChallenge.completed ? (
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#4ade80]">Completed</p>
            ) : (
              <>
                <div
                  className="h-2 rounded-full overflow-hidden mb-2"
                  style={{ background: 'rgba(0,0,0,0.35)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (profile.dailyChallenge.progress / profile.dailyChallenge.target) * 100,
                      )}%`,
                      background: 'linear-gradient(90deg, #a78bfa, #c4b5fd)',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[rgba(220,210,245,0.65)]">
                  <span>
                    {profile.dailyChallenge.progress} / {profile.dailyChallenge.target}
                  </span>
                  <span className="text-[#f0d78c] font-bold">+{profile.dailyChallenge.reward} XP</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </FantasyGameShell>
  );
}
