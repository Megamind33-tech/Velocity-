import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameHUDProps {
  score: number;
  highScore: number;
  combo: number;
  comboMultiplier: number;
  perfectStreak: number;
  currentNote: string;
  cents: number;
  isSinging: boolean;
  isPerfect: boolean;
  lyrics: string[];
  breathProgress: number;
  isDying: boolean;
  trackTitle: string;
  themeName: string;
  pitchY: number; // 0 to 1 (0 is top, 1 is bottom)
  volume: number; // 0 to 1
  dynamicDifficulty: number;
  feedbackMessage?: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  combo,
  comboMultiplier,
  perfectStreak,
  currentNote,
  cents,
  isSinging,
  isPerfect,
  lyrics,
  breathProgress,
  isDying,
  trackTitle,
  themeName,
  pitchY,
  volume,
  dynamicDifficulty,
  feedbackMessage
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none font-sans overflow-hidden">
      {/* Top Left: Score & Combo */}
      <div className="absolute top-6 left-6 space-y-2">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl">
          <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Telemetry / Score</div>
          <div className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {Math.floor(score).toLocaleString().padStart(6, '0')}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            High: {highScore.toLocaleString().padStart(6, '0')}
          </div>
        </div>

        <AnimatePresence>
          {combo > 0 && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="bg-blue-600/20 backdrop-blur-md border border-blue-500/30 p-4 rounded-2xl shadow-xl inline-block"
            >
              <div className="flex items-end gap-3">
                <div className="text-3xl font-black text-blue-400 italic tracking-tighter">
                  {combo} <span className="text-sm not-italic">COMBO</span>
                </div>
                <div className="bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                  {comboMultiplier}X
                </div>
              </div>
              {perfectStreak > 0 && (
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-1 animate-pulse">
                  {perfectStreak} Perfect Streak
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Right: Theme & Difficulty */}
      <div className="absolute top-6 right-6 text-right space-y-2">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-xl">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sector</div>
          <div className="text-xs font-bold text-white uppercase italic">{themeName}</div>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-xl">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engine Load</div>
          <div className={`text-xs font-bold uppercase italic ${dynamicDifficulty > 1.1 ? 'text-red-400' : dynamicDifficulty < 0.9 ? 'text-blue-400' : 'text-green-400'}`}>
            {Math.round(dynamicDifficulty * 100)}%
          </div>
        </div>
      </div>

      {/* Left Edge: Pitch Altimeter */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 h-64 w-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-2xl">
        <div className="relative h-full w-full">
          {/* Scale markers */}
          {[...Array(9)].map((_, i) => (
            <div 
              key={i} 
              className="absolute left-0 right-0 h-px bg-white/10" 
              style={{ top: `${i * 12.5}%` }}
            />
          ))}
          
          {/* Active Indicator */}
          <motion.div 
            className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] rounded-full z-10"
            animate={{ top: `${pitchY * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          
          {/* Label */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] whitespace-nowrap">
            Pitch Altimeter
          </div>
        </div>
      </div>

      {/* Center Top: Note & Tuning */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNote}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-6xl font-black tracking-tighter italic drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] ${
                isPerfect ? 'text-green-400' : 'text-white'
              }`}
            >
              {currentNote}
            </motion.div>
          </AnimatePresence>
          
          {isPerfect && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute inset-0 border-4 border-green-400 rounded-full"
            />
          )}
        </div>

        {isSinging && currentNote !== '--' && (
          <div className="mt-2 flex flex-col items-center">
            <div className={`text-xs font-black uppercase tracking-widest ${Math.abs(cents) < 15 ? 'text-green-400' : 'text-red-400'}`}>
              {cents > 0 ? '+' : ''}{cents} CENTS
            </div>
            {/* Tuning Meter */}
            <div className="mt-1 w-32 h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className={`h-full ${Math.abs(cents) < 15 ? 'bg-green-400' : 'bg-red-400'}`}
                animate={{ 
                  width: `${Math.abs(cents)}%`,
                  marginLeft: cents > 0 ? '50%' : `${50 - Math.abs(cents)}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Center: Lyrics & Volume */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl flex flex-col items-center space-y-6">
        {/* Lyrics */}
        <div className="flex items-center justify-center gap-6 h-16">
          <AnimatePresence mode="popLayout">
            {lyrics.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ 
                  opacity: i === 0 ? 1 : 0.4 - (i * 0.1), 
                  y: 0, 
                  scale: i === 0 ? 1.2 : 1,
                  filter: i === 0 ? 'blur(0px)' : 'blur(1px)'
                }}
                exit={{ opacity: 0, x: -20 }}
                className={`font-black uppercase tracking-tighter italic ${i === 0 ? 'text-white text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-slate-400 text-2xl'}`}
              >
                {word}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Volume / Breath Gauge */}
        <div className="w-96 space-y-2">
          <div className="flex justify-between items-end px-1">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vocal Pressure</div>
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Oxygen Level</div>
          </div>
          
          <div className="relative h-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full overflow-hidden p-0.5 shadow-xl">
            {/* Volume Fill */}
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              animate={{ width: `${volume * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
            
            {/* Breath Penalty Indicator (Overlay) */}
            {breathProgress > 0 && (
              <motion.div 
                className="absolute inset-0 bg-red-600/40"
                style={{ width: `${breathProgress * 100}%` }}
              />
            )}
          </div>
          
          {breathProgress > 0.8 && (
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-center text-[10px] font-black text-red-500 uppercase tracking-[0.2em]"
            >
              Critical Breath Warning
            </motion.div>
          )}
        </div>
      </div>

      {/* Feedback Messages (SUCCESS, etc) */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-6xl font-black text-green-400 uppercase italic tracking-tighter drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]">
              {feedbackMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Danger Overlay */}
      {isDying && (
        <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none border-[20px] border-red-600/30" />
      )}
    </div>
  );
};
