import { Palette, PaletteColor } from '@mui/material';

export type AugmentedPalette = {
  [Key in keyof Palette as Palette[Key] extends PaletteColor
    ? Key
    : never]: PaletteColor;
};
