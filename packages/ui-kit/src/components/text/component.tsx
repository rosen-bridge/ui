import type { ElementType } from 'react';

import { Skeleton } from '@/components';
import { useConfig } from '@/hooks';
import type { Color, ElementBaseProps, OverridableType } from '@/types';
import { toCSSColor } from '@/utils';

import './styles.css';

export interface TextOverrides {}

const map: Record<NonNullable<TextProps['variant']>, ElementType> = {
  inherit: 'span',
  display1: 'h1',
  display2: 'h2',
  display3: 'h3',
  heading1: 'h1',
  heading2: 'h2',
  heading3: 'h3',
  heading4: 'h4',
  body1: 'p',
  body2: 'p',
  body3: 'p',
  label1: 'label',
  label2: 'label',
  button1: 'span',
  button2: 'span',
  button3: 'span',
  code1: 'code',
  code2: 'code',
};

export type TextOwnProps<T extends ElementType = 'p'> = {
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

export type TextBaseProps<T extends ElementType = 'p'> = ElementBaseProps<T, TextOwnProps<T>>;

export type TextProps<T extends ElementType = 'p'> = OverridableType<
  TextBaseProps<T>,
  TextOverrides,
  'color'
>;

export const Text = <T extends ElementType = 'p'>(props: TextProps<T>) => {
  const {
    align,
    as,
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
  } = useConfig('Text', props as any);

  const Component = as ?? map[variant as NonNullable<TextProps['variant']>];

  const styles = {
    '--rosen-text-color': toCSSColor(color),
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

Text.displayName = 'Text';
