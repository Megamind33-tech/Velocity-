import React, { useState, useRef, useEffect } from 'react';
import { AudioController } from './lib/audio';
import { SONGS } from './lib/songs-extended';
import { loadProfile, saveProfile, PlayerProfile } from './lib/profile';
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
  | 'settings';

export default function App() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  // World/Song/Level Selection
  const [selectedWorldId, setSelectedWorldId] = useState<number | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedMode, setSelectedMode] = useState<'A' | 'C'>('A');

  // Game State
  const [isPaused, setIsPaused] = useState(false);
  const [lastGameStats, setLastGameStats] = useState<GameStats | null>(null);
  const [lastGameScore, setLastGameScore] = useState(0);
  const [previousBestScore, setPreviousBestScore] = useState(0);

  // Profile
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [unlockedWorlds, setUnlockedWorlds] = useState<number[]>([1]);
  const [worldProgress, setWorldProgress] = useState<{ [key: number]: number }>({ 1: 0 });
  const [songProgress, setSongProgress] = useState<{ [key: string]: { stars: number; score: number } }>({});
  const [levelProgress, setLevelProgress] = useState<{ [key: number]: { stars: number; score: number } }>({});

  // Audio Controller
  const audioControllerRef = useRef<AudioController | null>(null);

  // Error State
  const [error, setError] = useState('');

  // Load profile on mount
  useEffect(() => {
    const loadedProfile = loadProfile();
    setProfile(loadedProfile);
    // TODO: Load progression state from profile
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioControllerRef.current?.stop();
    };
  }, []);

  // Get selected song object
  const selectedSong = selectedSongId ? SONGS.find(s => s.id === selectedSongId) : null;

  // Navigation handlers
  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleWorldSelect = (worldId: number) => {
    setSelectedWorldId(worldId);
    setCurrentScreen('song-select');
  };

  const handleSongSelect = (songId: string) => {
    setSelectedSongId(songId);
    const song = SONGS.find(s => s.id === songId);
    if (song) {
      setPreviousBestScore(songProgress[songId]?.score || 0);
    }
    setCurrentScreen('level-select');
  };

  const handleLevelSelect = (level: number, mode: 'A' | 'C') => {
    setSelectedLevel(level);
    setSelectedMode(mode);
    startGame();
  };

  const startGame = async () => {
    try {
      setError('');

      if (!audioControllerRef.current) {
        audioControllerRef.current = new AudioController();
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone access. Please use Chrome or Firefox.');
      }

      await audioControllerRef.current.init();
      setCurrentScreen('game');
      setIsPaused(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    }
  };

  const handleGameOver = (score: number, win: boolean, stats?: GameStats) => {
    setLastGameScore(score);
    setLastGameStats(stats || null);

    // Update progress
    if (selectedSongId && stats) {
      const currentSongProg = songProgress[selectedSongId] || { stars: 0, score: 0 };
      const stars = stats.accuracy >= 90 ? 3 : stats.accuracy >= 75 ? 2 : stats.accuracy >= 60 ? 1 : 0;
      const newScore = Math.max(currentSongProg.score, score);

      setSongProgress({
        ...songProgress,
        [selectedSongId]: { stars: Math.max(currentSongProg.stars, stars), score: newScore },
      });

      setLevelProgress({
        ...levelProgress,
        [selectedLevel]: { stars: Math.max(currentSongProg.stars, stars), score: newScore },
      });

      // Check if we should unlock next world
      if (selectedWorldId) {
        const worldSongs = SONGS.filter(s => s.world === selectedWorldId);
        const worldComplete = worldSongs.filter(s => songProgress[s.id]?.stars > 0).length;

        if (worldComplete >= WORLDS[selectedWorldId - 1].minSongsToUnlock) {
          if (!unlockedWorlds.includes(selectedWorldId + 1)) {
            setUnlockedWorlds([...unlockedWorlds, selectedWorldId + 1]);
          }
        }
      }
    }

    setCurrentScreen('results');
  };

  const handleRetry = () => {
    startGame();
  };

  const handleHome = () => {
    audioControllerRef.current?.stop();
    audioControllerRef.current = null;
    setSelectedWorldId(null);
    setSelectedSongId(null);
    setCurrentScreen('home');
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            profile={profile}
            onNavigate={(screen) => navigate(screen as any)}
          />
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
            onBack={() => navigate('song-select')}
          />
        ) : null;

      case 'game':
        return audioControllerRef.current && selectedSong ? (
          <GameScreen
            audioController={audioControllerRef.current}
            song={selectedSong}
            level={selectedLevel}
            mode={selectedMode}
            difficulty={selectedSong.difficulty}
            isPaused={isPaused}
            profile={profile}
            onPauseToggle={() => setIsPaused(!isPaused)}
            onGameOver={handleGameOver}
            onAbort={handleHome}
          />
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
            onHome={handleHome}
            onRetry={handleRetry}
          />
        ) : null;

      case 'profile':
        return <ProfileScreen profile={profile} onBack={() => navigate('home')} />;

      case 'leaderboard':
        return <LeaderboardScreen onBack={() => navigate('home')} />;

      case 'training':
        return <TrainingScreen onBack={() => navigate('home')} />;

      case 'settings':
        return <SettingsScreen onBack={() => navigate('home')} />;

      default:
        return <HomeScreen profile={profile} onNavigate={(screen) => navigate(screen as any)} />;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      {error && (
        <div className="fixed top-4 left-4 right-4 bg-[#FF6B6B] text-white p-4 rounded-lg z-50">
          {error}
        </div>
      )}
      {renderScreen()}
    </div>
  );
}
