import React, { useState, useRef, useEffect } from 'react';
import { AudioController } from './lib/audio';
import { SONGS } from './lib/songs';
import { BACKGROUND_MUSIC } from './lib/backgroundMusic';
import { loadProfile, saveProfile, updateChallengeProgress, PlayerProfile } from './lib/profile';

import { HomeScreen } from './screens/HomeScreen';
import { SongSelectScreen } from './screens/SongSelectScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { TrainingScreen } from './screens/TrainingScreen';
import { SettingsScreen } from './screens/SettingsScreen';

// ── Screen type ──────────────────────────────────────────────
export type Screen =
  | 'home'
  | 'song-select'
  | 'game'
  | 'results'
  | 'profile'
  | 'leaderboard'
  | 'training'
  | 'settings';

export default function App() {
  // ── Navigation ───────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  // ── Game config ──────────────────────────────────────────
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedSongId, setSelectedSongId] = useState<string>('none');
  const [selectedBackgroundMusicId, setSelectedBackgroundMusicId] = useState<string>('none');

  // ── Gameplay state ───────────────────────────────────────
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const [checkpoint, setCheckpoint] = useState<{
    score: number;
    currentLyricIndex: number;
    obstaclesPassed: number;
  } | null>(null);
  const [lastGameStats, setLastGameStats] = useState<{
    perfectGates: number;
    maxCombo: number;
  } | null>(null);

  // ── Profile ──────────────────────────────────────────────
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  // ── Error ────────────────────────────────────────────────
  const [error, setError] = useState('');

  // ── Audio controller ─────────────────────────────────────
  const audioControllerRef = useRef<AudioController | null>(null);

  // Load profile on mount
  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioControllerRef.current?.stop();
    };
  }, []);

  // ── Derived: effective difficulty ────────────────────────
  const activeDifficulty = (() => {
    const song = SONGS.find(s => s.id === selectedSongId);
    return song ? song.difficulty : difficulty;
  })();

  // ── Actions ──────────────────────────────────────────────

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const startGame = async (fromCheckpoint: boolean = false) => {
    try {
      setError('');
      if (!fromCheckpoint) {
        setCheckpoint(null);
      }

      if (!audioControllerRef.current) {
        audioControllerRef.current = new AudioController();
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone access. Please use Chrome or Firefox.');
      }

      await audioControllerRef.current.init();

      // Request fullscreen on mobile
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }

      // Play background music if selected
      if (selectedBackgroundMusicId !== 'none') {
        const music = BACKGROUND_MUSIC.find(m => m.id === selectedBackgroundMusicId);
        if (music) {
          await audioControllerRef.current.playBackgroundMusic(music.url);
        }
      }

      setIsPaused(false);
      setCurrentScreen('game');
    } catch (err: any) {
      console.error('Start game error:', err);
      setError(err.message || 'Could not access microphone. Please ensure permissions are granted and you are using HTTPS.');
    }
  };

  const handleGameOver = (
    finalScore: number,
    win: boolean = false,
    stats?: { perfectGates: number; maxCombo: number }
  ) => {
    audioControllerRef.current?.stopBackgroundMusic();

    setScore(finalScore);
    setIsWin(win);
    setLastGameStats(stats ?? null);
    if (win) setCheckpoint(null);

    // Update profile
    if (profile) {
      const p = { ...profile };
      p.songsPlayed += 1;
      p.totalScore += finalScore;
      if (stats?.perfectGates) p.perfectGates += stats.perfectGates;

      const scoreKey = `${selectedSongId}_${activeDifficulty}`;
      const currentHigh = p.highScores[scoreKey] || 0;
      if (finalScore > currentHigh) {
        p.highScores[scoreKey] = finalScore;
      }

      updateChallengeProgress(p, 'c1', 1);
      updateChallengeProgress(p, 'c2', finalScore, true);
      if (activeDifficulty === 'hard') updateChallengeProgress(p, 'c3', 1);
      if (stats?.perfectGates) updateChallengeProgress(p, 'c4', stats.perfectGates);
      if (stats?.maxCombo) updateChallengeProgress(p, 'c5', stats.maxCombo, true);

      if (p.dailyChallenge) {
        if (p.dailyChallenge.title === 'Early Bird' || p.dailyChallenge.title === 'Night Owl') {
          updateChallengeProgress(p, 'daily', 1);
        } else if (p.dailyChallenge.title === 'Perfect Streak') {
          if (stats?.perfectGates) updateChallengeProgress(p, 'daily', stats.perfectGates);
        } else if (p.dailyChallenge.title === 'High Flyer') {
          updateChallengeProgress(p, 'daily', finalScore, true);
        }
      }

      saveProfile(p);
      setProfile(p);
    }

    setCurrentScreen('results');
  };

  const handleAbortGame = () => {
    audioControllerRef.current?.stopBackgroundMusic();
    setIsPaused(false);
    setCurrentScreen('home');
  };

  const handleRetry = () => {
    startGame(false);
  };

  const handleRetryFromCheckpoint = () => {
    startGame(true);
  };

  // ── Screen rendering ─────────────────────────────────────

  switch (currentScreen) {
    case 'home':
      return (
        <HomeScreen
          profile={profile}
          selectedSongId={selectedSongId}
          difficulty={difficulty}
          selectedBackgroundMusicId={selectedBackgroundMusicId}
          error={error}
          onPlay={() => startGame(false)}
          onNavigate={navigate}
          onDifficultyChange={setDifficulty}
          onClearError={() => setError('')}
        />
      );

    case 'song-select':
      return (
        <SongSelectScreen
          selectedSongId={selectedSongId}
          profile={profile}
          onSelect={setSelectedSongId}
          onBack={() => navigate('home')}
        />
      );

    case 'game':
      if (!audioControllerRef.current) return null;
      return (
        <GameScreen
          audioController={audioControllerRef.current}
          difficulty={activeDifficulty}
          selectedSongId={selectedSongId}
          isPaused={isPaused}
          checkpoint={checkpoint}
          profile={profile}
          onPauseToggle={() => setIsPaused(p => !p)}
          onGameOver={handleGameOver}
          onCheckpointReached={setCheckpoint}
          onAbort={handleAbortGame}
        />
      );

    case 'results':
      return (
        <ResultsScreen
          score={score}
          isWin={isWin}
          difficulty={activeDifficulty}
          selectedSongId={selectedSongId}
          checkpoint={checkpoint}
          profile={profile}
          lastGameStats={lastGameStats}
          onRetry={handleRetry}
          onRetryFromCheckpoint={handleRetryFromCheckpoint}
          onHome={() => navigate('home')}
        />
      );

    case 'profile':
      return (
        <ProfileScreen
          profile={profile}
          onBack={() => navigate('home')}
          onProfileUpdate={setProfile}
        />
      );

    case 'leaderboard':
      return (
        <LeaderboardScreen
          profile={profile}
          onBack={() => navigate('home')}
        />
      );

    case 'training':
      return (
        <TrainingScreen
          onBack={() => navigate('home')}
        />
      );

    case 'settings':
      return (
        <SettingsScreen
          selectedBackgroundMusicId={selectedBackgroundMusicId}
          onBackgroundMusicChange={setSelectedBackgroundMusicId}
          onBack={() => navigate('home')}
        />
      );

    default:
      return null;
  }
}
