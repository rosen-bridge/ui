import { ComponentProps } from 'react';

import {
  Typography as TypographyMUI,
  TypographyProps as TypographyPropsMUI,
} from '@mui/material';
import { Slot } from '@radix-ui/react-slot';

import { Skeleton } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { ColorOverridden, OverridableType } from '@/types';
import { toCSSColor } from '@/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TypographyOverrides {}

export type TypographyOwnProps = TypographyPropsMUI & {
  asChild?: boolean;
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
  asChild,
  children,
  color,
  loading,
  ...rest
}: TypographyOverriddenProps) => {
  if (asChild) {
    return <Slot {...rest}>{loading ? <Skeleton attached /> : children}</Slot>;
  } else {
    // TODO
    return (
      <TypographyMUI style={{ color: toCSSColor(color) }} {...rest}>
        {children}
        {loading && <Skeleton attached />}
      </TypographyMUI>
    );
  }
};

TypographyBase.displayName = 'Typography';

export const Typography = Wrap(TypographyBase);

export type TypographyProps = ComponentProps<typeof Typography>;
