import { ComponentProps } from 'react';

import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogFooterOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type DialogFooterOwnProps = {};

export type DialogFooterBaseProps = ElementBaseProps<
  'div',
  DialogFooterOwnProps
>;

export type DialogFooterOverriddenProps = OverridableType<
  DialogFooterBaseProps,
  DialogFooterOverrides,
  never
>;

export const DialogFooterBase = ({ ...rest }: DialogFooterOverriddenProps) => {
  return <Root {...rest} />;
};

DialogFooterBase.displayName = 'DialogFooter';

export const DialogFooter = Wrap(DialogFooterBase);

export type DialogFooterProps = ComponentProps<typeof DialogFooter>;
