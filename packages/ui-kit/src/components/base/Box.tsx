import type { ForwardRefExoticComponent, RefAttributes } from 'react';

import { Box as BoxMUI } from '@mui/material';
import type { BoxProps as BoxMUIProps } from '@mui/material';

import {
  InjectOverrides,
  type InjectOverridesProps,
} from '../common/InjectOverrides';

export type BoxProps = InjectOverridesProps<BoxMUIProps>;

export const Box: ForwardRefExoticComponent<
  Omit<BoxProps, 'ref'> & RefAttributes<unknown>
> = InjectOverrides<BoxMUIProps>(BoxMUI);
