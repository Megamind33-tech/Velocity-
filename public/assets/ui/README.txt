Optional Pixi UI skins (loaded at runtime if present):

  /assets/ui/btn_default.png
  /assets/ui/btn_hover.png
  /assets/ui/btn_pressed.png

If you add these, you can swap FancyButton views in src/ui/pixiGameButton.ts
to use Texture.from('/assets/ui/...') instead of procedural Graphics.

Nine-slice: use FancyButton nineSliceSprite + Kenney or custom atlas slices.
