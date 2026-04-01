import React, { useState, useRef, useEffect } from 'react';
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
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const [selectedWorldId, setSelectedWorldId] = useState<number | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedMode, setSelectedMode] = useState<'A' | 'C'>('A');

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

  const audioControllerRef = useRef<AudioController | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadedProfile = loadProfile();
    setProfile(loadedProfile);
  }, []);

  useEffect(() => {
    return () => {
      audioControllerRef.current?.stop();
    };
  }, []);

  const selectedSong = selectedSongId ? SONGS.find(s => s.id === selectedSongId) : null;

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

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

    if (selectedSongId && stats && profile) {
      const currentSongProg = songProgress[selectedSongId] || { stars: 0, score: 0 };
      const stars = stats.accuracy >= 90 ? 3 : stats.accuracy >= 75 ? 2 : stats.accuracy >= 60 ? 1 : 0;
      const newScore = Math.max(currentSongProg.score, score);

      const newSongProgress = {
        ...songProgress,
        [selectedSongId]: { stars: Math.max(currentSongProg.stars, stars), score: newScore },
      };
      setSongProgress(newSongProgress);

      setLevelProgress({
        ...levelProgress,
        [selectedLevel]: { stars: Math.max(currentSongProg.stars, stars), score: newScore },
      });

      const updatedProfile = { ...profile };
      updatedProfile.songsPlayed += 1;
      updatedProfile.totalScore += score;
      updatedProfile.perfectGates += stats.notesHit;

      const songKey = `${selectedSongId}_${selectedSong?.difficulty || 'novice'}`;
      if (!updatedProfile.highScores[songKey] || score > updatedProfile.highScores[songKey]) {
        updatedProfile.highScores[songKey] = score;
      }

      addXp(updatedProfile, Math.floor(score / 10) + (stars * 50));

      updateChallengeProgress(updatedProfile, 'c1', 1);
      updateChallengeProgress(updatedProfile, 'c2', score, true);
      updateChallengeProgress(updatedProfile, 'c4', stats.notesHit);
      updateChallengeProgress(updatedProfile, 'c5', stats.maxCombo, true);

      for (let i = 1; i <= 50; i++) {
        updateChallengeProgress(updatedProfile, `songs_played_${i}`, updatedProfile.songsPlayed, true);
        updateChallengeProgress(updatedProfile, `perfect_gates_${i}`, updatedProfile.perfectGates, true);
        updateChallengeProgress(updatedProfile, `score_milestone_${i}`, updatedProfile.totalScore, true);
        updateChallengeProgress(updatedProfile, `combo_streak_${i}`, stats.maxCombo, true);
      }

      if (updatedProfile.dailyChallenge && !updatedProfile.dailyChallenge.completed) {
        const dc = updatedProfile.dailyChallenge;
        if (dc.title === 'Early Bird' || dc.title === 'Night Owl') {
          dc.progress = Math.min(dc.target, dc.progress + 1);
        } else if (dc.title === 'Perfect Streak') {
          dc.progress = Math.max(dc.progress, stats.notesHit);
        } else if (dc.title === 'High Flyer') {
          dc.progress = Math.max(dc.progress, score);
        }
        if (dc.progress >= dc.target) {
          dc.completed = true;
          addXp(updatedProfile, dc.reward);
        }
      }

      saveProfile(updatedProfile);
      setProfile(updatedProfile);

      if (selectedWorldId) {
        const worldSongs = SONGS.filter(s => s.world === selectedWorldId);
        const completedInWorld = worldSongs.filter(s => newSongProgress[s.id]?.stars > 0).length;
        setWorldProgress(prev => ({ ...prev, [selectedWorldId]: completedInWorld }));

        const world = WORLDS.find(w => w.id === selectedWorldId);
        if (world && completedInWorld >= world.minSongsToUnlock) {
          const nextWorld = selectedWorldId + 1;
          if (nextWorld <= 5 && !unlockedWorlds.includes(nextWorld)) {
            setUnlockedWorlds(prev => [...prev, nextWorld]);
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

  const handleProfileUpdate = (updatedProfile: PlayerProfile) => {
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            profile={profile}
            onNavigate={(screen) => navigate(screen)}
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
        return (
          <ProfileScreen
            profile={profile}
            onBack={() => navigate('home')}
            onProfileUpdate={handleProfileUpdate}
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
        return <TrainingScreen onBack={() => navigate('home')} />;

      case 'settings':
        return (
          <SettingsScreen
            selectedBackgroundMusicId={selectedBackgroundMusicId}
            onBackgroundMusicChange={setSelectedBackgroundMusicId}
            onBack={() => navigate('home')}
          />
        );

      default:
        return (
          <HomeScreen
            profile={profile}
            onNavigate={(screen) => navigate(screen)}
          />
        );
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      {error && (
        <div className="fixed top-4 left-4 right-4 bg-[#FF6B6B] text-white p-4 rounded-lg z-50 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 font-bold">✕</button>
        </div>
      )}
      {renderScreen()}
    </div>
  );
}
