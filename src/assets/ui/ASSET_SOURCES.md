# Velocity UI Asset Sources

Primary UI family uses **Kenney** assets already bundled under `public/kenney-ui-pack/` (CC0).

## Families wired by code
- `Kenney UI Pack` (`PNG/Blue|Grey|Yellow|Red|Extra`) via `src/ui/game/velocityUiArt.ts`
- `Kenney UI Pack` font (`Kenney Future`) via `public/kenney-ui-pack/Font/`

## Planned family slots (normalized structure)
- `src/assets/ui/kenney/buttons/`
- `src/assets/ui/kenney/panels/`
- `src/assets/ui/kenney/icons/`
- `src/assets/ui/kenney/input/`
- `src/assets/ui/backgrounds/`
- `src/assets/ui/rewards/`
- `src/assets/ui/fallback-icons/` (reserved for single fallback family only)

## Current fallback policy
No non-Kenney icon fallback is active in the main menu. If a missing slot appears later,
use one family only (Lucide OR Bootstrap Icons OR Font Awesome), then visually normalize.
