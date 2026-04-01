import React from 'react';
import {
  Play,
  ListChecks,
  Users,
  Backpack,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { Screen } from '../../App';
import type { PlayerProfile } from '../../lib/profile';

export type FantasyNavKey = 'play' | 'tasks' | 'friends' | 'inventory';

interface FantasyGameShellProps {
  profile: PlayerProfile | null;
  activeNav?: FantasyNavKey;
  onNav?: (key: FantasyNavKey) => void;
  onOpenSettings?: () => void;
  showBottomNav?: boolean;
  children: React.ReactNode;
}

const NAV: { key: FantasyNavKey; label: string; icon: LucideIcon }[] = [
  { key: 'play', label: 'Play', icon: Play },
  { key: 'tasks', label: 'Tasks', icon: ListChecks },
  { key: 'friends', label: 'Friends', icon: Users },
  { key: 'inventory', label: 'Inventory', icon: Backpack },
];

function formatHud(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.floor(n / 1000)}k`;
  return n.toLocaleString();
}

export function FantasyGameShell({
  profile,
  activeNav = 'play',
  onNav,
  onOpenSettings,
  showBottomNav = true,
  children,
}: FantasyGameShellProps) {
  const gold = profile ? Math.max(0, Math.floor(profile.totalScore / 100)) : 0;
  const gems = profile ? Math.max(0, profile.level * 10 + Math.floor(profile.xp / 500)) : 0;
  const stars = profile
    ? Math.min(999, profile.challenges.filter((c) => c.completed).length + (profile.songsPlayed > 0 ? 1 : 0))
    : 0;

  return (
    <div className="game-screen fl-shell flex flex-col">
      <div className="fl-scene" aria-hidden>
        <div className="fl-stars" />
        <div className="fl-castle" />
        <div className="fl-mountains" />
      </div>

      <header className="fl-topbar">
        <div className="fl-currency-row min-w-0 flex-1">
          <div className="fl-currency-pill">
            <span className="fl-currency-icon fl-currency-icon--gold" aria-hidden>
              $
            </span>
            <span className="fl-currency-value tabular-nums">{formatHud(gold)}</span>
          </div>
          <div className="fl-currency-pill">
            <span className="fl-currency-icon fl-currency-icon--gem" aria-hidden>
              ◆
            </span>
            <span className="fl-currency-value tabular-nums">{formatHud(gems)}</span>
          </div>
          <div className="fl-currency-pill">
            <span className="fl-currency-icon fl-currency-icon--star" aria-hidden>
              ★
            </span>
            <span className="fl-currency-value tabular-nums">{formatHud(stars)}</span>
          </div>
        </div>
        {onOpenSettings && (
          <button
            type="button"
            className="fl-icon-btn shrink-0"
            onClick={onOpenSettings}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" strokeWidth={2.2} />
          </button>
        )}
      </header>

      <div className="fl-content">{children}</div>

      {showBottomNav && onNav && (
        <nav className="fl-bottom-nav" aria-label="Main">
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = activeNav === key;
            return (
              <button
                key={key}
                type="button"
                className={`fl-nav-item${active ? ' fl-nav-item--active' : ''}`}
                onClick={() => onNav(key)}
              >
                <span className="fl-nav-ring">
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span className="fl-nav-label">{label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export function mapFantasyNavToScreen(key: FantasyNavKey): Screen {
  switch (key) {
    case 'play':
      return 'world-select';
    case 'tasks':
      return 'profile';
    case 'friends':
      return 'leaderboard';
    case 'inventory':
      return 'training';
    default:
      return 'home';
  }
}
