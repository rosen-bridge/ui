import type { ElementType } from 'react';

import { Typography, type TypographyProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface DialogTitleOverrides {}

export type DialogTitleOwnProps<T extends ElementType = 'h2'> = TypographyProps<T> & {};

export type DialogTitleBaseProps<T extends ElementType = 'h2'> = ElementBaseProps<
  T,
  DialogTitleOwnProps<T>
>;

export type DialogTitleProps<T extends ElementType = 'h2'> = OverridableType<
  DialogTitleBaseProps<T>,
  DialogTitleOverrides,
  never
>;

export const DialogTitle = <T extends ElementType = 'h2'>(props: DialogTitleProps<T>) => {
  /**
   * TODO: remove the inline Biome comment
   * local:ergo/rosen-bridge/ui#441
   */
  // biome-ignore lint/suspicious/noExplicitAny: Use a better type
  const { ...rest } = useConfig('DialogTitle', props as any);

  return <Typography as="h2" data-surface="title" {...rest} />;
};

DialogTitle.displayName = 'DialogTitle';
