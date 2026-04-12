import type { ComponentProps } from 'react';

import { Box as BoxMUI } from '@mui/material';

import { Wrap } from '@/core';

export const Box = Wrap(BoxMUI);

export type BoxProps = ComponentProps<typeof Box>;
