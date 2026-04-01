import React, { useState } from 'react';
import { ArrowLeft, Edit2, Check, Target, Star, Zap, Music, Shield } from 'lucide-react';
import { PlayerProfile, saveProfile, Challenge } from '../lib/profile';
import { IconButton } from '../components/ui/IconButton';

interface ProfileScreenProps {
  profile: PlayerProfile | null;
  onBack: () => void;
  onProfileUpdate: (p: PlayerProfile) => void;
}

function ChallengeCard({ c, isDaily }: { c: Challenge; isDaily?: boolean; key?: React.Key }) {
  const pct = Math.min(100, (c.progress / c.target) * 100);
  return (
    <div
      className="p-4 rounded-2xl border"
      style={c.completed
        ? { background: 'rgba(185,255,102,0.05)', borderColor: 'rgba(185,255,102,0.18)' }
        : isDaily
          ? { background: 'rgba(255,79,195,0.05)', borderColor: 'rgba(255,79,195,0.18)' }
          : { background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }
      }
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {isDaily && (
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FF4FC3] mb-1">Daily</div>
          )}
          <div className={`text-sm font-black uppercase leading-tight ${c.completed ? 'text-[#B9FF66]' : 'text-[#F5F7FC]'}`}>
            {c.title}
          </div>
          <div className="text-xs text-[#4A5068] mt-0.5 leading-snug">{c.description}</div>
        </div>
        <div
          className="shrink-0 text-[10px] font-black px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(255,201,74,0.10)', color: '#FFC94A', border: '1px solid rgba(255,201,74,0.20)' }}
        >
          +{c.reward} XP
        </div>
      </div>
      <div className="progress-bar-track mt-2">
        <div
          className={c.completed ? 'progress-bar-fill-success' : 'progress-bar-fill-violet'}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-bold text-[#4A5068] mt-1.5">
        <span>Progress</span>
        <span className={c.completed ? 'text-[#B9FF66]' : 'text-[#A7B0C6]'}>{c.progress} / {c.target}</span>
      </div>
    </div>
  );
}

export function ProfileScreen({ profile, onBack, onProfileUpdate }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');

  if (!profile) return null;

  const xpPct = Math.min(100, (profile.xp / (profile.level * 1000)) * 100);
  const activeChallenges = profile.challenges.filter(c => !c.completed).slice(0, 10);
  const completedChallenges = profile.challenges.filter(c => c.completed);

  const saveUsername = () => {
    const updated = { ...profile, username: tempName.trim() || profile.username };
    onProfileUpdate(updated);
    saveProfile(updated);
    setIsEditing(false);
  };

  return (
    <div className="game-screen mg-stage mg-stage-violet flex flex-col">
      <div className="mg-kit-layer mg-kit-layer--account" aria-hidden />
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />
      <header className="mg-topbar shrink-0">
        <IconButton label="Back" variant="surface" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </IconButton>
        <div className="flex-1 min-w-0">
          <h2 className="mg-topbar-title !text-sm">Pilot card</h2>
          <p className="mg-topbar-sub !normal-case !tracking-normal !text-[11px] !font-medium text-[#A7B0C6]">
            Progress & challenges
          </p>
        </div>
      </header>

      <div className="mg-scroll space-y-4">

        {/* ── Identity card ── */}
        <div
          className="mt-4 rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid rgba(125,92,255,0.20)' }}
        >
          {/* BG glow */}
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(125,92,255,0.18), transparent 70%)' }}
          />

          <div className="flex items-center gap-5 relative">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black text-[#07090E]"
                style={{
                  background: 'linear-gradient(135deg, #7D5CFF, #43E7FF)',
                  boxShadow: '0 0 30px rgba(125,92,255,0.4)',
                }}
              >
                {profile.username[0]?.toUpperCase()}
              </div>
              <div
                className="absolute -bottom-1.5 -right-1.5 text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: '#FFC94A', color: '#07090E' }}
              >
                Lv{profile.level}
              </div>
            </div>

            {/* Name + XP */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    autoFocus
                    maxLength={15}
                    onKeyDown={e => { if (e.key === 'Enter') saveUsername(); }}
                    className="flex-1 bg-[#07090E] text-[#F5F7FC] px-3 py-2 rounded-xl border border-[rgba(125,92,255,0.4)] outline-none focus:border-[#7D5CFF] text-sm font-bold"
                  />
                  <button
                    onClick={saveUsername}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: '#7D5CFF', boxShadow: '0 0 12px rgba(125,92,255,0.5)' }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1 group">
                  <h3 className="font-display text-xl font-black text-[#F5F7FC] truncate">{profile.username}</h3>
                  <button
                    onClick={() => { setTempName(profile.username); setIsEditing(true); }}
                    className="text-[#4A5068] hover:text-[#7D5CFF] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5068] mb-2">
                Vocal Performer
              </div>
              {/* XP bar */}
              <div className="xp-bar-track w-full mb-1.5" />
              <div className="xp-bar-track w-full">
                <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-[#4A5068] mt-1">
                <span style={{ color: '#7D5CFF' }}>XP</span>
                <span>{profile.xp.toLocaleString()} / {(profile.level * 1000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Runs',    value: profile.songsPlayed,  icon: <Music className="w-4 h-4" />,  color: '#43E7FF' },
            { label: 'Perfects', value: profile.perfectGates, icon: <Star className="w-4 h-4" />,   color: '#FFC94A' },
            { label: 'Score',   value: profile.totalScore,   icon: <Zap className="w-4 h-4" />,    color: '#7D5CFF' },
          ].map(item => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <span style={{ color: item.color }}>{item.icon}</span>
              <span className="text-lg font-black text-[#F5F7FC] score-display">
                {item.value > 999 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#4A5068]">{item.label}</span>
            </div>
          ))}
        </div>

        {/* ── Daily challenge ── */}
        {profile.dailyChallenge && (
          <div>
            <SectionHeader icon={<Target className="w-4 h-4 text-[#FF4FC3]" />} label="Daily Mission" />
            <ChallengeCard c={profile.dailyChallenge} isDaily />
          </div>
        )}

        {/* ── Active challenges ── */}
        {activeChallenges.length > 0 && (
          <div>
            <SectionHeader icon={<Shield className="w-4 h-4 text-[#7D5CFF]" />} label="Active Challenges" />
            <div className="space-y-2">
              {activeChallenges.map(c => <ChallengeCard key={c.id} c={c} />)}
            </div>
          </div>
        )}

        {/* ── Completed highlights ── */}
        {completedChallenges.length > 0 && (
          <div>
            <SectionHeader icon={<Check className="w-4 h-4 text-[#B9FF66]" />} label={`Completed (${completedChallenges.length})`} />
            <div className="space-y-2">
              {completedChallenges.slice(0, 5).map(c => <ChallengeCard key={c.id} c={c} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[#A7B0C6]">{label}</span>
      <div className="flex-1 h-px bg-[rgba(255,255,255,0.05)]" />
    </div>
  );
}
