import { Box as BoxMUI } from '@mui/material';
import type { BoxProps as BoxMUIProps } from '@mui/material';

import {
  InjectOverrides,
  type InjectOverridesProps,
} from '../common/InjectOverrides';

export const Box = InjectOverrides(BoxMUI);
export type BoxProps = InjectOverridesProps<BoxMUIProps>;
