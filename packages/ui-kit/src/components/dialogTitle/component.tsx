import { ComponentProps } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Wrap } from '@/core';

import './styles.scss';
import { Typography, TypographyProps } from '@/components';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogTitleOverrides {}

export type DialogTitleOwnProps = TypographyProps & {};

export type DialogTitleBaseProps = ElementBaseProps<typeof Typography, DialogTitleOwnProps>;

export type DialogTitleOverriddenProps = OverridableType<
  DialogTitleBaseProps,
  DialogTitleOverrides,
  never
>;

export const DialogTitleBase = ({
  ...rest
}: DialogTitleOverriddenProps) => {
  return <Typography component="h2" {...rest} />;
};

DialogTitleBase.displayName = 'DialogTitle';

export const DialogTitle = Wrap(DialogTitleBase);

export type DialogTitleProps = ComponentProps<typeof DialogTitle>;
