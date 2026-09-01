import type { ElementType } from 'react';

import { Typography, type TypographyProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface CardTitleOverrides {}

export type CardTitleOwnProps<T extends ElementType = 'h2'> = TypographyProps<T> & {};

export type CardTitleBaseProps<T extends ElementType = 'h2'> = ElementBaseProps<
  T,
  CardTitleOwnProps<T>
>;

export type CardTitleProps<T extends ElementType = 'h2'> = OverridableType<
  CardTitleBaseProps<T>,
  CardTitleOverrides,
  never
>;

export const CardTitle = <T extends ElementType = 'h2'>(props: CardTitleProps<T>) => {
  /**
   * TODO: remove the inline Biome comment
   * local:ergo/rosen-bridge/ui#441
   */
  // biome-ignore lint/suspicious/noExplicitAny: Use a better type
  const { ...rest } = useConfig('CardTitle', props as any);

  return <Typography as="h2" data-surface="title" {...rest} />;
};

CardTitle.displayName = 'CardTitle';
