import React, { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import { AudioController } from './lib/audio';
import { SONGS } from './lib/songs-extended';
import { loadProfile, saveProfile, PlayerProfile, addXp, updateChallengeProgress } from './lib/profile';
import { WORLDS } from './lib/progression';

import { HomeScreen } from './screens/HomeScreen';
import { WorldSelectScreen } from './screens/WorldSelectScreen';
import { SongSelectScreen } from './screens/SongSelectScreen';
import { LevelSelectScreen } from './screens/LevelSelectScreen';
import { GameScreen } from './screens/GameScreen';
import { NewResultsScreen } from './screens/NewResultsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { TrainingScreen } from './screens/TrainingScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AircraftSelectScreen } from './screens/AircraftSelectScreen';
import { GameStats } from './components/GameEngine';

export type Screen =
  | 'home'
  | 'world-select'
  | 'song-select'
  | 'level-select'
  | 'game'
  | 'results'
  | 'profile'
  | 'leaderboard'
  | 'training'
  | 'settings'
  | 'aircraft-select';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedWorldId, setSelectedWorldId] = useState<number | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedMode, setSelectedMode] = useState<'A' | 'C'>('A');
  const [demoMode, setDemoMode] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const [isPaused, setIsPaused] = useState(false);
  const [lastGameStats, setLastGameStats] = useState<GameStats | null>(null);
  const [lastGameScore, setLastGameScore] = useState(0);
  const [previousBestScore, setPreviousBestScore] = useState(0);

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [unlockedWorlds, setUnlockedWorlds] = useState<number[]>([1]);
  const [worldProgress, setWorldProgress] = useState<{ [key: number]: number }>({ 1: 0 });
  const [songProgress, setSongProgress] = useState<{ [key: string]: { stars: number; score: number } }>({});
  const [levelProgress, setLevelProgress] = useState<{ [key: number]: { stars: number; score: number } }>({});
  const [selectedBackgroundMusicId, setSelectedBackgroundMusicId] = useState<string>('none');
  const [selectedAircraftId, setSelectedAircraftId] = useState<string>('heli-classic');

  const audioControllerRef = useRef<AudioController | null>(null);

  // Error State
  const [error, setError] = useState('');

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    if (p.selectedAircraftId) setSelectedAircraftId(p.selectedAircraftId);
  }, []);
  useEffect(() => { return () => { audioControllerRef.current?.stop(); }; }, []);

  const selectedSong = selectedSongId ? SONGS.find(s => s.id === selectedSongId) : null;

  const navigate = (screen: Screen) => setCurrentScreen(screen);

  const handleWorldSelect = (worldId: number) => {
    setSelectedWorldId(worldId);
    setCurrentScreen('song-select');
  };

  const handleSongSelect = (songId: string) => {
    setSelectedSongId(songId);
    setPreviousBestScore(songProgress[songId]?.score || 0);
    setCurrentScreen('level-select');
  };

  const handleLevelSelect = (level: number, mode: 'A' | 'C') => {
    setSelectedLevel(level);
    setSelectedMode(mode);
    startGame(false);
  };

  const startGame = useCallback(async (demo: boolean) => {
    try {
      setError('');
      setDemoMode(demo);
      setGameKey(k => k + 1);

      if (!audioControllerRef.current) {
        audioControllerRef.current = new AudioController();
      }

      if (!demo) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Microphone not available. Use Demo Mode to play without a mic.');
        }
        await audioControllerRef.current.init();
      }

      setCurrentScreen('game');
      setIsPaused(false);
    } catch (err) {
      if (!demo) {
        setDemoMode(true);
        setGameKey(k => k + 1);
        if (!audioControllerRef.current) {
          audioControllerRef.current = new AudioController();
        }
        setCurrentScreen('game');
        setIsPaused(false);
        setError('Mic unavailable — playing in Demo Mode');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to start');
      }
    }
  }, []);

  const handleGameOver = useCallback((score: number, win: boolean, stats?: GameStats) => {
    setLastGameScore(score);
    setLastGameStats(stats || null);

    if (selectedSongId && stats && profile) {
      const cur = songProgress[selectedSongId] || { stars: 0, score: 0 };
      const stars = stats.accuracy >= 90 ? 3 : stats.accuracy >= 75 ? 2 : stats.accuracy >= 60 ? 1 : 0;
      const best = Math.max(cur.score, score);

      const nsp = { ...songProgress, [selectedSongId]: { stars: Math.max(cur.stars, stars), score: best } };
      setSongProgress(nsp);
      setLevelProgress(lp => ({ ...lp, [selectedLevel]: { stars: Math.max(cur.stars, stars), score: best } }));

      const p = { ...profile };
      p.songsPlayed += 1;
      p.totalScore += score;
      p.perfectGates += stats.notesHit;

      const key = `${selectedSongId}_${selectedSong?.difficulty || 'novice'}`;
      if (!p.highScores[key] || score > p.highScores[key]) p.highScores[key] = score;

      addXp(p, Math.floor(score / 10) + stars * 50);

      updateChallengeProgress(p, 'c1', 1);
      updateChallengeProgress(p, 'c2', score, true);
      updateChallengeProgress(p, 'c4', stats.notesHit);
      updateChallengeProgress(p, 'c5', stats.maxCombo, true);
      for (let i = 1; i <= 50; i++) {
        updateChallengeProgress(p, `songs_played_${i}`, p.songsPlayed, true);
        updateChallengeProgress(p, `perfect_gates_${i}`, p.perfectGates, true);
        updateChallengeProgress(p, `score_milestone_${i}`, p.totalScore, true);
        updateChallengeProgress(p, `combo_streak_${i}`, stats.maxCombo, true);
      }

      if (p.dailyChallenge && !p.dailyChallenge.completed) {
        const dc = p.dailyChallenge;
        if (dc.title === 'Early Bird' || dc.title === 'Night Owl') dc.progress = Math.min(dc.target, dc.progress + 1);
        else if (dc.title === 'Perfect Streak') dc.progress = Math.max(dc.progress, stats.notesHit);
        else if (dc.title === 'High Flyer') dc.progress = Math.max(dc.progress, score);
        if (dc.progress >= dc.target) { dc.completed = true; addXp(p, dc.reward); }
      }

      saveProfile(p);
      setProfile(p);

      if (selectedWorldId) {
        const ws = SONGS.filter(s => s.world === selectedWorldId);
        const done = ws.filter(s => nsp[s.id]?.stars > 0).length;
        setWorldProgress(wp => ({ ...wp, [selectedWorldId]: done }));
        const w = WORLDS.find(w => w.id === selectedWorldId);
        if (w && done >= w.minSongsToUnlock) {
          const nw = selectedWorldId + 1;
          if (nw <= 5) setUnlockedWorlds(u => u.includes(nw) ? u : [...u, nw]);
        }
      }
    }

    setCurrentScreen('results');
  }, [profile, songProgress, selectedSongId, selectedSong, selectedWorldId, selectedLevel, unlockedWorlds]);

  const handleRetry = () => startGame(demoMode);
  const handleNextLevel = () => {
    const maxLvl = selectedWorldId ? [10, 15, 15, 18, 20][selectedWorldId - 1] : 20;
    if (selectedLevel < maxLvl) {
      setSelectedLevel(selectedLevel + 1);
      startGame(demoMode);
    }
  };

  const handleHome = () => {
    audioControllerRef.current?.stop();
    audioControllerRef.current = null;
    setSelectedWorldId(null);
    setSelectedSongId(null);
    setCurrentScreen('home');
  };

  const handleProfileUpdate = (p: PlayerProfile) => {
    setProfile(p);
    saveProfile(p);
  };

  const handleAircraftSelect = (aircraftId: string) => {
    setSelectedAircraftId(aircraftId);
    if (profile) {
      const p = { ...profile, selectedAircraftId: aircraftId };
      setProfile(p);
      saveProfile(p);
    }
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen profile={profile} onNavigate={navigate} />
        );

      case 'world-select':
        return (
          <WorldSelectScreen
            unlockedWorlds={unlockedWorlds}
            currentWorldProgress={worldProgress}
            onSelectWorld={handleWorldSelect}
            onBack={() => navigate('home')}
          />
        );

      case 'song-select':
        return selectedWorldId ? (
          <SongSelectScreen
            worldId={selectedWorldId}
            completedSongs={songProgress}
            onSelectSong={handleSongSelect}
            onBack={() => navigate('world-select')}
          />
        ) : null;

      case 'level-select':
        return selectedSong ? (
          <LevelSelectScreen
            song={selectedSong}
            worldId={selectedWorldId || 1}
            levelProgress={levelProgress}
            onSelectLevel={handleLevelSelect}
            onDemoLevel={(lvl, m) => { setSelectedLevel(lvl); setSelectedMode(m); startGame(true); }}
            onBack={() => navigate('song-select')}
          />
        ) : null;

      case 'game':
        return audioControllerRef.current && selectedSong ? (
          <Fragment key={gameKey}>
            <GameScreen
              audioController={audioControllerRef.current}
              song={selectedSong}
              level={selectedLevel}
              mode={selectedMode}
              difficulty={selectedSong.difficulty}
              isPaused={isPaused}
              profile={profile}
              demoMode={demoMode}
              aircraftId={selectedAircraftId}
              onPauseToggle={() => setIsPaused(p => !p)}
              onGameOver={handleGameOver}
              onAbort={handleHome}
            />
          </Fragment>
        ) : null;

      case 'results':
        return selectedSong && lastGameStats ? (
          <NewResultsScreen
            song={selectedSong}
            level={selectedLevel}
            mode={selectedMode}
            score={lastGameScore}
            accuracy={lastGameStats.accuracy}
            maxCombo={lastGameStats.maxCombo}
            notesHit={lastGameStats.notesHit}
            notesMissed={lastGameStats.notesMissed}
            previousBestScore={previousBestScore}
            xpEarned={lastGameStats.xpEarned}
            onHome={handleHome}
            onRetry={handleRetry}
            onNextLevel={handleNextLevel}
          />
        ) : null;

      case 'profile':
        return (
          <ProfileScreen
            profile={profile}
            onBack={() => navigate('home')}
            onProfileUpdate={handleProfileUpdate}
          />
        );

      case 'leaderboard':
        return <LeaderboardScreen profile={profile} onBack={() => navigate('home')} />;

      case 'training':
        return <TrainingScreen onBack={() => navigate('home')} />;

      case 'settings':
        return (
          <SettingsScreen
            selectedBackgroundMusicId={selectedBackgroundMusicId}
            onBackgroundMusicChange={setSelectedBackgroundMusicId}
            onBack={() => navigate('home')}
          />
        );

      case 'aircraft-select':
        return (
          <AircraftSelectScreen
            selectedAircraftId={selectedAircraftId}
            playerLevel={profile?.level ?? 1}
            onSelect={handleAircraftSelect}
            onBack={() => navigate('home')}
          />
        );

      default:
        return <HomeScreen profile={profile} onNavigate={navigate} />;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      {error && (
        <div
          className="fixed left-3 right-3 z-[300] rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-lg border border-[rgba(255,255,255,0.2)]"
          style={{
            top: 'calc(12px + var(--safe-top))',
            background: 'linear-gradient(135deg, #ff6b6b, #e63b3b)',
            boxShadow: '0 8px 32px rgba(255,107,107,0.45)',
          }}
          role="alert"
        >
          {error}
        </div>
      )}
      {renderScreen()}
    </div>
  );
}
