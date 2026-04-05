# Velocity UI — Phase 0 repository map (Pixi game UI)

## UI entry points

| Entry | Role |
|-------|------|
| `src/main.ts` | Boots `Application`, preloads `velocityUiArt`, constructs `GameUIManager`, wires `MainMenuScreen`, HUD, pause, game-over, settings, etc. |
| `src/ui/game/GameUIManager.ts` | Screen registry, show/hide, `IGameScreen` contract |

## Screen files (`src/ui/game/screens/`)

- `MainMenuScreen.ts` — portrait/landscape mission hub, hero, dock, tabs
- `InGameHUDScreen.ts` — gameplay HUD (score, level, alt/spd, vocal, pause)
- `PauseMenuScreen.ts`, `GameOverScreen.ts`, `LevelCompleteScreen.ts`
- `SettingsScreen.ts`, `LeaderboardScreen.ts`, `AchievementsScreen.ts`, `StoreScreen.ts`, `RewardsScreen.ts`

## Shared menu / shell (`src/ui/game/`)

- `menuPortrait/portraitMissionScreen.ts`, `menuLandscape/landscapeMainMenuUI.ts`
- `menuShared/*` — `commandDock`, `heroCommandLayout`, `modeFilterStrip`, `topStatusStripLayout`, `missionCardLayout`, `texturedPlates`, `heroAmbientAccents`, `fitLabelToWidth`, `missionRewardWell`, `menuLayoutNative`
- `menuLiveBackdrop.ts` — animated menu backdrop
- `kenneyNineSlice.ts`, `velocityUiArt.ts`, `velocityUiSlice.ts`, `velocityUiButtons.ts`, `velocityModalLayout.ts`, `velocityScreenShell.ts`
- `gameFlowBridge.ts` — HUD data, pause, run end hooks

## Tokens / theme

- `GameUITheme.ts` — `GAME_COLORS`, `GAME_FONTS`, `GAME_SIZES`, button/panel styles
- `menuPortrait/missionPortraitTokens.ts` — portrait palette/spacing
- `menuTextStyles.ts` — shared text helpers

## Motion / animation

- `menuShared/heroAmbientAccents.ts` — hero ambient tick (textures, light motion)
- `MainMenuScreen.ts` — forwards `heroAmbientTick` for landscape
- `menuLiveBackdrop.ts` — backdrop `tick(time)`
- Per-component: scale press on dock slots, Kenney buttons, HUD pause

## Icons / assets

- `public/kenney-ui-pack/`, `public/kenney-ui-scifi/`, `public/oga-dock-icons/`, `public/custom-ui/` (as referenced in `velocityUiArt.ts`)
- `menuPortrait/missionPortraitIcons.ts`, `menuFrontMenuIcons.ts`

## Config / delivery

- `vite.config.ts` — Vite 6, `BASE_URL`, env `define` (review for unused keys)
- `package.json` — no Next.js; static `vite build` → `dist/` (Vercel: static SPA)

## Barrel files

- No `index.ts` barrel re-exports under `src/ui` (direct imports).

## Duplication / dead code (initial)

- `GameUIComponents.createMenuBackdrop` vs `menuLiveBackdrop` — parallel backdrop paths; menus prefer live backdrop where wired.
- Vector fallbacks remain where textures missing (intentional).

## Hotspots

- `main.ts` `showInitFailure` used `innerHTML` with interpolated strings (XSS if error text ever user-controlled).
- `menuLiveBackdrop` used `BlurFilter` on large sprites (GPU cost; conflicts with “no blur to fake quality” mandate).
- `GameUIComponents.createGameButton` fired `onClick` on `pointerdown` (weak mobile ergonomics vs release-to-confirm).

## Preservation map (summary)

| Area | Verdict |
|------|---------|
| Kenney nine-slice shell, sci-fi glass chrome | Keep; reduce blur-only polish |
| `commandDock` / `modeFilterStrip` structure | Keep; refine tactility |
| Hero + top strip layout system | Keep; incremental refines |
| HUD hierarchy comments + split labels | Keep; strengthen numeral stroke/readability |
| Game flow / screen list | Keep |

## Rewrite / risk (tracked)

- Tactile: unify press + release + cancel on primary interactables (medium risk: feel change only).
- HUD: add controlled strokes behind gameplay numbers (low risk).
- Security: sanitize init failure UI; trim unused `define` (low risk).
