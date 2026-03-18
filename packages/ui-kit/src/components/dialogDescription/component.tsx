import { ComponentProps } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogDescriptionOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type DialogDescriptionOwnProps = {};

export type DialogDescriptionBaseProps = ElementBaseProps<
  'div',
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
  return <Root {...rest} />;
};

DialogDescriptionBase.displayName = 'DialogDescription';

export const DialogDescription = Wrap(DialogDescriptionBase);

export type DialogDescriptionProps = ComponentProps<typeof DialogDescription>;
