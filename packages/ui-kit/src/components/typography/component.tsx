import { ComponentProps } from 'react';

import {
  Typography as TypographyMUI,
  TypographyProps as TypographyPropsMUI,
} from '@mui/material';

import { Skeleton } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { ColorOverridden, OverridableType } from '@/types';
import { toCSSColor } from '@/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TypographyOverrides {}

export type TypographyOwnProps = TypographyPropsMUI & {
  color?: ColorOverridden;
  loading?: boolean;
};

export type TypographyBaseProps = ElementBaseProps<
  typeof TypographyMUI,
  TypographyOwnProps
>;

export type TypographyOverriddenProps = OverridableType<
  TypographyBaseProps,
  TypographyOverrides,
  'color'
>;

export const TypographyBase = ({
  children,
  color,
  loading,
  style,
  ...rest
}: TypographyOverriddenProps) => {
  return (
    <TypographyMUI style={{ color: toCSSColor(color), ...style }} {...rest}>
      {children}
      {loading && <Skeleton attached />}
    </TypographyMUI>
  );
};

TypographyBase.displayName = 'Typography';

export const Typography = Wrap(TypographyBase);

export type TypographyProps = ComponentProps<typeof Typography>;
