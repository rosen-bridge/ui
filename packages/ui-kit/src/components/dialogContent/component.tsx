import { ComponentProps } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogContentOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type DialogContentOwnProps = {};

export type DialogContentBaseProps = ElementBaseProps<
  'div',
  DialogContentOwnProps
>;

export type DialogContentOverriddenProps = OverridableType<
  DialogContentBaseProps,
  DialogContentOverrides,
  never
>;

export const DialogContentBase = ({
  ...rest
}: DialogContentOverriddenProps) => {
  return <div {...rest} />;
};

DialogContentBase.displayName = 'DialogContent';

export const DialogContent = Wrap(DialogContentBase);

export type DialogContentProps = ComponentProps<typeof DialogContent>;
