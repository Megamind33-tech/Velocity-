import React from 'react';
import {
  Mic, Music, User, Trophy, Dumbbell, Settings, ChevronRight, Zap, Star, Target
} from 'lucide-react';
import { SONGS } from '../lib/songs';
import { BACKGROUND_MUSIC } from '../lib/backgroundMusic';
import { PlayerProfile } from '../lib/profile';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { IconButton } from '../components/ui/IconButton';
import { SongCard } from '../components/ui/SongCard';
import { ScoreDisplay } from '../components/ui/ScoreDisplay';
import { StatBar } from '../components/ui/StatBar';
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
  const selectedMusic = BACKGROUND_MUSIC.find(m => m.id === selectedBackgroundMusicId);
  const xpPct = profile ? Math.min(100, (profile.xp / (profile.level * 1000)) * 100) : 0;
  const bestScore = profile && selectedSong
    ? profile.highScores[`${selectedSong.id}_${effectiveDiff}`] ?? 0
    : 0;

  return (
    <div className="game-screen stage-bg flex flex-col">
      {/* ── PROFESSIONAL HEADER ── */}
      <header className="px-4 py-4 shrink-0 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between gap-4">
          {/* Profile Button */}
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-3 flex-1 min-w-0 transition-opacity hover:opacity-80"
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] flex items-center justify-center text-lg font-black text-white shadow-md" style={{ boxShadow: '0 0 16px rgba(125,92,255,0.4)' }}>
                {profile?.username?.[0]?.toUpperCase() ?? 'V'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 badge-filled-primary text-[8px] px-1.5 py-0.5">
                {profile?.level ?? 1}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-title font-black truncate text-primary">
                {profile?.username ?? 'Performer'}
              </div>
              <div className="text-caption text-tertiary">Level {profile?.level ?? 1}</div>
              <div className="progress-bar mt-2 h-1" style={{ width: '100px' }}>
                <div className="progress-bar-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => onNavigate('settings')}
            className="btn btn-ghost btn-icon transition-all hover:bg-[var(--bg-surface-elevated)]"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="mx-4 mt-3 mb-3 px-4 py-3 rounded-lg surface-danger flex items-center gap-3 animate-slide-down">
          <Zap className="w-4 h-4 text-[var(--color-danger)] shrink-0" />
          <p className="text-xs text-[var(--color-danger)] flex-1 leading-snug">{error}</p>
          <button onClick={onClearError} className="text-tertiary hover:text-secondary p-1 transition-colors">
            ✕
          </button>
        </div>
      )}

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="game-screen-scroll px-4 pb-6">
        {/* Brand / Title */}
        <div className="pt-4 pb-6">
          <h1 className="text-display-lg font-black uppercase italic tracking-tighter text-primary leading-tight">
            VELOCITY
            <span className="ml-2 text-[var(--color-primary)]" style={{ textShadow: '0 0 18px rgba(67,231,255,0.6)' }}>
              //
            </span>
          </h1>
          <p className="text-label text-tertiary mt-2">Vocal Performance Challenge</p>
        </div>

        {/* ── SELECTED SONG CARD (Professional Music App Style) ── */}
        {selectedSong ? (
          <SongCard
            title={selectedSong.title}
            artist={selectedSong.artist}
            tempo={selectedSong.tempo}
            difficulty={effectiveDiff}
            bestScore={bestScore}
            isSelected
            onClick={() => onNavigate('song-select')}
          />
        ) : (
          <div className="card-accent-primary p-4 mb-5 rounded-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-label text-tertiary mb-1">Now Selected</div>
                <h2 className="text-headline font-black text-primary">Endless Run</h2>
                <p className="text-caption text-secondary mt-1">Procedural · No lyrics</p>
              </div>
              <button
                onClick={() => onNavigate('song-select')}
                className="btn btn-primary btn-sm shrink-0"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* ── PLAY BUTTON (Main CTA) ── */}
        <PrimaryButton
          variant="cyan"
          size="lg"
          fullWidth
          onClick={onPlay}
          icon={<Mic className="w-5 h-5" />}
          className="mb-6 font-display text-lg tracking-widest"
        >
          Play Now
        </PrimaryButton>

        {/* ── QUICK ACTION BUTTONS ── */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Train', icon: <Dumbbell className="w-5 h-5" />, screen: 'training' as Screen, variant: 'secondary' },
            { label: 'Profile', icon: <User className="w-5 h-5" />, screen: 'profile' as Screen, variant: 'primary' },
            { label: 'Rank', icon: <Trophy className="w-5 h-5" />, screen: 'leaderboard' as Screen, variant: 'warning' },
            { label: 'Settings', icon: <Settings className="w-5 h-5" />, screen: 'settings' as Screen, variant: 'secondary' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.screen)}
              className="btn btn-ghost rounded-xl flex flex-col items-center gap-2 p-3 h-auto border-[var(--border-default)]"
            >
              <div className="text-xl">{item.icon}</div>
              <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── PLAYER STATS ── */}
        {profile && profile.songsPlayed > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card rounded-lg p-4 text-center">
              <ScoreDisplay score={profile.songsPlayed} label="Plays" size="md" variant="primary" />
            </div>
            <div className="card rounded-lg p-4 text-center">
              <ScoreDisplay score={profile.perfectGates} label="Perfects" size="md" variant="success" />
            </div>
            <div className="card rounded-lg p-4 text-center">
              <ScoreDisplay score={profile.totalScore} label="Total XP" size="md" variant="secondary" />
            </div>
          </div>
        )}

        {/* ── DAILY MISSION ── */}
        {profile?.dailyChallenge && (
          <div className="card-accent-tertiary rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[var(--color-tertiary)]" />
                <span className="text-label text-[var(--color-tertiary)]">Daily Mission</span>
              </div>
              {profile.dailyChallenge.completed && (
                <span className="badge-filled-primary text-[8px] px-2 py-0.5">Complete ✓</span>
              )}
            </div>
            <div className="mb-3">
              <h3 className="text-title font-black text-primary mb-1">{profile.dailyChallenge.title}</h3>
              <p className="text-caption text-secondary">{profile.dailyChallenge.description}</p>
            </div>
            <StatBar
              label="Progress"
              value={profile.dailyChallenge.progress}
              max={profile.dailyChallenge.target}
              variant="tertiary"
              showBar
              compact={false}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-caption text-tertiary">
                {profile.dailyChallenge.progress} / {profile.dailyChallenge.target}
              </span>
              <span className="badge-warning text-[10px]">+{profile.dailyChallenge.reward} XP</span>
            </div>
          </div>
        )}

        {/* ── BACKGROUND MUSIC INDICATOR ── */}
        {selectedMusic && (
          <div className="card-elevated rounded-lg p-3 flex items-center gap-2 mb-6">
            <Music className="w-4 h-4 text-[var(--color-secondary)]" />
            <span className="text-label text-secondary">Ambient: {selectedMusic.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}
