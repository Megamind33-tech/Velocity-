# Velocity UI Asset Sources

Primary UI family uses **Kenney** assets already bundled under `public/kenney-ui-pack/` (CC0).

## Kenney UI Pack — Sci-Fi (`public/kenney-ui-scifi/`, CC0)

Mirrored subset from OpenGameArt: [UI Pack - Sci-Fi](https://opengameart.org/content/ui-pack-sci-fi) (same Kenney CC0 release as kenney.nl). Used for **premium chrome** on the main menu:

- **Mode tab strip** — `scifi_panel_rectangle_screws` track; tab cells use `scifi_button_rectangle` / `scifi_button_rectangle_depth`
- **Mission list bay** — layered `scifi_panel_glass` + `scifi_panel_glass_screws`
- **Mission / event card faces** — glass fill + `scifi_panel_rectangle_screws` frame (role-tinted)
- **Dock underlay** — `scifi_panel_rectangle_screws` (replaces flat `panel_fill` when loaded)
- **Missions dock icon** — `crosshair_color_a.png` from the same pack (clear target read at small size)

`License.txt` in that folder is copied from the original zip.

## Command dock icons (`public/oga-dock-icons/`, CC0 — OpenGameArt.org)

Normalized **128×128** PNGs (cropped + scaled from originals). Dock code uses **light tint** on sprites so full-color art stays readable (see `menuIconPreserveColor` in `commandDock.ts`).

| File | OpenGameArt | Author | Original |
|------|-------------|--------|----------|
| `home.png` | [2D House PNG + SVG](https://opengameart.org/content/2d-house-png-svg) | Belohlavek | `house_big.png` |
| `hangar_plane.png` | [Free Plane Sprite](https://opengameart.org/content/free-plane-sprite) | pzUH | `png/Plane/Fly (1).png` |
| `store.png` | [Store button (Shop button icon)](https://opengameart.org/content/store-button-shop-button-icon) | ElSantoTiago | `store.svg` (rasterized) |

**Missions** dock glyph: Kenney Sci-Fi pack (`kenney-ui-scifi/…/crosshair_color_a.png`) — see Sci-Fi section above.

All listed OGA entries are CC0 per their pages.

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
Primary chrome remains **Kenney UI Pack**. Command-dock **glyphs** are a separate **CC0 OpenGameArt** set (`oga-dock-icons/`) chosen for readable semantics (house, reticle, plane, shop). If a slot is missing at runtime, `commandDock` still falls back to vector `draw` paths.

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
