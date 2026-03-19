import { ComponentProps } from 'react';

import { OverridableType } from '@/types';
import { Typography, TypographyProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogDescriptionOverrides {}

export type DialogDescriptionOwnProps = TypographyProps & {};

export type DialogDescriptionBaseProps = ElementBaseProps<
  typeof Typography,
  DialogDescriptionOwnProps
>;

export type DialogDescriptionOverriddenProps = OverridableType<
  DialogDescriptionBaseProps,
  DialogDescriptionOverrides,
  never
>;

export const DialogDescriptionBase = ({
  ...rest
}: DialogDescriptionOverriddenProps) => {
  // TODO: use Root element
  return <Typography component="p" {...rest} />;
};

DialogDescriptionBase.displayName = 'DialogDescription';

export const DialogDescription = Wrap(DialogDescriptionBase);

export type DialogDescriptionProps = ComponentProps<typeof DialogDescription>;
