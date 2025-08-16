import {
  Avatar as AvatarMui,
  AvatarProps as AvatarPropsMui,
  Theme,
} from '@mui/material';

export type Palette =
  | 'primary'
  | 'secondary'
  | 'background'
  | 'neutral'
  | 'error'
  | 'warning'
  | 'success'
  | 'info'
  | 'text';

/**
 * Shades available in the theme palette keys.
 * Examples: "main", "light", "dark", "contrastText", "default", "paper", "shadow"
 */
export type Shade =
  | 'main'
  | 'light'
  | 'dark'
  | 'contrastText'
  | 'default'
  | 'paper'
  | 'shadow';

/**
 * Represents a theme-aware color string in the form of
 * `${Palette}.${Shade}`, e.g. `"primary.main"` or `"background.paper"`.
 */
type ThemeColor = `${Palette}.${Shade}`;

export type AvatarProps = AvatarPropsMui & {
  /**
   * Background color of the Avatar.
   *
   * Accepts either:
   * - A theme palette key in the form `"palette.shade"`, e.g. `"primary.main"` or `"background.paper"`.
   * - A valid CSS color string (e.g. `#FF0000`, `rgb(255,0,0)`, `red`).
   */
  background?: ThemeColor | string;

  /**
   * Text color inside the Avatar.
   *
   * Accepts either:
   * - A theme palette key in the form `"palette.shade"`, e.g. `"text.primary"` or `"secondary.contrastText"`.
   * - A valid CSS color string.
   */
  color?: ThemeColor | string;
};

const resolveColor = (theme: Theme, value?: string): string | undefined => {
  if (!value) return undefined;

  if (value.includes('.')) {
    const [palette, shade] = value.split('.') as [
      keyof Theme['palette'],
      string,
    ];

    const paletteSection = theme.palette[palette];

    if (
      paletteSection &&
      typeof paletteSection === 'object' &&
      shade in paletteSection
    ) {
      const result = paletteSection[shade as keyof typeof paletteSection];
      return typeof result === 'string' ? result : String(result);
    }
  }

  return value;
};

/**
 * A theme-aware Avatar component based on MUI Avatar.
 * Supports both theme palette keys and raw CSS color values for
 * background and text colors.
 */
export const Avatar = ({ background, color, ...props }: AvatarProps) => {
  return (
    <AvatarMui
      sx={(theme) => ({
        backgroundColor: resolveColor(theme, background),
        color: resolveColor(theme, color),
      })}
      {...props}
    />
  );
};
