Velocity — UI art (Pixi canvas)

Kenney UI Pack (only pack used in-game)
---------------------------------------
Folder: public/kenney-ui-pack/
Source: https://kenney.nl/assets/ui-pack
License: CC0 — see License.txt in folder

Vector sources: kenney-ui-pack/Vector/
Runtime mapping: src/ui/game/velocityUiArt.ts

In-game skin (code)
--------------------
- velocityScreenShell.ts — animated starfield + dimmer behind menus / map / pause
- velocityModalLayout.ts — framed modals (input fill + outline nine-slice)
- velocityUiButtons.ts — uniform primary/secondary/accent/danger/success buttons
- kenneyNineSlice.ts — HUD slide bar (horizontal strip tiling)
- Parallax during runs uses Kenney slide_track + panel_fill + procedural stars when art is loaded
