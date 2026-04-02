import React, { useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Lock, Check } from 'lucide-react';
import { AIRCRAFT_MODELS, AircraftModel } from '../lib/aircraft';
import { PrimaryButton } from '../components/ui/PrimaryButton';

interface AircraftSelectScreenProps {
  selectedAircraftId: string;
  playerLevel: number;
  onSelect: (aircraftId: string) => void;
  onBack: () => void;
}

function AircraftPreview({ model, isSelected, isLocked, size = 120 }: {
  model: AircraftModel;
  isSelected: boolean;
  isLocked: boolean;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef(performance.now());

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = size;
    const h = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, w, h);

    const time = (performance.now() - startTimeRef.current) / 1000;

    ctx.save();
    ctx.translate(w / 2, h / 2);

    if (isLocked) {
      ctx.globalAlpha = 0.3;
    }

    model.draw(ctx, 0, isSelected, '67,231,255', time);

    ctx.restore();

    animRef.current = requestAnimationFrame(draw);
  }, [model, isSelected, isLocked, size]);

  useEffect(() => {
    startTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="pointer-events-none"
    />
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  helicopter: 'Helicopter',
  jet: 'Fighter Jet',
  prop: 'Prop Plane',
  stealth: 'Stealth',
  drone: 'Drone',
};

const CATEGORY_COLORS: Record<string, string> = {
  helicopter: '#43E7FF',
  jet: '#FF6B6B',
  prop: '#FFC94A',
  stealth: '#7D5CFF',
  drone: '#B9FF66',
};

export function AircraftSelectScreen({
  selectedAircraftId,
  playerLevel,
  onSelect,
  onBack,
}: AircraftSelectScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="game-screen mg-stage flex flex-col">
      <div className="mg-kit-layer mg-kit-layer--tournament" aria-hidden />
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />

      <header className="mg-topbar shrink-0 flex-col items-stretch !gap-1">
        <h1 className="mg-topbar-title">Aircraft Hangar</h1>
        <p className="mg-topbar-sub !normal-case !tracking-normal !text-xs !font-medium text-[#A7B0C6]">
          Choose your aircraft — unlock more as you level up.
        </p>
      </header>

      <div className="mg-scroll flex-1 flex flex-col gap-4">
        {/* Carousel nav */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => scroll('left')}
            className="mg-action-icon w-10 h-10 rounded-xl"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-[#A7B0C6]" />
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#7A8399]">
            {AIRCRAFT_MODELS.length} Aircraft Available
          </span>
          <button
            onClick={() => scroll('right')}
            className="mg-action-icon w-10 h-10 rounded-xl"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-[#A7B0C6]" />
          </button>
        </div>

        {/* Aircraft grid */}
        <div
          ref={scrollRef}
          className="grid grid-cols-2 gap-3 px-1"
        >
          {AIRCRAFT_MODELS.map((model) => {
            const isSelected = model.id === selectedAircraftId;
            const isLocked = model.unlockLevel > playerLevel;
            const catColor = CATEGORY_COLORS[model.category] || '#43E7FF';

            return (
              <div
                key={model.id}
                className={`mg-panel !p-3 relative transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-[#43E7FF] shadow-[0_0_20px_rgba(67,231,255,0.3)]'
                    : isLocked
                      ? '!opacity-55'
                      : 'cursor-pointer active:scale-[0.97]'
                }`}
                onClick={() => !isLocked && onSelect(model.id)}
                role="button"
                tabIndex={isLocked ? -1 : 0}
                onKeyDown={(e) => {
                  if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelect(model.id);
                  }
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#43E7FF] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-[#07090E]" strokeWidth={3} />
                  </div>
                )}

                {isLocked && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[rgba(7,9,14,0.6)]">
                    <div className="text-center">
                      <Lock className="w-6 h-6 text-[#FF6B6B] mx-auto mb-1" />
                      <span className="text-[10px] font-black text-[#FF6B6B] uppercase tracking-wider">
                        Level {model.unlockLevel}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-center mb-2">
                  <AircraftPreview
                    model={model}
                    isSelected={isSelected}
                    isLocked={isLocked}
                    size={100}
                  />
                </div>

                <div className="text-center">
                  <h3 className="font-display text-sm font-black text-[#F5F7FC] tracking-tight leading-tight">
                    {model.name}
                  </h3>
                  <span
                    className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{
                      color: catColor,
                      background: `${catColor}18`,
                      border: `1px solid ${catColor}30`,
                    }}
                  >
                    {CATEGORY_LABELS[model.category] || model.category}
                  </span>
                  <p className="text-[10px] text-[#7A8399] mt-1.5 leading-snug">
                    {model.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mg-footer-bar shrink-0">
        <button type="button" onClick={onBack} className="mg-btn-back">
          ← Back
        </button>
        <PrimaryButton variant="cyan" size="sm" onClick={onBack}>
          Done
        </PrimaryButton>
      </footer>
    </div>
  );
}
