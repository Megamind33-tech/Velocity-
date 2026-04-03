Velocity — UI art (Pixi canvas)

Kenney UI Pack (in-game chrome)
-------------------------------
Folder: public/kenney-ui-pack/
Source: https://kenney.nl/assets/ui-pack (CC0)

Runtime mapping: src/ui/game/velocityUiArt.ts
Nine-slice insets: src/ui/game/velocityUiSlice.ts (Kenney rectangles: L/R 56, T/B 20; slides differ)

Buttons use Blue / Grey / Yellow / Red `button_rectangle_depth_*` variants from the pack.

In-game skin (code)
-------------------
- velocityScreenShell.ts — animated starfield + dimmer behind menus / map / pause
- velocityModalLayout.ts — framed modals (nine-slice panel)
- velocityUiButtons.ts — uniform buttons (nine-slice when textures load)
- kenneyNineSlice.ts — nine-slice helpers + horizontal progress tiling (Kenney slide strips)
- menuLandscape/kenneyLandscapeWidgets.ts — landscape chrome built on the same textures
