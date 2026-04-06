# Level 1 city parallax — plan, audit, research, implementation

## 1) Goal

Use the **exact** OpenGameArt asset [City Parallax pixel art](https://opengameart.org/content/city-parallax-pixel-art) (CC0, Gustavo Saraiva) for **level 1** only, with **fixed-player / moving-world** scroll (`scrollX` in `worldScroll.ts`). No mixing of layer order or filenames with guesswork.

## 2) Audit (problems before fix)

| Issue | Detail |
|-------|--------|
| Procedural sky only | `ensureParallax()` built textures in code; no authored pixel parallax for L1. |
| Tile size | OGA strips are **240×135**; default `TilingSprite` used scale 1 — art would be tiny or wrong without `tileScale`. |
| Layer count | City zip has **4** layers; default theme used **3**. System must support variable layer count + per-theme speed tables. |
| Pixel art | Linear filtering blurs pixel art; need **`nearest`** on texture sources. |
| Theme switch | `parallaxReady` blocked reload when changing level 2 → 1; needed **theme key** + re-init. |

## 3) Research (verified, not guessed)

- **OGA page:** CC0, description **240×135 px** per layer.
- **Downloaded `City.zip`** and listed contents:
  - `City/Background 1.png` — 240×135 RGBA
  - `City/BG.png` — 240×135 RGBA
  - `City/Middle.png` — 240×135 RGBA
  - `City/Foreground.png` — 240×135 RGBA
- **Parallax order:** back → front = Background 1 → BG → Middle → Foreground (farther layers use **lower** scroll multipliers vs `scrollX`).
- **Pixi v8:** `TilingSprite` supports `tileScale`; `texture.source.scaleMode = 'nearest'` for crisp pixels.

## 4) Implementation (accurate mapping)

| Repo file | Zip original |
|-----------|--------------|
| `public/oga-parallax-city/layer_background_1.png` | `Background 1.png` |
| `public/oga-parallax-city/layer_bg.png` | `BG.png` |
| `public/oga-parallax-city/layer_middle.png` | `Middle.png` |
| `public/oga-parallax-city/layer_foreground.png` | `Foreground.png` |

- **`src/game/cityParallaxAssets.ts`** — URLs, `loadCityParallaxTextures()`, `applyNearestFilter`.
- **`RENDERING.LEVEL1_CITY_PARALLAX_LAYERS`** — four `{ speed, offset, depth }` entries (speeds increase toward foreground).
- **`RENDERING.LEVEL1_CITY_TILE_HEIGHT_PX`** = **135** (matches `file` / PIL on zip).
- **`ParallaxSystem`** — `ParallaxInitOptions`: `layersConfig`, `tilePixelHeight` → `tileScale = screenHeight / 135`; `resizeToScreen` updates `tileScale`.
- **`main.ts`** — `ensureParallax(levelId)`: if `levelId === 1`, load city textures + options; else procedural sky. **`parallaxThemeKey`** forces re-init when switching levels.

## 5) Validation

- `npm run lint`, `npm run build`
- In-game: start **level 1** → city layers scroll at different rates with world `scrollX`; level **≠ 1** → previous sky theme.

## 6) Critical fix — parallax must live under `worldScrollRoot`

Parallax was on `app.stage` at index 0 while gates lived under `gameWorldLayer` → `worldScrollRoot` with `x = -scrollX`. The **background did not receive** that translation, so only **UV tile drift** moved the art — often **invisible** vs full-speed gates.

**Fix:** `ParallaxSystem.reparentToWorldScroll(worldScrollRoot)` adds the stack **inside** `worldScrollRoot` at index 0 (behind gate sprites). Horizontal motion is then **~1:1** with world scroll; `tilePosition.x` uses `scroll * (1 - worldLock)` for depth only (`worldLock` ≈ 0.9–1.0).
