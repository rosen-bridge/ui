import { Palette, PaletteColor } from '@rosen-bridge/ui-kit';

export type AugmentedPalette = {
  [Key in keyof Palette as Palette[Key] extends PaletteColor
    ? Key
    : never]: PaletteColor;
};
