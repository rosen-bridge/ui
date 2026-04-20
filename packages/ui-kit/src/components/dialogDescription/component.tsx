import { Typography, TypographyProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogDescriptionOverrides {}

export type DialogDescriptionOwnProps = TypographyProps & {};

export type DialogDescriptionBaseProps = ElementBaseProps<
  typeof Typography,
  DialogDescriptionOwnProps
>;

export type DialogDescriptionProps = OverridableType<
  DialogDescriptionBaseProps,
  DialogDescriptionOverrides,
  never
>;

export const DialogDescriptionBase = ({ ...rest }: DialogDescriptionProps) => {
  return <Typography component="p" {...rest} />;
};

DialogDescriptionBase.displayName = 'DialogDescription';

export const DialogDescription = Wrap(DialogDescriptionBase);
