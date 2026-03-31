import React from 'react';
import {
  Mic, Music, User, Trophy, Dumbbell, Settings, ChevronRight, Zap, Star, Target, Play
} from 'lucide-react';
import { SONGS } from '../lib/songs';
import { BACKGROUND_MUSIC } from '../lib/backgroundMusic';
import { PlayerProfile } from '../lib/profile';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { IconButton } from '../components/ui/IconButton';
import type { Screen } from '../App';

interface HomeScreenProps {
  profile: PlayerProfile | null;
  selectedSongId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  selectedBackgroundMusicId: string;
  error: string;
  onPlay: () => void;
  onNavigate: (screen: Screen) => void;
  onDifficultyChange: (d: 'easy' | 'medium' | 'hard') => void;
  onClearError: () => void;
}

const DIFF_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const DIFF_COLORS = {
  easy:   { text: '#B9FF66', bg: 'rgba(185,255,102,0.10)', border: 'rgba(185,255,102,0.25)' },
  medium: { text: '#FFC94A', bg: 'rgba(255,201,74,0.10)',  border: 'rgba(255,201,74,0.25)' },
  hard:   { text: '#FF6B6B', bg: 'rgba(255,107,107,0.10)', border: 'rgba(255,107,107,0.25)' },
};

export function HomeScreen({
  profile,
  selectedSongId,
  difficulty,
  selectedBackgroundMusicId,
  error,
  onPlay,
  onNavigate,
  onDifficultyChange,
  onClearError,
}: HomeScreenProps) {
  const selectedSong = SONGS.find(s => s.id === selectedSongId);
  const effectiveDiff = selectedSong ? selectedSong.difficulty : difficulty;
  const diffColor = DIFF_COLORS[effectiveDiff];
  const selectedMusic = BACKGROUND_MUSIC.find(m => m.id === selectedBackgroundMusicId);
  const xpPct = profile ? Math.min(100, (profile.xp / (profile.level * 1000)) * 100) : 0;
  const bestScore = profile && selectedSong
    ? profile.highScores[`${selectedSong.id}_${effectiveDiff}`] ?? 0
    : 0;

  return (
    <div className="game-screen stage-bg flex flex-col">
      {/* ── Top Status Strip ── */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0">
        {/* Avatar + level */}
        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7D5CFF] to-[#43E7FF] flex items-center justify-center text-sm font-black text-[#07090E] shadow-[0_0_14px_rgba(125,92,255,0.4)]">
              {profile?.username?.[0]?.toUpperCase() ?? 'V'}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#FFC94A] text-[#07090E] text-[9px] font-black px-1.5 rounded-full leading-4 shadow-sm">
              {profile?.level ?? 1}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-[#F5F7FC] truncate leading-none mb-1">
              {profile?.username ?? 'Performer'}
            </div>
            <div className="xp-bar-track w-20">
              <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Settings */}
        <IconButton label="Settings" variant="surface" onClick={() => onNavigate('settings')}>
          <Settings className="w-4 h-4" />
        </IconButton>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mx-4 mb-2 px-4 py-3 rounded-xl bg-[rgba(255,107,107,0.10)] border border-[rgba(255,107,107,0.25)] flex items-center gap-3 anim-slide-down">
          <Zap className="w-4 h-4 text-[#FF6B6B] shrink-0" />
          <p className="text-xs text-[#FF6B6B] flex-1 leading-snug">{error}</p>
          <button onClick={onClearError} className="text-[#4A5068] hover:text-[#A7B0C6] p-1">
            ✕
          </button>
        </div>
      )}

      {/* ── Scrollable Body ── */}
      <div className="game-screen-scroll px-4 pb-4">

        {/* ── App wordmark ── */}
        <div className="pt-2 pb-5">
          <h1 className="font-display text-3xl font-black uppercase italic tracking-tighter text-[#F5F7FC] leading-none">
            VELOCITY
            <span
              className="ml-2 text-[#43E7FF]"
              style={{ textShadow: '0 0 18px rgba(67,231,255,0.6)' }}
            >
              //
            </span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#4A5068] mt-1">
            Vocal Performance Challenge
          </p>
        </div>

        {/* ── Hero Song Card ── */}
        <div className="surface-cyan p-4 mb-4 relative overflow-hidden">
          {/* Decorative glow orb */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(67,231,255,0.12) 0%, transparent 70%)' }}
          />

          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5068] mb-1">Now Selected</div>
              <h2 className="text-xl font-black text-[#F5F7FC] leading-tight truncate font-display">
                {selectedSong?.title ?? 'Endless Run'}
              </h2>
              <p className="text-sm text-[#A7B0C6] mt-0.5">
                {selectedSong
                  ? `${selectedSong.artist} · ${selectedSong.tempo} BPM`
                  : 'Procedural · No lyrics'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('song-select')}
              className="shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#43E7FF] bg-[rgba(67,231,255,0.10)] border border-[rgba(67,231,255,0.20)] px-3 py-2 rounded-lg hover:bg-[rgba(67,231,255,0.18)] transition-colors"
            >
              Change <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Difficulty row + best score */}
          <div className="flex items-center gap-3">
            {/* Difficulty selector (hidden when song locked to diff) */}
            {!selectedSong ? (
              <div className="flex gap-1.5">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => onDifficultyChange(d)}
                    className="diff-badge transition-all active:scale-95"
                    style={difficulty === d
                      ? { background: DIFF_COLORS[d].bg, color: DIFF_COLORS[d].text, border: `1px solid ${DIFF_COLORS[d].border}` }
                      : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }
                    }
                  >
                    {DIFF_LABELS[d]}
                  </button>
                ))}
              </div>
            ) : (
              <span
                className="diff-badge"
                style={{ background: diffColor.bg, color: diffColor.text, border: `1px solid ${diffColor.border}` }}
              >
                {DIFF_LABELS[effectiveDiff]}
              </span>
            )}

            {bestScore > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-[#A7B0C6] font-bold ml-auto">
                <Star className="w-3 h-3 text-[#FFC94A]" />
                Best: <span className="text-[#F5F7FC] font-black score-display">{bestScore.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* BG music indicator */}
          {selectedMusic && (
            <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-2">
              <Music className="w-3 h-3 text-[#7D5CFF] shrink-0" />
              <span className="text-[11px] text-[#A7B0C6] truncate">{selectedMusic.title}</span>
            </div>
          )}
        </div>

        {/* ── PLAY CTA ── */}
        <PrimaryButton
          variant="cyan"
          size="lg"
          fullWidth
          onClick={onPlay}
          icon={<Mic className="w-5 h-5" />}
          className="mb-5 font-display text-xl tracking-widest"
        >
          Play Now
        </PrimaryButton>

        {/* ── Mode shortcuts ── */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Train',    icon: <Dumbbell className="w-5 h-5" />,  screen: 'training' as Screen,    color: '#7D5CFF', bg: 'rgba(125,92,255,0.10)', border: 'rgba(125,92,255,0.20)' },
            { label: 'Profile',  icon: <User className="w-5 h-5" />,      screen: 'profile' as Screen,     color: '#43E7FF', bg: 'rgba(67,231,255,0.08)',  border: 'rgba(67,231,255,0.18)' },
            { label: 'Rank',     icon: <Trophy className="w-5 h-5" />,    screen: 'leaderboard' as Screen, color: '#FFC94A', bg: 'rgba(255,201,74,0.08)',  border: 'rgba(255,201,74,0.18)' },
            { label: 'Settings', icon: <Settings className="w-5 h-5" />, screen: 'settings' as Screen,    color: '#A7B0C6', bg: 'rgba(167,176,198,0.06)', border: 'rgba(167,176,198,0.14)' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.screen)}
              className="flex flex-col items-center gap-2 py-3 rounded-xl border transition-all active:scale-95"
              style={{ background: item.bg, borderColor: item.border, color: item.color }}
            >
              {item.icon}
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: item.color }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Daily Mission ── */}
        {profile?.dailyChallenge && (
          <div className="surface p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-[#FF4FC3]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF4FC3]">Daily Mission</span>
              {profile.dailyChallenge.completed && (
                <span className="ml-auto text-[10px] font-black text-[#B9FF66] uppercase">Done ✓</span>
              )}
            </div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="text-sm font-black text-[#F5F7FC] uppercase">{profile.dailyChallenge.title}</div>
                <div className="text-xs text-[#A7B0C6] mt-0.5">{profile.dailyChallenge.description}</div>
              </div>
              <div className="shrink-0 text-[10px] font-black text-[#FFC94A] bg-[rgba(255,201,74,0.10)] border border-[rgba(255,201,74,0.20)] px-2.5 py-1 rounded-lg">
                +{profile.dailyChallenge.reward} XP
              </div>
            </div>
            <div className="progress-bar-track">
              <div
                className={profile.dailyChallenge.completed ? 'progress-bar-fill-success' : 'progress-bar-fill-cyan'}
                style={{ width: `${Math.min(100, (profile.dailyChallenge.progress / profile.dailyChallenge.target) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-[#4A5068] mt-1.5">
              <span>Progress</span>
              <span>{profile.dailyChallenge.progress} / {profile.dailyChallenge.target}</span>
            </div>
          </div>
        )}

        {/* ── Recent stats strip ── */}
        {profile && profile.songsPlayed > 0 && (
          <div className="flex gap-3 mt-3">
            <div className="stat-chip flex-1">
              <span className="text-base font-black text-[#F5F7FC] score-display">{profile.songsPlayed}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#4A5068]">Plays</span>
            </div>
            <div className="stat-chip flex-1">
              <span className="text-base font-black text-[#43E7FF] score-display">{profile.perfectGates}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#4A5068]">Perfects</span>
            </div>
            <div className="stat-chip flex-1">
              <span className="text-base font-black text-[#7D5CFF] score-display">{profile.totalScore.toLocaleString()}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#4A5068]">Total XP</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
