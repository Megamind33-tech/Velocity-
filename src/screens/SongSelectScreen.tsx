import React, { useState } from 'react';
import { ArrowLeft, Music, Check, Zap, Search } from 'lucide-react';
import { SONGS } from '../lib/songs';
import { PlayerProfile } from '../lib/profile';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { IconButton } from '../components/ui/IconButton';

interface SongSelectScreenProps {
  selectedSongId: string;
  profile: PlayerProfile | null;
  onSelect: (songId: string) => void;
  onBack: () => void;
}

const DIFF_COLORS = {
  easy:   { text: '#B9FF66', bg: 'rgba(185,255,102,0.10)', border: 'rgba(185,255,102,0.22)' },
  medium: { text: '#FFC94A', bg: 'rgba(255,201,74,0.10)',  border: 'rgba(255,201,74,0.22)' },
  hard:   { text: '#FF6B6B', bg: 'rgba(255,107,107,0.10)', border: 'rgba(255,107,107,0.22)' },
};

export function SongSelectScreen({ selectedSongId, profile, onSelect, onBack }: SongSelectScreenProps) {
  const [pendingId, setPendingId] = useState(selectedSongId);
  const [query, setQuery] = useState('');

  const filteredSongs = query
    ? SONGS.filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
      )
    : SONGS;

  const confirmSelection = () => {
    onSelect(pendingId);
    onBack();
  };

  const pendingSong = SONGS.find(s => s.id === pendingId);
  const pendingDiff = pendingSong?.difficulty;
  const pendingDiffColor = pendingDiff ? DIFF_COLORS[pendingDiff] : null;

  return (
    <div className="game-screen stage-bg-violet flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0 border-b border-[rgba(255,255,255,0.06)]">
        <IconButton label="Back" variant="surface" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </IconButton>
        <div className="flex-1">
          <h2 className="font-display text-lg font-black uppercase tracking-tight text-[#F5F7FC]">Select Track</h2>
          <p className="text-[10px] text-[#4A5068] font-bold uppercase tracking-widest">
            {SONGS.length} tracks available
          </p>
        </div>
      </header>

      {/* ── Search ── */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-3 bg-[#111624] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-[#4A5068] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tracks..."
            className="flex-1 bg-transparent text-sm text-[#F5F7FC] placeholder-[#4A5068] outline-none font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#4A5068] hover:text-[#A7B0C6] text-xs font-bold">✕</button>
          )}
        </div>
      </div>

      {/* ── Track List ── */}
      <div className="game-screen-scroll px-4 pb-4 space-y-2.5">

        {/* Endless Run option */}
        {!query && (
          <>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4A5068] pt-2 pb-1">Free Mode</div>
            <button
              onClick={() => setPendingId('none')}
              className="w-full text-left p-4 rounded-2xl border transition-all active:scale-[0.98]"
              style={pendingId === 'none'
                ? { background: 'rgba(67,231,255,0.08)', borderColor: 'rgba(67,231,255,0.35)' }
                : { background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }
              }
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={pendingId === 'none'
                    ? { background: 'rgba(67,231,255,0.15)', boxShadow: '0 0 16px rgba(67,231,255,0.25)' }
                    : { background: 'var(--bg-elevated)' }
                  }
                >
                  <Zap className={`w-6 h-6 ${pendingId === 'none' ? 'text-[#43E7FF]' : 'text-[#4A5068]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-black text-base ${pendingId === 'none' ? 'text-[#F5F7FC]' : 'text-[#A7B0C6]'}`}>
                    Endless Run
                  </div>
                  <div className="text-xs text-[#4A5068] mt-0.5">Procedural generation · Pitch mode</div>
                  <span
                    className="diff-badge mt-1.5"
                    style={{ background: 'rgba(167,176,198,0.08)', color: '#A7B0C6', border: '1px solid rgba(167,176,198,0.15)' }}
                  >
                    Zen
                  </span>
                </div>
                {pendingId === 'none' && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#43E7FF', boxShadow: '0 0 12px rgba(67,231,255,0.5)' }}
                  >
                    <Check className="w-4 h-4 text-[#07090E]" />
                  </div>
                )}
              </div>
            </button>
          </>
        )}

        {/* Song tracks */}
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4A5068] pt-2 pb-1">
          {query ? `Results (${filteredSongs.length})` : 'Tracks'}
        </div>

        {filteredSongs.length === 0 && (
          <div className="text-center py-10 text-[#4A5068] text-sm">No tracks match your search.</div>
        )}

        {filteredSongs.map(song => {
          const isSelected = pendingId === song.id;
          const dc = DIFF_COLORS[song.difficulty];
          const bestKey = `${song.id}_${song.difficulty}`;
          const best = profile?.highScores[bestKey] ?? 0;

          return (
            <button
              key={song.id}
              onClick={() => setPendingId(song.id)}
              className="w-full text-left p-4 rounded-2xl border transition-all active:scale-[0.98]"
              style={isSelected
                ? { background: 'rgba(67,231,255,0.08)', borderColor: 'rgba(67,231,255,0.35)' }
                : { background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }
              }
            >
              <div className="flex items-center gap-4">
                {/* Album art placeholder */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
                  style={isSelected
                    ? { background: `linear-gradient(135deg, ${dc.bg}, rgba(67,231,255,0.08))`, border: `1px solid ${dc.border}` }
                    : { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }
                  }
                >
                  <Music className={`w-6 h-6 ${isSelected ? '' : 'text-[#4A5068]'}`}
                    style={isSelected ? { color: dc.text } : {}} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className={`font-black text-base leading-tight ${isSelected ? 'text-[#F5F7FC]' : 'text-[#A7B0C6]'}`}>
                    {song.title}
                  </div>
                  <div className="text-xs text-[#4A5068] mt-0.5">{song.artist} · {song.tempo} BPM</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="diff-badge"
                      style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}
                    >
                      {song.difficulty}
                    </span>
                    {best > 0 && (
                      <span className="text-[10px] text-[#4A5068] font-bold">
                        Best <span className="text-[#A7B0C6] font-black score-display">{best.toLocaleString()}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Check indicator */}
                {isSelected && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#43E7FF', boxShadow: '0 0 12px rgba(67,231,255,0.5)' }}
                  >
                    <Check className="w-4 h-4 text-[#07090E]" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Confirm Footer ── */}
      <div className="px-4 pb-4 pt-3 border-t border-[rgba(255,255,255,0.06)] shrink-0 bg-[rgba(7,9,14,0.9)] backdrop-blur-xl">
        {pendingSong && pendingDiffColor ? (
          <div className="flex items-center gap-3 mb-3">
            <Music className="w-4 h-4 shrink-0" style={{ color: pendingDiffColor.text }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-[#F5F7FC] truncate">{pendingSong.title}</div>
              <div className="text-[10px] text-[#4A5068]">{pendingSong.artist} · {pendingSong.tempo} BPM</div>
            </div>
            <span
              className="diff-badge shrink-0"
              style={{ background: pendingDiffColor.bg, color: pendingDiffColor.text, border: `1px solid ${pendingDiffColor.border}` }}
            >
              {pendingSong.difficulty}
            </span>
          </div>
        ) : pendingId === 'none' ? (
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-4 h-4 text-[#43E7FF]" />
            <div className="text-sm font-black text-[#F5F7FC]">Endless Run</div>
          </div>
        ) : null}
        <PrimaryButton variant="cyan" size="md" fullWidth onClick={confirmSelection}
          icon={<Check className="w-4 h-4" />}>
          Confirm Selection
        </PrimaryButton>
      </div>
    </div>
  );
}
