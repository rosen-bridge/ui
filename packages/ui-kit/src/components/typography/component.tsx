import type { ElementType } from 'react';

import { Skeleton } from '@/components';
import { useConfig } from '@/hooks';
import type { Color, ElementBaseProps, OverridableType } from '@/types';
import { toCSSColor } from '@/utils';

import './styles.css';
export interface TypographyOverrides {}

export type TypographyOwnProps<T extends ElementType = 'p'> = {
  align?: 'center' | 'left' | 'justify' | 'right';
  as?: T;
  color?: Color;
  loading?: boolean;
  transform?: 'none' | 'uppercase';
  truncate?: boolean;
  variant?:
    | 'inherit'
    | 'display1'
    | 'display2'
    | 'display3'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'heading4'
    | 'body1'
    | 'body2'
    | 'body3'
    | 'label1'
    | 'label2'
    | 'button1'
    | 'button2'
    | 'button3'
    | 'code1'
    | 'code2';
  weight?: 'bold' | 'normal';
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
    align,
    as: Component = 'p',
    children,
    color,
    loading,
    style,
    transform = 'none',
    truncate,
    variant = 'body2',
    weight = 'normal',
    ...rest
    // biome-ignore lint/suspicious/noExplicitAny: generic types compatibility
  } = useConfig('Typography', props as any);

  const styles = {
    '--rosen-typography-color': toCSSColor(color),
    ...style,
  };

  return (
    <Component
      data-align={align}
      data-transform={transform}
      data-truncate={truncate ? '' : null}
      data-variant={variant}
      data-weight={weight}
      style={styles}
      {...rest}
    >
      {children}
      {loading && <Skeleton attached />}
    </Component>
  );
};

Typography.displayName = 'Typography';
