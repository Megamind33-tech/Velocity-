# OpenGameArt — player plane sprites

Normalized PNGs in this folder are derived from the following OGA entries (Velocity flight game).

## Regeneration (repo)

All five PNGs in this folder are **rebuilt from the same OGA sources** by
`scripts/process_plane_sprites.py` so each craft is a **single isolated sprite**
(no UV sheet filler, no shared grey backdrop):

- **Fighters:** alpha cleanup + **largest connected blob only** (source crops often had **two stacked planes** in one file).
- **Cartoon:** chroma separation from grey studio background → **largest** opaque silhouette (drops HUD/debris islands).
- **Jets:** border-seeded flood removal of UV “hull” + **largest connected alpha
  component** so only one aircraft patch remains (`plane_interceptor_jet.png`,
  `plane_liner.png`).

Run from repo root: `python3 scripts/process_plane_sprites.py`

## `plane_cadet.png` / `plane_scout.png` (CC-BY 3.0, derived)

- **Source sheet:** [Fighter planes ww2 theme](https://opengameart.org/content/fighter-planes-ww2-theme) — `fighters.png` (342×306, not kept in repo to save size).
- **Author:** Nick (submitted by Anonymous)
- **License:** [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/)
- **Derivation:** Cropped regions — left fighter → `plane_cadet.png`, right half fighter → `plane_scout.png`; then processed by `process_plane_sprites.py` for clean alpha.

## `plane_interceptor_jet.png` (CC0, derived)

- **Source:** [Private Jet](https://opengameart.org/content/private-jet) — `privatejet_tex_blue.png` (1024² UV map; not kept in repo).
- **Author:** weirdybeardyman
- **License:** [CC0](https://creativecommons.org/publicdomain/zero/1.0/)
- **Derivation:** **420×420 center crop** + mild contrast; then UV hull stripped and largest plane island kept via `process_plane_sprites.py`.

## `plane_cartoon.png` (CC0, derived)

- **Source:** [Low poly cartoon plane](https://opengameart.org/content/low-poly-cartoon-plane) — `CartoonPlane.zip` → `Plane.png` (512² render; ZIP not kept in repo).
- **Author:** alpaqagames
- **License:** [CC0](https://creativecommons.org/publicdomain/zero/1.0/)
- **Derivation:** Original render cropped; grey backdrop removed via chroma-vs-grey mask in `process_plane_sprites.py` (single craft silhouette).

## `plane_liner.png` (CC0, derived)

- **Source:** [Jet airplane](https://opengameart.org/content/jet-airplane) — `passengerjet_tex_plain.png` (1024² UV; file not kept in repo).
- **Author:** weirdybeardyman
- **License:** [CC0](https://creativecommons.org/publicdomain/zero/1.0/)
- **Derivation:** **400×400 center crop** + mild contrast; then UV hull stripped + largest jet island (`process_plane_sprites.py`).

## [Scifi Plane](https://opengameart.org/content/scifi-plane) (CC-BY 3.0, Ulf)

- **3D model + PBR textures** (ZIP). **Not bundled** — would require a 2D render or separate pipeline. Velocity uses the **2D fighters** + **jet texture** above for immediate Pixi `Sprite` use.

## Attribution (CC-BY 3.0)

Where required by license, credit in-game or credits screen:

- Fighters sheet: **Nick** — [Fighter planes ww2 theme](https://opengameart.org/content/fighter-planes-ww2-theme) (CC-BY 3.0)
- Scifi Plane (if used later): **Ulf** — model and texture (CC-BY 3.0)

CC0 assets (Private Jet) need no attribution but may be credited as **weirdybeardyman / OpenGameArt**.
