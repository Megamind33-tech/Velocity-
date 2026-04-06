# City Parallax pixel art (OpenGameArt)

- **Source:** [City Parallax pixel art](https://opengameart.org/content/city-parallax-pixel-art)  
- **Author:** Gustavo Saraiva  
- **License:** [CC0](https://creativecommons.org/publicdomain/zero/1.0/)  
- **Archive:** `City.zip` from the OGA page — **240×135 px** per layer, RGBA PNG.

## Files in this folder (renamed from zip)

| This repo | Original in `City.zip` |
|-----------|-------------------------|
| `layer_background_1.png` | `Background 1.png` |
| `layer_bg.png` | `BG.png` |
| `layer_middle.png` | `Middle.png` |
| `layer_foreground.png` | `Foreground.png` |

**Back → front** for parallax: Background 1 → BG → Middle → Foreground (farthest scrolls slowest).

## Usage

Loaded only for **level 1** gameplay in `main.ts` via `Assets.load`, `TilingSprite`, **nearest** filtering (pixel art), `tileScale` = `screenHeight / 135`.
