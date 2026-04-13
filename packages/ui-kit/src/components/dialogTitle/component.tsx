import { Typography, TypographyProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogTitleOverrides {}

export type DialogTitleOwnProps = TypographyProps & {};

export type DialogTitleBaseProps = ElementBaseProps<
  typeof Typography,
  DialogTitleOwnProps
>;

export type DialogTitleProps = OverridableType<
  DialogTitleBaseProps,
  DialogTitleOverrides,
  never
>;

export const DialogTitleBase = ({ ...rest }: DialogTitleProps) => {
  // TODO: use Root element
  return <Typography component="h2" {...rest} />;
};

DialogTitleBase.displayName = 'DialogTitle';

export const DialogTitle = Wrap(DialogTitleBase);
