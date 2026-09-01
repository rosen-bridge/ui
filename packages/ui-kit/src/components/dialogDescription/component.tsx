import type { ElementType } from 'react';

import { Typography, type TypographyProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface DialogDescriptionOverrides {}

export type DialogDescriptionOwnProps<T extends ElementType = 'p'> = TypographyProps<T> & {};

export type DialogDescriptionBaseProps<T extends ElementType = 'p'> = ElementBaseProps<
  T,
  DialogDescriptionOwnProps<T>
>;

export type DialogDescriptionProps<T extends ElementType = 'p'> = OverridableType<
  DialogDescriptionBaseProps<T>,
  DialogDescriptionOverrides,
  never
>;

export const DialogDescription = <T extends ElementType = 'p'>(
  props: DialogDescriptionProps<T>,
) => {
  /**
   * TODO: remove the inline Biome comment
   * local:ergo/rosen-bridge/ui#441
   */
  // biome-ignore lint/suspicious/noExplicitAny: Use a better type
  const { ...rest } = useConfig('DialogDescription', props as any);

  return <Typography as="p" data-surface="title" {...rest} />;
};

DialogDescription.displayName = 'DialogDescription';
