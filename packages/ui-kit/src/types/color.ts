import { OverridableValue } from './overridableValue';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ColorOverrides {}

export type Color = OverridableValue<DefaultColor, ColorOverrides>;

type ColorName =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'neutral';

type ColorShade = 'light' | 'dark' | 'contrastText';

export type DefaultColor =
  | 'inherit'
  | 'transparent'
  | `${ColorName}-${ColorShade}`
  | ColorName
  | 'background'
  | 'background-default'
  | 'background-paper'
  | 'text-primary'
  | 'text-secondary'
  | 'text-disabled';
