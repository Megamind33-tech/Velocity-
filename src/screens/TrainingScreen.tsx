import React from 'react';
import { ChevronLeft, Mic, Eye, Timer, Waves, ChevronRight } from 'lucide-react';
import { IconButton } from '../components/ui/IconButton';
import { PrimaryButton } from '../components/ui/PrimaryButton';

interface TrainingScreenProps {
  onBack: () => void;
  onStartTraining?: (mode: string) => void;
}

const TRAINING_MODES = [
  {
    id: 'pitch',
    icon: <Mic className="w-6 h-6" />,
    title: 'Pitch Control',
    description: 'Practice hitting and holding target notes with precision.',
    color: '#43E7FF',
    available: false,
  },
  {
    id: 'timing',
    icon: <Timer className="w-6 h-6" />,
    title: 'Timing Practice',
    description: 'Lock in your rhythm and phrasing against a fixed beat grid.',
    color: '#7D5CFF',
    available: false,
  },
  {
    id: 'silent',
    icon: <Eye className="w-6 h-6" />,
    title: 'Silent Visual',
    description: 'Play through a song pattern visually, without mic input.',
    color: '#FF4FC3',
    available: false,
  },
  {
    id: 'phrase',
    icon: <Waves className="w-6 h-6" />,
    title: 'Phrase Practice',
    description: 'Focus on sustained vocal phrases and endurance.',
    color: '#B9FF66',
    available: false,
  },
];

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '255,255,255';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

export function TrainingScreen({ onBack, onStartTraining }: TrainingScreenProps) {
  return (
    <div className="game-screen mg-stage mg-stage-violet flex flex-col">
      <div className="mg-kit-layer mg-kit-layer--stage" aria-hidden />
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />

      <header className="mg-topbar shrink-0">
        <IconButton label="Back" variant="white" size="sm" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </IconButton>
        <div className="flex-1 min-w-0">
          <h2 className="mg-topbar-title !text-sm">Training bay</h2>
          <p className="mg-topbar-sub !normal-case !tracking-normal !text-[11px] !font-medium text-[#8BA0C8]">
            Skill drills (coming soon)
          </p>
        </div>
      </header>

      <div className="mg-scroll">
        {/* Hero */}
        <div className="pt-5 pb-4 text-center">
          <div
            className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mx-auto mb-4"
            style={{
              background: 'rgba(40, 80, 160, 0.3)',
              border: '1.5px solid rgba(100, 180, 255, 0.25)',
              boxShadow: '0 0 24px rgba(60, 120, 255, 0.2)',
            }}
          >
            <Mic className="w-7 h-7 text-[#80c8ff]" />
          </div>
          <h3
            className="text-2xl font-black uppercase text-white tracking-tight mb-2"
            style={{ fontFamily: 'var(--font-game, Orbitron, sans-serif)' }}
          >
            Sharpen Your Skills
          </h3>
          <p className="text-sm text-[#6B85B0] max-w-[260px] mx-auto leading-relaxed">
            Dedicated drill modes to improve pitch, timing, and vocal endurance.
          </p>
        </div>

        {/* Coming soon */}
        <div
          className="text-center py-2.5 px-4 rounded-full mb-5 mx-auto inline-flex items-center gap-2"
          style={{
            background: 'rgba(255,201,74,0.10)',
            border: '1px solid rgba(255,201,74,0.25)',
            color: '#FFC94A',
          }}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">All modes — Coming Soon</span>
        </div>

        {/* Mode cards */}
        <div className="space-y-3">
          {TRAINING_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => mode.available && onStartTraining?.(mode.id)}
              disabled={!mode.available}
              className="w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all backdrop-blur-sm"
              style={{
                background: `rgba(${hexToRgb(mode.color)},0.08)`,
                border: `1.5px solid rgba(${hexToRgb(mode.color)},0.22)`,
                opacity: mode.available ? 1 : 0.6,
                cursor: mode.available ? 'pointer' : 'default',
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `rgba(${hexToRgb(mode.color)},0.15)`,
                  border: `1px solid rgba(${hexToRgb(mode.color)},0.25)`,
                }}
              >
                <span style={{ color: mode.color }}>{mode.icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-black text-base text-white">{mode.title}</span>
                  {!mode.available && (
                    <span
                      className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,201,74,0.12)', color: '#FFC94A', border: '1px solid rgba(255,201,74,0.22)' }}
                    >
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B85B0] leading-snug">{mode.description}</p>
              </div>

              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mode.available ? mode.color : '#3A4870' }} />
            </button>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-5 mg-panel !animate-none">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#80c8ff] mb-1.5">Pro Tip</div>
          <p className="text-xs text-[#8BA0C8] leading-relaxed">
            Regular main runs are the best training right now. Focus on perfect gates and combo chains to improve your score multiplier.
          </p>
        </div>

        <div className="mt-4">
          <PrimaryButton variant="gold" size="md" fullWidth onClick={onBack}>
            Back to Home
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
