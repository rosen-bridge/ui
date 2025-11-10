type Name =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success';

type Shade = 'light' | 'main' | 'dark' | 'contrastText';

export type Colors =
  | 'inherit'
  | `${Name}.${Shade}`
  | Name
  | 'background'
  | 'background.default'
  | 'background.paper'
  | 'text.primary'
  | 'text.secondary'
  | 'text.disabled';

/**
 * Normalizes a given color token to a valid theme color reference.
 * For plain names (e.g. "primary"), returns the ".main" shade.
 * For "background", maps to "background.default".
 */
export const ensureColor = (color: Colors) => {
  switch (color) {
    case 'background':
      return `${color}.default`;
    case 'primary':
    case 'secondary':
    case 'error':
    case 'warning':
    case 'info':
    case 'success':
      return `${color}.main`;
    default:
      return color;
  }
};
