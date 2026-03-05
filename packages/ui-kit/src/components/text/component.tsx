import { ComponentProps } from 'react';
import { ElementBaseProps, Wrap } from '../../core';
import { OverridableType } from '../../@types';
import { Skeleton, Typography } from '../base';
import { Slot } from '@radix-ui/react-slot';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextOverrides { }

export type TextOwnProps = {
  asChild?: boolean;
  loading?: boolean;
};

export type TextBaseProps = ElementBaseProps<'div', TextOwnProps>;

export type TextOverriddenProps = OverridableType<
  TextBaseProps,
  TextOverrides,
  never
>;

export const TextBase = ({ asChild, children, loading, ...rest }: TextOverriddenProps) => {
  if (asChild) {
    return (
      <Slot {...rest}>
        {loading ? <Skeleton width="80px" /> : children}
      </Slot>
    )
  } else {
    return (
      <Typography component="div" {...rest}>
        {loading ? <Skeleton width="80px" /> : children}
      </Typography>
    )
  }
};

TextBase.displayName = 'Text';

export const Text = Wrap(TextBase);

export type TextProps = ComponentProps<typeof Text>;
