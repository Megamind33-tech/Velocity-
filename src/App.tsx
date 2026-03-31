import React, { useState, useRef, useEffect } from 'react';
import { AudioController } from './lib/audio';
import { GameCanvas } from './components/GameCanvas';
import { Mic, PlaneTakeoff, RotateCcw, Settings2, Music, ChevronDown, User, Trophy, Target, X, Edit2, Check } from 'lucide-react';
import { SONGS } from './lib/songs';
import { BACKGROUND_MUSIC } from './lib/backgroundMusic';
import { loadProfile, saveProfile, updateChallengeProgress, PlayerProfile } from './lib/profile';

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedSongId, setSelectedSongId] = useState<string>('none');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBackgroundMusicId, setSelectedBackgroundMusicId] = useState<string>('none');
  const [isMusicDropdownOpen, setIsMusicDropdownOpen] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [checkpoint, setCheckpoint] = useState<{ score: number, currentLyricIndex: number, obstaclesPassed: number } | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'play' | 'profile' | 'leaderboard'>('play');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const audioControllerRef = useRef<AudioController | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const startGame = async (fromCheckpoint: boolean = false) => {
    try {
      setError('');
      if (!fromCheckpoint) {
        setCheckpoint(null);
      }
      if (!audioControllerRef.current) {
        audioControllerRef.current = new AudioController();
      }
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone access. Please try a modern browser like Chrome or Firefox.');
      }

      await audioControllerRef.current.init();

      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => console.error(err));
      }

      // Play background music if selected
      if (selectedBackgroundMusicId !== 'none') {
        const music = BACKGROUND_MUSIC.find(m => m.id === selectedBackgroundMusicId);
        if (music) {
          await audioControllerRef.current.playBackgroundMusic(music.url);
        }
      }
      
      setGameState('playing');
    } catch (err: any) {
      console.error('Start game error:', err);
      setError(err.message || 'Could not access microphone. Please ensure permissions are granted and you are using HTTPS.');
    }
  };

  const handleGameOver = (finalScore: number, win: boolean = false, stats?: { perfectGates: number, maxCombo: number }) => {
    if (audioControllerRef.current) {
      audioControllerRef.current.stopBackgroundMusic();
    }
    setScore(finalScore);
    setIsWin(win);
    setGameState('gameover');
    if (win) setCheckpoint(null);

    if (profile) {
      const p = { ...profile };
      p.songsPlayed += 1;
      p.totalScore += finalScore;
      if (stats?.perfectGates) p.perfectGates += stats.perfectGates;
      
      const scoreKey = `${selectedSongId}_${difficulty}`;
      const currentHigh = p.highScores[scoreKey] || 0;
      if (finalScore > currentHigh) {
        p.highScores[scoreKey] = finalScore;
      }

      updateChallengeProgress(p, 'c1', 1);
      updateChallengeProgress(p, 'c2', finalScore, true);
      if (difficulty === 'hard') updateChallengeProgress(p, 'c3', 1);
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
  };

  useEffect(() => {
    return () => {
      if (audioControllerRef.current) {
        audioControllerRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F12] text-[#E0E0E0] font-sans flex flex-col selection:bg-blue-500/30">
      
      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 pb-24 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          
          {error && (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-1">System Error</h3>
                <p className="text-xs text-[#8E9299] font-medium leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                className="p-2 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          )}
          
          {/* Header */}
          <header className="flex items-center justify-between mb-8 md:mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 rotate-3">
                <PlaneTakeoff className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic font-display">Vocal Flight</h1>
            </div>
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-[#8E9299] bg-[#111] px-4 py-2 rounded-full border border-slate-800 shadow-inner">
              <div className={`w-2 h-2 rounded-full animate-pulse ${gameState === 'playing' ? 'bg-green-500' : 'bg-amber-500'}`} />
              {gameState === 'playing' ? 'FLIGHT ACTIVE' : 'SYSTEM STANDBY'}
            </div>
          </header>

        {gameState === 'start' && activeTab === 'play' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col justify-center space-y-6">
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-none font-display">
                READY FOR <span className="text-blue-500">TAKEOFF?</span>
              </h2>
              <p className="text-lg text-[#8E9299] font-light tracking-wide max-w-sm">
                The world's first voice-controlled flight sim. Match your pitch to navigate through the gates.
              </p>
            </div>

            {/* Controls */}
            <div className="bg-[#0A0A0A] p-8 rounded-3xl border border-slate-800/50 space-y-8 shadow-2xl shadow-black/50 backdrop-blur-sm">
              {selectedSongId === 'none' ? (
                <div className="flex p-1 bg-[#0F0F12] rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setDifficulty('easy')}
                    className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${difficulty === 'easy' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-[#8E9299] hover:text-white'}`}
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => setDifficulty('medium')}
                    className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${difficulty === 'medium' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[#8E9299] hover:text-white'}`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setDifficulty('hard')}
                    className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${difficulty === 'hard' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-[#8E9299] hover:text-white'}`}
                  >
                    Hard
                  </button>
                </div>
              ) : (
                <div className="flex p-4 bg-[#0F0F12] rounded-2xl border border-slate-800 justify-between items-center">
                  <div className="text-[#8E9299] text-sm font-bold uppercase tracking-widest">Track Difficulty</div>
                  <div className={`px-4 py-2 rounded-xl uppercase text-xs font-bold ${
                    SONGS.find(s => s.id === selectedSongId)?.difficulty === 'easy' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 
                    SONGS.find(s => s.id === selectedSongId)?.difficulty === 'medium' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 
                    'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  }`}>
                    {SONGS.find(s => s.id === selectedSongId)?.difficulty}
                  </div>
                </div>
              )}

              <div className="w-full">
                <button
                  onClick={() => setIsDropdownOpen(true)}
                  className="w-full p-6 rounded-2xl border border-slate-800 bg-[#0F0F12] text-left flex items-center justify-between hover:border-slate-600 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                      <Music className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#8E9299] uppercase font-bold tracking-widest">Selected Track</div>
                      <div className="font-bold text-white truncate max-w-[180px] md:max-w-[220px] font-display">
                        {selectedSongId === 'none' ? 'Endless Flight' : SONGS.find(s => s.id === selectedSongId)?.title}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                    CHANGE
                  </div>
                </button>
              </div>

              <div className="w-full relative">
                <button
                  onClick={() => setIsMusicDropdownOpen(!isMusicDropdownOpen)}
                  className="w-full p-5 rounded-2xl border border-slate-800 bg-[#151619] text-left flex items-center justify-between hover:border-slate-600 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                      <Music className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#8E9299] uppercase font-bold tracking-widest">Background Music</div>
                      <div className="font-bold text-white truncate max-w-[180px] md:max-w-[220px]">
                        {selectedBackgroundMusicId === 'none' ? 'None' : BACKGROUND_MUSIC.find(m => m.id === selectedBackgroundMusicId)?.title}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-[#8E9299] transition-transform duration-300 ${isMusicDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMusicDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-[#1C1D21] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto custom-scrollbar">
                    <button 
                      onClick={() => { setSelectedBackgroundMusicId('none'); setIsMusicDropdownOpen(false); }} 
                      className="w-full p-4 text-left hover:bg-slate-800 flex items-center justify-between group border-b border-slate-800/50"
                    >
                      <span className="font-medium group-hover:text-purple-400 transition-colors">None</span>
                    </button>
                    {BACKGROUND_MUSIC.map(music => (
                      <button 
                        key={music.id} 
                        onClick={() => { setSelectedBackgroundMusicId(music.id); setIsMusicDropdownOpen(false); }} 
                        className="w-full p-4 text-left hover:bg-slate-800 flex items-center justify-between group border-b border-slate-800/50 last:border-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium group-hover:text-purple-400 transition-colors truncate mr-2">{music.title}</span>
                          <span className="text-[10px] text-slate-400">{music.artist}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={startGame}
                className="w-full group relative overflow-hidden inline-flex items-center justify-center gap-3 px-10 py-7 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl rounded-2xl transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98] font-display uppercase"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <Mic className="w-7 h-7" />
                INITIALIZE FLIGHT
              </button>
            </div>
          </div>
        )}

        {gameState === 'start' && activeTab === 'profile' && profile && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <div className="bg-[#1C1D21] p-6 md:p-10 rounded-3xl border border-slate-800/50 flex flex-col md:flex-row items-center gap-8 shadow-xl">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  {profile.level}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-tighter">
                  Level
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-4 w-full">
                <div className="space-y-1">
                  {isEditingUsername ? (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <input
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        className="bg-[#0F0F12] text-white px-4 py-2 rounded-xl border border-slate-700 outline-none focus:border-blue-500 w-full max-w-[200px] font-bold"
                        autoFocus
                        maxLength={15}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const p = { ...profile, username: tempUsername || 'Guest Pilot' };
                            setProfile(p);
                            saveProfile(p);
                            setIsEditingUsername(false);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const p = { ...profile, username: tempUsername || 'Guest Pilot' };
                          setProfile(p);
                          saveProfile(p);
                          setIsEditingUsername(false);
                        }}
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <h2 className="text-3xl md:text-4xl font-black text-white flex items-center justify-center md:justify-start gap-3 group">
                      {profile.username}
                      <button
                        onClick={() => {
                          setTempUsername(profile.username);
                          setIsEditingUsername(true);
                        }}
                        className="text-slate-600 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </h2>
                  )}
                  <p className="text-[#8E9299] text-sm font-medium uppercase tracking-widest">Elite Pilot Division</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                    <span className="text-blue-400">Experience Points</span>
                    <span className="text-slate-500">{profile.xp} / {profile.level * 1000} XP</span>
                  </div>
                  <div className="w-full bg-[#0F0F12] rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full transition-all duration-1000" style={{ width: `${(profile.xp / (profile.level * 1000)) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="bg-[#0F0F12] p-4 rounded-2xl border border-slate-800 text-center min-w-[100px]">
                  <div className="text-2xl font-black text-white">{profile.songsPlayed}</div>
                  <div className="text-[10px] text-[#8E9299] uppercase font-bold tracking-widest">Flights</div>
                </div>
                <div className="bg-[#0F0F12] p-4 rounded-2xl border border-slate-800 text-center min-w-[100px]">
                  <div className="text-2xl font-black text-blue-500">{profile.perfectGates}</div>
                  <div className="text-[10px] text-[#8E9299] uppercase font-bold tracking-widest">Perfects</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-500" /> 
                  Mission Log
                </h3>
                <div className="h-px flex-1 bg-slate-800 mx-4 hidden md:block" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {profile.dailyChallenge && (
                  <div className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] ${profile.dailyChallenge.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-purple-500/5 border-purple-500/20 shadow-lg shadow-purple-500/5'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className={`text-[10px] font-black uppercase tracking-widest ${profile.dailyChallenge.completed ? 'text-green-500' : 'text-purple-500'}`}>Daily Objective</div>
                        <h4 className="text-lg font-black text-white uppercase">{profile.dailyChallenge.title}</h4>
                      </div>
                      <div className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-3 py-1.5 rounded-xl border border-amber-500/20">
                        +{profile.dailyChallenge.reward} XP
                      </div>
                    </div>
                    <p className="text-sm text-[#8E9299] mb-6 leading-relaxed">{profile.dailyChallenge.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-slate-500">Progress</span>
                        <span className={profile.dailyChallenge.completed ? 'text-green-500' : 'text-white'}>{profile.dailyChallenge.progress} / {profile.dailyChallenge.target}</span>
                      </div>
                      <div className="w-full bg-[#0F0F12] rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className={`h-full transition-all duration-700 ${profile.dailyChallenge.completed ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]'}`} style={{ width: `${Math.min(100, (profile.dailyChallenge.progress / profile.dailyChallenge.target) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                )}
                {profile.challenges.map(c => (
                  <div key={c.id} className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] ${c.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-[#1C1D21] border-slate-800/50'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className={`text-[10px] font-black uppercase tracking-widest ${c.completed ? 'text-green-500' : 'text-blue-500'}`}>Achievement</div>
                        <h4 className="text-lg font-black text-white uppercase">{c.title}</h4>
                      </div>
                      <div className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-3 py-1.5 rounded-xl border border-amber-500/20">
                        +{c.reward} XP
                      </div>
                    </div>
                    <p className="text-sm text-[#8E9299] mb-6 leading-relaxed">{c.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-slate-500">Progress</span>
                        <span className={c.completed ? 'text-green-500' : 'text-white'}>{c.progress} / {c.target}</span>
                      </div>
                      <div className="w-full bg-[#0F0F12] rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className={`h-full transition-all duration-700 ${c.completed ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} style={{ width: `${Math.min(100, (c.progress / c.target) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'start' && activeTab === 'leaderboard' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-20 animate-pulse" />
                <Trophy className="w-20 h-20 text-amber-500 relative" />
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                GLOBAL <span className="text-amber-500">RANKINGS</span>
              </h2>
              <p className="text-[#8E9299] font-medium uppercase tracking-widest text-sm">Top pilots across all sectors</p>
            </div>

            <div className="bg-[#1C1D21] rounded-3xl border border-slate-800/50 overflow-hidden shadow-2xl">
              {[
                { rank: 1, name: 'Maverick', score: 145020, level: 42 },
                { rank: 2, name: 'Goose', score: 132400, level: 38 },
                { rank: 3, name: 'Iceman', score: 128900, level: 40 },
                { rank: 4, name: 'Viper', score: 115000, level: 35 },
                { rank: 5, name: profile?.username || 'You', score: profile?.totalScore || 0, level: profile?.level || 1, isYou: true },
              ].sort((a, b) => b.score - a.score).map((entry, i) => (
                <div key={i} className={`flex items-center p-6 border-b border-slate-800/30 last:border-0 transition-colors hover:bg-slate-800/20 ${entry.isYou ? 'bg-blue-600/10 border-l-4 border-l-blue-600' : ''}`}>
                  <div className={`w-10 flex items-center justify-center font-black text-2xl italic ${
                    i === 0 ? 'text-amber-500' : 
                    i === 1 ? 'text-slate-400' : 
                    i === 2 ? 'text-amber-700' : 
                    'text-slate-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 ml-6">
                    <div className="font-black text-lg md:text-xl text-white flex items-center gap-3 uppercase italic">
                      {entry.name} 
                      {entry.isYou && (
                        <span className="text-[10px] not-italic font-black uppercase bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg shadow-blue-600/20">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#8E9299] font-bold uppercase tracking-widest">Division Level {entry.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-xl md:text-2xl text-blue-500 leading-none">{entry.score.toLocaleString()}</div>
                    <div className="text-[10px] text-[#8E9299] font-bold uppercase tracking-widest mt-1">Total Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="w-full flex flex-col items-center gap-8 animate-in fade-in duration-700">
            <div className="relative w-full aspect-video md:aspect-[21/9] border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
              <GameCanvas
                audioController={audioControllerRef.current!}
                onGameOver={handleGameOver}
                onCheckpointReached={(cp) => setCheckpoint(cp)}
                difficulty={difficulty}
                song={SONGS.find(s => s.id === selectedSongId) || null}
                level={profile?.level || 1}
                isPaused={isPaused}
                initialCheckpoint={checkpoint}
              />
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="absolute top-4 right-4 bg-slate-900/90 hover:bg-slate-800 text-white p-4 rounded-2xl backdrop-blur-md border border-slate-700 transition-all active:scale-95 shadow-xl z-50"
              >
                {isPaused ? (
                  <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                    <RotateCcw className="w-4 h-4" /> Resume
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                    <X className="w-4 h-4" /> Pause
                  </div>
                )}
              </button>

              {isPaused && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 animate-in fade-in duration-300">
                  <div className="text-center space-y-6 p-8 bg-[#1C1D21] rounded-3xl border border-slate-800 shadow-2xl max-w-xs w-full mx-4">
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">FLIGHT PAUSED</h3>
                    <p className="text-sm text-[#8E9299]">Adjust your headset and prepare for re-entry.</p>
                    <button
                      onClick={() => setIsPaused(false)}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20"
                    >
                      RESUME MISSION
                    </button>
                    <button
                      onClick={() => {
                        setIsPaused(false);
                        setGameState('start');
                      }}
                      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all"
                    >
                      ABORT FLIGHT
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-[#8E9299] text-xs md:text-sm uppercase tracking-[0.2em] font-black italic">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-md animate-pulse opacity-50" />
                <div className="relative h-2.5 w-2.5 rounded-full bg-blue-500" />
              </div>
              Vocal Signal Active — Sing to Steer
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="flex flex-col items-center text-center space-y-8 md:space-y-12 animate-in slide-in-from-bottom-8 fade-in duration-700">
            <div className="space-y-2">
              <h2 className={`text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none ${isWin ? 'text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'text-red-500 drop-shadow-[0_0_30px_rgba(239,44,44,0.3)]'}`}>
                {isWin ? 'MISSION COMPLETE' : 'SYSTEM CRASH'}
              </h2>
              <p className="text-[#8E9299] font-bold uppercase tracking-widest">Flight telemetry recorded</p>
            </div>

            <div className="relative group">
              <div className={`absolute inset-0 blur-3xl opacity-20 transition-opacity ${isWin ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="relative bg-[#1C1D21] p-10 md:p-14 rounded-[40px] border border-slate-800 shadow-2xl min-w-[280px] md:min-w-[400px]">
                <p className="text-[#8E9299] text-xs md:text-sm uppercase tracking-[0.3em] font-black mb-2">Final Score</p>
                <p className="text-7xl md:text-9xl font-mono text-white font-black tracking-tighter">{score.toLocaleString()}</p>
                
                <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-[10px] text-[#8E9299] uppercase font-black tracking-widest mb-1">Status</div>
                    <div className={`text-sm font-black uppercase italic ${isWin ? 'text-green-500' : 'text-red-500'}`}>{isWin ? 'Success' : 'Failed'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8E9299] uppercase font-black tracking-widest mb-1">Difficulty</div>
                    <div className="text-sm font-black uppercase italic text-white">{difficulty}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
              <button
                onClick={() => {
                  setCheckpoint(null);
                  setGameState('start');
                }}
                className="w-full sm:flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-sm"
              >
                Return to Base
              </button>
              {checkpoint && !isWin && (
                <button
                  onClick={() => startGame(true)}
                  className="w-full sm:flex-1 py-5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-amber-600/20 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry from Checkpoint
                </button>
              )}
              <button
                onClick={() => startGame(false)}
                className="w-full sm:flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-blue-600/20 uppercase tracking-widest text-sm"
              >
                {isWin ? 'New Mission' : 'Retry Level'}
              </button>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Bottom Navigation */}
      {gameState === 'start' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#151619]/90 backdrop-blur-xl border-t border-slate-800/50 p-4 pb-8 md:pb-6 flex justify-around items-center z-50">
          <button 
            onClick={() => setActiveTab('play')} 
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'play' ? 'text-blue-500 scale-110' : 'text-[#8E9299] hover:text-slate-300'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'play' ? 'bg-blue-500/10' : ''}`}>
              <PlaneTakeoff className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Play</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'profile' ? 'text-purple-500 scale-110' : 'text-[#8E9299] hover:text-slate-300'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-purple-500/10' : ''}`}>
              <User className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Profile</span>
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')} 
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'leaderboard' ? 'text-amber-500 scale-110' : 'text-[#8E9299] hover:text-slate-300'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'leaderboard' ? 'bg-amber-500/10' : ''}`}>
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Rank</span>
          </button>
        </nav>
      )}

      {/* Song Selection Modal */}
      {isDropdownOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1C1D21] border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#151619]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Music className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-display">Select Track</h3>
              </div>
              <button 
                onClick={() => setIsDropdownOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar flex-1">
              <button 
                onClick={() => { setSelectedSongId('none'); setIsDropdownOpen(false); }} 
                className={`w-full p-4 rounded-2xl text-left flex items-center justify-between group border transition-all ${selectedSongId === 'none' ? 'bg-blue-600/20 border-blue-500/50' : 'bg-[#0F0F12] border-slate-800 hover:border-slate-600'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedSongId === 'none' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                    <PlaneTakeoff className="w-6 h-6" />
                  </div>
                  <div>
                    <div className={`font-bold text-lg transition-colors ${selectedSongId === 'none' ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>Endless Flight</div>
                    <div className="text-xs text-slate-500">Procedural generation • No lyrics</div>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 px-3 py-1.5 rounded-lg text-slate-400 uppercase font-bold tracking-wider">Zen Mode</span>
              </button>

              <div className="pt-4 pb-2 px-2">
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Available Tracks</div>
              </div>

              {SONGS.map(song => (
                <button 
                  key={song.id} 
                  onClick={() => { setSelectedSongId(song.id); setIsDropdownOpen(false); }} 
                  className={`w-full p-4 rounded-2xl text-left flex items-center justify-between group border transition-all ${selectedSongId === song.id ? 'bg-blue-600/20 border-blue-500/50' : 'bg-[#0F0F12] border-slate-800 hover:border-slate-600'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedSongId === song.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                      <Music className="w-6 h-6" />
                    </div>
                    <div>
                      <div className={`font-bold text-lg transition-colors ${selectedSongId === song.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{song.title}</div>
                      <div className="text-xs text-slate-500">{song.artist} • {song.tempo} BPM</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-3 py-1.5 rounded-lg uppercase font-bold tracking-wider ${
                    song.difficulty === 'easy' ? 'bg-green-900/30 text-green-400' : 
                    song.difficulty === 'medium' ? 'bg-amber-900/30 text-amber-400' : 
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {song.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
