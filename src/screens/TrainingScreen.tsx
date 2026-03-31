import React from 'react';
import { ArrowLeft, Mic, Eye, Timer, Waves, ChevronRight } from 'lucide-react';
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
    description: 'Practice hitting and holding target notes with precision. Builds muscle memory for vocal accuracy.',
    color: '#43E7FF',
    bg: 'rgba(67,231,255,0.07)',
    border: 'rgba(67,231,255,0.20)',
    available: false,
  },
  {
    id: 'timing',
    icon: <Timer className="w-6 h-6" />,
    title: 'Timing Practice',
    description: 'Lock in your rhythm and phrasing against a fixed beat grid. Improve gate timing precision.',
    color: '#7D5CFF',
    bg: 'rgba(125,92,255,0.07)',
    border: 'rgba(125,92,255,0.20)',
    available: false,
  },
  {
    id: 'silent',
    icon: <Eye className="w-6 h-6" />,
    title: 'Silent Visual',
    description: 'Play through a song pattern visually, without microphone input. Study gate sequences.',
    color: '#FF4FC3',
    bg: 'rgba(255,79,195,0.07)',
    border: 'rgba(255,79,195,0.20)',
    available: false,
  },
  {
    id: 'phrase',
    icon: <Waves className="w-6 h-6" />,
    title: 'Phrase Practice',
    description: 'Focus on sustained vocal phrases. Train endurance and consistency over longer note runs.',
    color: '#B9FF66',
    bg: 'rgba(185,255,102,0.07)',
    border: 'rgba(185,255,102,0.20)',
    available: false,
  },
];

export function TrainingScreen({ onBack, onStartTraining }: TrainingScreenProps) {
  return (
    <div className="game-screen stage-bg-violet flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0 border-b border-[rgba(255,255,255,0.06)]">
        <IconButton label="Back" variant="surface" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </IconButton>
        <div className="flex-1">
          <h2 className="font-display text-lg font-black uppercase tracking-tight text-[#F5F7FC]">Training</h2>
          <p className="text-[10px] text-[#4A5068] font-bold uppercase tracking-widest">Skill Modes</p>
        </div>
      </header>

      <div className="game-screen-scroll px-4 pb-6">
        {/* Intro */}
        <div className="pt-5 pb-4 text-center">
          <div
            className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(125,92,255,0.12)', border: '1px solid rgba(125,92,255,0.25)', boxShadow: '0 0 24px rgba(125,92,255,0.2)' }}
          >
            <Mic className="w-7 h-7 text-[#7D5CFF]" />
          </div>
          <h3 className="font-display text-2xl font-black uppercase text-[#F5F7FC] tracking-tight mb-2">
            Sharpen Your Skills
          </h3>
          <p className="text-sm text-[#4A5068] max-w-[260px] mx-auto leading-relaxed">
            Dedicated drill modes to improve pitch, timing, and vocal endurance outside of main runs.
          </p>
        </div>

        {/* Coming soon badge */}
        <div
          className="text-center py-2.5 px-4 rounded-xl mb-5 mx-auto inline-flex items-center gap-2"
          style={{
            background: 'rgba(255,201,74,0.08)',
            border: '1px solid rgba(255,201,74,0.20)',
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
              className="w-full text-left p-4 rounded-2xl border flex items-center gap-4 transition-all"
              style={{
                background: mode.bg,
                borderColor: mode.border,
                opacity: mode.available ? 1 : 0.6,
                cursor: mode.available ? 'pointer' : 'default',
              }}
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `rgba(${hexToRgb(mode.color)},0.12)`, border: `1px solid ${mode.border}` }}
              >
                <span style={{ color: mode.color }}>{mode.icon}</span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-black text-base text-[#F5F7FC]">{mode.title}</span>
                  {!mode.available && (
                    <span
                      className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,201,74,0.12)', color: '#FFC94A', border: '1px solid rgba(255,201,74,0.22)' }}
                    >
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4A5068] leading-snug">{mode.description}</p>
              </div>

              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mode.available ? mode.color : 'var(--text-disabled)' }} />
            </button>
          ))}
        </div>

        {/* Tip */}
        <div
          className="mt-5 p-4 rounded-2xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#43E7FF] mb-1.5">Pro Tip</div>
          <p className="text-xs text-[#A7B0C6] leading-relaxed">
            Regular main runs are the best training right now. Focus on perfect gates and combo chains to improve your score multiplier.
          </p>
        </div>

        <div className="mt-4">
          <PrimaryButton variant="violet" size="md" fullWidth onClick={onBack}>
            Back to Home
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// Helper: convert hex to "r,g,b" string for rgba()
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '255,255,255';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
