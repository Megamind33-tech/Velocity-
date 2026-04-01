import React, { useState } from 'react';
import { ArrowLeft, Mic, Music, Gamepad2, Eye, ChevronRight, Info } from 'lucide-react';
import { IconButton } from '../components/ui/IconButton';
import { BACKGROUND_MUSIC } from '../lib/backgroundMusic';

interface SettingsScreenProps {
  selectedBackgroundMusicId: string;
  onBackgroundMusicChange: (id: string) => void;
  onBack: () => void;
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-4 border-b border-[rgba(255,255,255,0.05)] last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-[#F5F7FC]">{label}</div>
        {description && <div className="text-xs text-[#4A5068] mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none"
      style={{
        background: value ? '#43E7FF' : 'var(--bg-elevated)',
        boxShadow: value ? '0 0 12px rgba(67,231,255,0.4)' : 'none',
        border: value ? '1px solid rgba(67,231,255,0.5)' : '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200"
        style={{
          background: value ? '#07090E' : '#4A5068',
          left: value ? 'calc(100% - 22px)' : '2px',
        }}
      />
    </button>
  );
}

export function SettingsScreen({
  selectedBackgroundMusicId,
  onBackgroundMusicChange,
  onBack,
}: SettingsScreenProps) {
  const [pitchGuide, setPitchGuide] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showMusicPicker, setShowMusicPicker] = useState(false);

  const selectedMusic = BACKGROUND_MUSIC.find(m => m.id === selectedBackgroundMusicId);

  return (
    <div className="game-screen mg-stage flex flex-col">
      <div className="mg-kit-layer mg-kit-layer--stage" aria-hidden />
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />
      <header className="mg-topbar shrink-0">
        <IconButton label="Back" variant="surface" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </IconButton>
        <div className="flex-1 min-w-0">
          <h2 className="mg-topbar-title !text-sm">Systems</h2>
          <p className="mg-topbar-sub !normal-case !tracking-normal !text-[11px] !font-medium text-[#A7B0C6]">
            Audio, input, accessibility
          </p>
        </div>
      </header>

      <div className="mg-scroll space-y-5">

        {/* Microphone & Input */}
        <section className="mt-4">
          <SectionLabel icon={<Mic className="w-4 h-4 text-[#43E7FF]" />} label="Microphone & Input" />
          <div
            className="rounded-2xl px-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <SettingRow label="Pitch Guide Meter" description="Show real-time pitch deviation overlay during play">
              <Toggle value={pitchGuide} onChange={setPitchGuide} />
            </SettingRow>
            <SettingRow label="Mic Calibration" description="Test and adjust microphone sensitivity">
              <button
                className="flex items-center gap-1.5 text-xs font-bold text-[#43E7FF] bg-[rgba(67,231,255,0.08)] border border-[rgba(67,231,255,0.20)] px-3 py-2 rounded-lg transition-colors hover:bg-[rgba(67,231,255,0.14)]"
              >
                Open <ChevronRight className="w-3 h-3" />
              </button>
            </SettingRow>
          </div>
        </section>

        {/* Audio */}
        <section>
          <SectionLabel icon={<Music className="w-4 h-4 text-[#7D5CFF]" />} label="Audio" />
          <div
            className="rounded-2xl px-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <SettingRow label="Background Music" description={selectedMusic?.title ?? 'None'}>
              <button
                onClick={() => setShowMusicPicker(!showMusicPicker)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#7D5CFF] bg-[rgba(125,92,255,0.08)] border border-[rgba(125,92,255,0.20)] px-3 py-2 rounded-lg"
              >
                Change <ChevronRight className={`w-3 h-3 transition-transform ${showMusicPicker ? 'rotate-90' : ''}`} />
              </button>
            </SettingRow>

            {showMusicPicker && (
              <div className="pb-3 space-y-1.5">
                <button
                  onClick={() => { onBackgroundMusicChange('none'); setShowMusicPicker(false); }}
                  className="w-full text-left px-3 py-3 rounded-xl transition-colors text-sm font-bold"
                  style={selectedBackgroundMusicId === 'none'
                    ? { background: 'rgba(125,92,255,0.10)', color: '#F5F7FC', border: '1px solid rgba(125,92,255,0.25)' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid transparent' }
                  }
                >
                  None
                </button>
                {BACKGROUND_MUSIC.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { onBackgroundMusicChange(m.id); setShowMusicPicker(false); }}
                    className="w-full text-left px-3 py-3 rounded-xl transition-colors"
                    style={selectedBackgroundMusicId === m.id
                      ? { background: 'rgba(125,92,255,0.10)', border: '1px solid rgba(125,92,255,0.25)' }
                      : { background: 'var(--bg-elevated)', border: '1px solid transparent' }
                    }
                  >
                    <div className="text-sm font-bold text-[#F5F7FC]">{m.title}</div>
                    <div className="text-xs text-[#4A5068]">{m.artist}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Gameplay */}
        <section>
          <SectionLabel icon={<Gamepad2 className="w-4 h-4 text-[#FF4FC3]" />} label="Gameplay" />
          <div
            className="rounded-2xl px-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <SettingRow label="Haptic Feedback" description="Vibration on gates and events (mobile)">
              <Toggle value={haptics} onChange={setHaptics} />
            </SettingRow>
          </div>
        </section>

        {/* Accessibility */}
        <section>
          <SectionLabel icon={<Eye className="w-4 h-4 text-[#B9FF66]" />} label="Accessibility" />
          <div
            className="rounded-2xl px-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <SettingRow label="Reduce Motion" description="Disable non-essential animations">
              <Toggle value={reduceMotion} onChange={setReduceMotion} />
            </SettingRow>
          </div>
        </section>

        {/* App info */}
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <Info className="w-4 h-4 text-[#4A5068] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-black text-[#F5F7FC] mb-0.5">Velocity</div>
            <div className="text-xs text-[#4A5068]">Vocal Performance Challenge · v1.0</div>
            <div className="text-xs text-[#4A5068] mt-0.5">Pitch detection via Web Audio API</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[#A7B0C6]">{label}</span>
      <div className="flex-1 h-px bg-[rgba(255,255,255,0.05)]" />
    </div>
  );
}
