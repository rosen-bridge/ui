import { HTMLAttributes } from 'react';

import { DividerMui } from '../base';
import { InjectOverrides } from './InjectOverrides';

type Palette =
  | 'primary'
  | 'secondary'
  | 'background'
  | 'neutral'
  | 'error'
  | 'warning'
  | 'success'
  | 'info'
  | 'text';

type Shade =
  | 'main'
  | 'light'
  | 'dark'
  | 'contrastText'
  | 'default'
  | 'paper'
  | 'shadow';

export type ThemeColor = `${Palette}.${Shade}`;

export type DividerNewProps = HTMLAttributes<HTMLHRElement> & {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'fullWidth' | 'middle';
  color?: ThemeColor;
};

const DividerBase = ({
  orientation,
  variant,
  color,
  ...props
}: DividerNewProps) => {
  return (
    <DividerMui
      variant={variant ?? 'fullWidth'}
      orientation={orientation}
      sx={{
        borderColor: color,
      }}
      {...props}
    />
  );
};

export const DividerNew = InjectOverrides(DividerBase);
