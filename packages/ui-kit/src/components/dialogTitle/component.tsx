import { ComponentProps, ElementType } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogTitleOverrides {}

export type DialogTitleOwnProps = {
  as?: ElementType;
};

export type DialogTitleBaseProps = ElementBaseProps<'h2', DialogTitleOwnProps>;

export type DialogTitleOverriddenProps = OverridableType<
  DialogTitleBaseProps,
  DialogTitleOverrides,
  never
>;

export const DialogTitleBase = ({
  as = 'h2',
  ...rest
}: DialogTitleOverriddenProps) => {
  return <Root as={as} {...rest} />;
};

DialogTitleBase.displayName = 'DialogTitle';

export const DialogTitle = Wrap(DialogTitleBase);

export type DialogTitleProps = ComponentProps<typeof DialogTitle>;
