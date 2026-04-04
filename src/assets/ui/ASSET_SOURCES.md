# Velocity UI Asset Sources

Primary UI family uses **Kenney** assets already bundled under `public/kenney-ui-pack/` (CC0).

## Command dock icons (`public/kenney-dock-icons/`, CC0)

Semantic bottom-nav glyphs (white silhouettes — tinted in code like other dock sprites):

| File | Source |
|------|--------|
| `home.png`, `target.png`, `cart.png` | [Kenney Game Icons](https://kenney.nl/assets/game-icons) — `PNG/White/1x/` |
| `hangar_plane.png` | Cropped `planeBlue1` region from [Kenney Tappy Plane](https://kenney.nl/assets/tappy-plane) `Spritesheet/sheet.png`, resized to 128×128 for UI |

Shipped `LICENSE-*.txt` in that folder are copies from the original zips.

## Families wired by code
- `Kenney UI Pack` (`PNG/Blue|Grey|Yellow|Red|Extra`) via `src/ui/game/velocityUiArt.ts`
  - Mission list rows (playable + locked faces) use **`panel_fill` + `panel_frame`** nine-slice via `kenneyMissionCardFace()` in `kenneyLandscapeWidgets.ts` when preloaded — vector fallback only if textures fail.
  - Mode filter strip + command dock use **`kenneyTabTrack`** + **`kenneyDockBar`** underlays where applicable (`menuShared/modeFilterStrip.ts`, `menuShared/commandDock.ts`).
- `Kenney UI Pack` font (`Kenney Future`) via `public/kenney-ui-pack/Font/`
- Optional external custom packs (runtime fallback-safe slots) via `src/ui/game/velocityUiArt.ts`:
  - `game-rank-icons-vol-9` → `custom-ui/rank/rank_prestige.png`
  - `game-rank-icons-vol-3` → `custom-ui/rank/rank_elite.png`
  - `ui-game-elements-vol-9` → `custom-ui/badges/badge_reward.png`, `custom-ui/badges/badge_locked.png`
  - `ui-game-frames-vol-8` → `custom-ui/frames/frame_premium.png`, `custom-ui/frames/frame_locked.png`

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

## Curated files in-repo (normalized)
Shipped under `public/custom-ui/` after resize (max side 384 rank/frames, 256 badges):
- `rank/rank_prestige.png` ← `game-rank-icons-vol-9` / `PNG/ri_5_14.png`
- `rank/rank_elite.png` ← `game-rank-icons-vol-3` / `png/ri_3_19.png`
- `badges/badge_reward.png` ← `ui-game-elements-vol-9` / `PNG/uge_280124_4_42.png`
- `badges/badge_locked.png` ← `ui-game-elements-vol-9` / `PNG/uge_280124_4_14.png`
- `frames/frame_premium.png` ← `ui-game-frames-vol-8` / `png/ugf_8_13.png` (low-sat, bright — CTA emphasis)
- `frames/frame_locked.png` ← `ui-game-frames-vol-8` / `png/ugf_8_28.png` (high-sat ornate — withheld)

## Role discipline for optional custom pack assets
- `rank_prestige` / `rank_elite`:
  - **Use:** top metric prestige modules (`BEST`, `PREMIUM`) only.
  - **Do not use:** generic mission rows, tabs, or bottom nav.
- `badge_locked`:
  - **Use:** locked/elite-locked mission emblem center only.
  - **Do not use:** playable/claimable cards.
- `badge_reward`:
  - **Use:** reward callout gem in mission cards.
  - **Do not use:** tab/nav decoration.
- `frame_premium`:
  - **Use:** high-authority action dock framing (`CLAIM`/premium action emphasis).
  - **Do not use:** all buttons globally.
- `frame_locked`:
  - **Use:** withheld locked action dock framing.
  - **Do not use:** unlocked action surfaces.
