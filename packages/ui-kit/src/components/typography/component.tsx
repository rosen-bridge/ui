import { type ElementType, useMemo } from 'react';

import { mergeProps } from '@base-ui/react/merge-props';

import { Skeleton } from '@/components';
import { useConfig } from '@/hooks';
import type { Color, ElementBaseProps, OverridableType } from '@/types';
import { toCSSColor } from '@/utils';

import './styles.css';
export interface TypographyOverrides {}

export type TypographyOwnProps<T extends ElementType = 'p'> = {
  as?: T;
  align?: 'center' | 'left' | 'right';
  color?: Color;
  loading?: boolean;
  uppercase?: boolean;
  noWrap?: boolean;
  bold?: number;
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'body1'
    | 'body2'
    | 'body3'
    | 'label1'
    | 'label2'
    | 'code1'
    | 'code2'
    | 'button1'
    | 'button2'
    | 'button3'
    | 'display1'
    | 'display2'
    | 'display3';
};

export type TypographyBaseProps<T extends ElementType = 'p'> = ElementBaseProps<
  T,
  TypographyOwnProps<T>
>;

export type TypographyProps<T extends ElementType = 'p'> = OverridableType<
  TypographyBaseProps<T>,
  TypographyOverrides,
  'color'
>;

export const Typography = <T extends ElementType = 'p'>(props: TypographyProps<T>) => {
  const {
    as: Component = 'p',
    align,
    children,
    className,
    color,
    bold,
    noWrap,
    loading,
    style,
    uppercase,
    variant = 'body2',
    ...rest
    // biome-ignore lint/suspicious/noExplicitAny: generic types compatibility
  } = useConfig('Typography', props as any);

  const styles = useMemo(
    () => ({
      '--rosen-typography-color': toCSSColor(color),
      '--rosen-typography-bold': bold,
      ...style,
    }),
    [color, bold, style],
  );

  return (
    <Component
      {...mergeProps(
        {
          className: `RosenTypography-${variant}`,
          'data-uppercase': uppercase,
          'data-nowrap': noWrap,
          'data-align': align,
          style: styles,
        },

        {
          className,
          ...rest,
        },
      )}
    >
      {children}
      {loading && <Skeleton attached />}
    </Component>
  );
};

Typography.displayName = 'Typography';
