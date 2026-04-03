Velocity — UI art (Pixi canvas)

SunGraphica Sci-Fi Game UI (in-game chrome)
-------------------------------------------
Folder: public/sungraphica-ui/
Source: https://sungraphica.itch.io/sci-fi-game-user-interface
Credit: SunGraphica (per pack license)

Runtime mapping: src/ui/game/velocityUiArt.ts
Nine-slice tuning: src/ui/game/velocityUiSlice.ts

In-game skin (code)
-------------------
- velocityScreenShell.ts — animated starfield + dimmer behind menus / map / pause
- velocityModalLayout.ts — framed modals (nine-slice panel)
- velocityUiButtons.ts — uniform buttons (nine-slice when textures load)
- kenneyNineSlice.ts — nine-slice helpers + horizontal progress tiling (SunGraphica textures)

Legacy (not used by velocityUiArt)
----------------------------------
- public/kenney-ui-pack/ — kept for reference only; game loads SunGraphica paths above.
